const router = require('express').Router();
const { Parent, Child, Journey, PickupNote, Trip, Feedback, Alert, Session,VanLocation } = require('../models');
const { auth, h } = require('../middleware');

router.use(auth);
const notFound = () => Object.assign(new Error('Not found'), { status: 404 });

/* ---------------- PROFILE (Read, Update, Delete) ---------------- */
router.get('/profile', h(async (req, res) => {
  const p = await Parent.findById(req.parentId).select('-passwordHash');
  if (!p) throw notFound();
  res.json(p);
}));

router.put('/profile', h(async (req, res) => {
  const { name, phone, channels, notifyBeforeMin } = req.body;
  const p = await Parent.findById(req.parentId);
  if (!p) throw notFound();
  if (name !== undefined) p.name = name;
  if (phone !== undefined) p.phone = phone;
  if (notifyBeforeMin !== undefined) p.notifyBeforeMin = notifyBeforeMin;
  if (channels) p.channels = { ...p.channels.toObject(), ...channels };
  await p.save();
  res.json(await Parent.findById(p._id).select('-passwordHash'));
}));

router.delete('/profile', h(async (req, res) => {
  const q = { parent: req.parentId };
  await Promise.all([Child, Journey, PickupNote, Trip, Feedback, Alert, Session].map((M) => M.deleteMany(q)));
  await Parent.findByIdAndDelete(req.parentId);
  res.json({ message: 'Account deleted' });
}));

router.get('/sessions', h(async (req, res) => res.json(await Session.find({ parent: req.parentId }).sort('-createdAt').limit(5))));

/* ---------------- CHILDREN (full CRUD) ---------------- */
router.get('/children', h(async (req, res) => res.json(await Child.find({ parent: req.parentId }).sort('createdAt'))));

router.post('/children', h(async (req, res) => {
  const { name, grade, school, vanNo } = req.body;
  if (!name) return res.status(400).json({ message: 'Child name is required' });
  res.status(201).json(await Child.create({ parent: req.parentId, name, grade, school, vanNo }));
}));

router.put('/children/:id', h(async (req, res) => {
  const c = await Child.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, req.body, { new: true, runValidators: true });
  if (!c) throw notFound();
  res.json(c);
}));

router.delete('/children/:id', h(async (req, res) => {
  const c = await Child.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
  if (!c) throw notFound();
  res.json({ message: 'Deleted' });
}));

/* ---------------- JOURNEY (Read, Update) ---------------- */
const stopsFor = (name) => [
  { name: 'Van left the depot', time: '6:00 AM' },
  { name: 'Trip started · 3 stops done', time: '6:15 AM' },
  { name: 'Approaching Pagoda Road', time: 'Expected 6:26 AM' },
  { name: `${name} boarded`, time: "You'll get an alert" },
  { name: 'Arrived at SLIIT College', time: 'Expected 7:10 AM' },
];
const ETA = [30, 15, 6, 4, 0];
const view = (j) => ({
  ...j.toObject(),
  stops: stopsFor(j.childName).map((s, i) => ({ ...s, status: i < j.step ? 'done' : i === j.step ? 'current' : 'pending' })),
  etaMinutes: ETA[j.step] + (j.step < 4 ? j.delayMin : 0),
  progress: Math.round((j.step / 4) * 100),
});
const getJourney = async (parentId) => {
  let j = await Journey.findOne({ parent: parentId });
  if (!j) {
    const c = await Child.findOne({ parent: parentId });
    j = await Journey.create({ parent: parentId, childName: c ? c.name : 'Your child' });
  }
  return j;
};

router.get('/journey/current', h(async (req, res) => res.json(view(await getJourney(req.parentId)))));

// UPDATE: demo button that moves the van to the next stage and creates an alert
router.post('/journey/advance', h(async (req, res) => {
  const j = await getJourney(req.parentId);
  if (j.step < 4) j.step += 1;
  const msgs = {
    1: ['Trip started', 'The van has started the route.'],
    2: ['Van approaching your stop', 'About 5 minutes away'],
    3: [`${j.childName} boarded`, 'Safely on board the van'],
    4: [`${j.childName} reached school`, 'SLIIT College'],
  };
  if (msgs[j.step]) await Alert.create({ parent: req.parentId, title: msgs[j.step][0], body: msgs[j.step][1], type: 'van' });
  if (j.step === 4) {
    j.status = 'completed';
    await Trip.create({ parent: req.parentId, title: 'Home to SLIIT College', date: new Date(), durationMin: 24, arrivedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) });
  }
  await j.save();
  res.json(view(j));
}));

router.post('/journey/reset', h(async (req, res) => {
  const j = await getJourney(req.parentId);
  j.step = 0; j.delayMin = 0; j.status = 'live';
  await j.save();
  res.json(view(j));
}));

router.get('/van/location', h(async (req, res) => {
  const j = await getJourney(req.parentId);
  const v = await VanLocation.findOne({ vanNo: j.vanNo });
  if (!v) return res.json({ live: false });
  const ageSec = Math.round((Date.now() - v.at.getTime()) / 1000);
  res.json({ live: ageSec < 60, lat: v.lat, lng: v.lng, ageSec });
}));

/* ---------------- PICKUP NOTES to driver (full CRUD) ---------------- */
router.get('/notes', h(async (req, res) => res.json(await PickupNote.find({ parent: req.parentId }).sort('-createdAt'))));

router.post('/notes', h(async (req, res) => {
  if (!req.body.text || !req.body.text.trim()) return res.status(400).json({ message: 'Note cannot be empty' });
  res.status(201).json(await PickupNote.create({ parent: req.parentId, text: req.body.text }));
}));

router.put('/notes/:id', h(async (req, res) => {
  const n = await PickupNote.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, { text: req.body.text }, { new: true, runValidators: true });
  if (!n) throw notFound();
  res.json(n);
}));

router.delete('/notes/:id', h(async (req, res) => {
  const n = await PickupNote.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
  if (!n) throw notFound();
  res.json({ message: 'Deleted' });
}));

/* ---------------- TRIP HISTORY + FEEDBACK (Read + full CRUD on feedback) ---------------- */
router.get('/trips', h(async (req, res) => {
  const [trips, fbs] = await Promise.all([
    Trip.find({ parent: req.parentId }).sort('-date'),
    Feedback.find({ parent: req.parentId }),
  ]);
  const byTrip = Object.fromEntries(fbs.map((f) => [String(f.trip), f]));
  res.json(trips.map((t) => ({ ...t.toObject(), feedback: byTrip[String(t._id)] || null })));
}));

router.post('/trips/:id/feedback', h(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, parent: req.parentId });
  if (!trip) throw notFound();
  if (await Feedback.findOne({ trip: trip._id })) return res.status(409).json({ message: 'Feedback already given. Edit it instead.' });
  res.status(201).json(await Feedback.create({ parent: req.parentId, trip: trip._id, rating: req.body.rating, comment: req.body.comment }));
}));

router.put('/feedback/:id', h(async (req, res) => {
  const f = await Feedback.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, { rating: req.body.rating, comment: req.body.comment }, { new: true, runValidators: true });
  if (!f) throw notFound();
  res.json(f);
}));

router.delete('/feedback/:id', h(async (req, res) => {
  const f = await Feedback.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
  if (!f) throw notFound();
  res.json({ message: 'Deleted' });
}));

/* ---------------- ALERTS (Read, Update, Delete, Create) ---------------- */
router.get('/alerts', h(async (req, res) => {
  const q = { parent: req.parentId };
  if (req.query.unread === 'true') q.read = false;
  res.json(await Alert.find(q).sort('-createdAt'));
}));

router.put('/alerts/read-all', h(async (req, res) => {
  await Alert.updateMany({ parent: req.parentId, read: false }, { read: true });
  res.json({ message: 'All marked as read' });
}));

router.put('/alerts/:id', h(async (req, res) => {
  const a = await Alert.findOneAndUpdate({ _id: req.params.id, parent: req.parentId }, { read: req.body.read !== false }, { new: true });
  if (!a) throw notFound();
  res.json(a);
}));

router.delete('/alerts/:id', h(async (req, res) => {
  const a = await Alert.findOneAndDelete({ _id: req.params.id, parent: req.parentId });
  if (!a) throw notFound();
  res.json({ message: 'Deleted' });
}));

// CREATE: "Simulate a 10-minute delay" (profile screen)
router.post('/alerts/simulate-delay', h(async (req, res) => {
  const j = await getJourney(req.parentId);
  j.delayMin += 10;
  await j.save();
  const a = await Alert.create({ parent: req.parentId, title: 'Van running late', body: `Delayed by ${j.delayMin} minutes`, type: 'delay' });
  res.status(201).json(a);
}));

module.exports = router;
