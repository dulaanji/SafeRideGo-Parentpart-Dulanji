const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Parent, Session } = require('../models');
const seed = require('../seed');
const { h } = require('../middleware');

const DEMO_OTP = '482615'; // demo mode, same as the prototype
const logSession = (p, req) => Session.create({ parent: p._id, device: (req.headers['user-agent'] || '').slice(0, 120) });
const sign = (p) => jwt.sign({ id: p._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// CREATE parent account
router.post('/register', h(async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) return res.status(400).json({ message: 'Name, mobile number and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await Parent.findOne({ phone })) return res.status(409).json({ message: 'This mobile number is already registered' });
  const parent = await Parent.create({ name, phone, passwordHash: await bcrypt.hash(password, 10) });
  await seed(parent._id);
  res.status(201).json({ message: 'Account created', phone, demoCode: DEMO_OTP });
}));

router.post('/verify', h(async (req, res) => {
  const { phone, code } = req.body;
  const parent = await Parent.findOne({ phone });
  if (!parent) return res.status(404).json({ message: 'Account not found' });
  if (code !== DEMO_OTP) return res.status(400).json({ message: 'Wrong verification code' });
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
  if (!parent.verified) return res.status(403).json({ message: 'Please verify your number first', needsVerify: true });
  await logSession(parent, req); // CREATE a sign-in record
  res.json({ token: sign(parent) });
}));

module.exports = router;
