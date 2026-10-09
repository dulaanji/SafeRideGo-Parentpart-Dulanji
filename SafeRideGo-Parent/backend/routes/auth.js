const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Parent, Session } = require('../models');
const seed = require('../seed');
const { h } = require('../middleware');

// ---------------------------------------------------------------
// SMS / OTP settings (all come from .env)
//   SMS_MODE=real  -> send a real SMS through Notify.lk
//   SMS_MODE=demo  -> no SMS, fixed demo code (default)
// ---------------------------------------------------------------
const SMS_REAL = (process.env.SMS_MODE || 'demo').toLowerCase() === 'real';
const DEMO_OTP = '482615';
const OTP_TTL_MS = 5 * 60 * 1000;     // code valid for 5 minutes
const RESEND_GAP_MS = 60 * 1000;      // 1 minute between SMS to same number
const MAX_ATTEMPTS = 5;               // wrong tries before code is cancelled

// phone -> { code, expires, attempts, lastSent }  (in memory; resets if server restarts)
const otpStore = new Map();

const logSession = (p, req) =>
  Session.create({ parent: p._id, device: (req.headers['user-agent'] || '').slice(0, 120) });
const sign = (p) => jwt.sign({ id: p._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// 0785758156 / +94785758156 / 94785758156  ->  94785758156 (format Notify.lk needs)
const toIntl = (phone) => {
  const d = String(phone).replace(/\D/g, '');
  if (d.startsWith('94')) return d;
  if (d.startsWith('0')) return '94' + d.slice(1);
  return '94' + d;
};

async function sendSms(phone, message) {
  const body = new URLSearchParams({
    user_id: process.env.NOTIFY_USER_ID,
    api_key: process.env.NOTIFY_API_KEY,
    sender_id: process.env.NOTIFY_SENDER_ID || 'NotifyDEMO',
    to: toIntl(phone),
    message,
  });
  const r = await fetch('https://app.notify.lk/api/v1/send', { method: 'POST', body });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.status === 'error') {
    console.error('SMS failed:', data);
    throw new Error('Could not send the SMS. Please try again.');
  }
}

// Creates + sends a code. Returns { demoCode } in demo mode, {} in real mode.
async function issueOtp(phone) {
  const old = otpStore.get(phone);
  if (old && Date.now() - old.lastSent < RESEND_GAP_MS) {
    const wait = Math.ceil((RESEND_GAP_MS - (Date.now() - old.lastSent)) / 1000);
    const err = new Error(`Please wait ${wait}s before asking for another code`);
    err.status = 429;
    throw err;
  }
  if (!SMS_REAL) return { demoCode: DEMO_OTP };

  const code = String(crypto.randomInt(100000, 1000000));
  await sendSms(phone, `SafeRideGo: your verification code is ${code}. It expires in 5 minutes.`);
  otpStore.set(phone, { code, expires: Date.now() + OTP_TTL_MS, attempts: 0, lastSent: Date.now() });
  return {};
}

function checkOtp(phone, code) {
  if (!SMS_REAL) return code === DEMO_OTP;
  const rec = otpStore.get(phone);
  if (!rec || Date.now() > rec.expires) return false;
  if (++rec.attempts > MAX_ATTEMPTS) { otpStore.delete(phone); return false; }
  if (code !== rec.code) return false;
  otpStore.delete(phone);
  return true;
}

// wraps issueOtp so errors become proper JSON responses
const tryIssue = async (phone, res) => {
  try { return await issueOtp(phone); }
  catch (e) { res.status(e.status || 502).json({ message: e.message }); return null; }
};

// CREATE parent account
router.post('/register', h(async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ message: 'Name, mobile number and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await Parent.findOne({ phone })) return res.status(409).json({ message: 'This mobile number is already registered' });

  const parent = await Parent.create({ name, phone, passwordHash: await bcrypt.hash(password, 10) });
  await seed(parent._id);

  const sent = await tryIssue(phone, res);
  if (!sent) return; // SMS failed; account exists, user can press "resend" on the verify screen
  res.status(201).json({ message: 'Account created', phone, ...sent });
}));

// Send the code again
router.post('/resend', h(async (req, res) => {
  const { phone } = req.body;
  const parent = await Parent.findOne({ phone });
  if (!parent) return res.status(404).json({ message: 'Account not found' });
  const sent = await tryIssue(phone, res);
  if (!sent) return;
  res.json({ message: 'Code sent', ...sent });
}));

router.post('/verify', h(async (req, res) => {
  const { phone, code } = req.body;
  const parent = await Parent.findOne({ phone });
  if (!parent) return res.status(404).json({ message: 'Account not found' });
  if (!checkOtp(phone, String(code || ''))) return res.status(400).json({ message: 'Wrong or expired verification code' });
  parent.verified = true;
  await parent.save();
  await logSession(parent, req);
  res.json({ token: sign(parent) });
}));

// READ (sign in)
router.post('/login', h(async (req, res) => {
  const { phone, password } = req.body;
  const parent = await Parent.findOne({ phone });
  if (!parent || !(await bcrypt.compare(password || '', parent.passwordHash)))
    return res.status(401).json({ message: 'Wrong mobile number or password' });
  if (!parent.verified) {
    const sent = await tryIssue(phone, res); // not verified yet -> send a fresh code
    if (!sent && res.headersSent) return;
    return res.status(403).json({ message: 'Please verify your number first', needsVerify: true, ...(sent || {}) });
  }
  await logSession(parent, req); // CREATE a sign-in record
  res.json({ token: sign(parent) });
}));

module.exports = router;