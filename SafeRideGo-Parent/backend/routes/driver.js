const path = require('path');
const router = require('express').Router();
const { VanLocation } = require('../models');
const { h } = require('../middleware');

// Driver key: DRIVER_KEY from .env. If it is missing, the key is "driver_secret_123" (demo only).
const KEY = (process.env.DRIVER_KEY || 'driver123').trim();
if (!process.env.DRIVER_KEY) console.log('Driver page: DRIVER_KEY not found in .env, using the default key "driver_secret_123"');

const needKey = (req, res, next) => {
  const sent = String(req.headers['x-driver-key'] || '').trim();
  if (sent !== KEY) {
    console.log('Driver key rejected. Key typed on the page has ' + sent.length + ' characters, the server expects ' + KEY.length + '.');
    return res.status(401).json({ message: 'Wrong driver key' });
  }
  next();
};

// Driver page:  http://localhost:5000/api/driver
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'driver.html')));

// Driver page sends the van position here every few seconds
router.post('/location', needKey, h(async (req, res) => {
  const { vanNo } = req.body;
  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);
  if (!vanNo || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return res.status(400).json({ message: 'vanNo, lat and lng are required' });
  await VanLocation.findOneAndUpdate({ vanNo }, { lat, lng, at: new Date() }, { upsert: true, new: true });
  res.json({ ok: true });
}));

module.exports = router;