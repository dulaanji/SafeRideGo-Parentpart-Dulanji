const mongoose = require('mongoose');
const { Schema } = mongoose;
const owner = { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true };

const Parent = mongoose.model('Parent', new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  notifyBeforeMin: { type: Number, default: 5, min: 1, max: 30 },
  channels: {
    app: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
  },
}, { timestamps: true }));

const Child = mongoose.model('Child', new Schema({
  parent: owner,
  name: { type: String, required: true, trim: true },
  grade: { type: String, default: '' },
  school: { type: String, default: 'SLIIT College' },
  vanNo: { type: String, default: 'WP ND-4521' },
}, { timestamps: true }));

const Journey = mongoose.model('Journey', new Schema({
  parent: owner,
  childName: String,
  vanNo: { type: String, default: 'WP ND-4521' },
  driverName: { type: String, default: 'Kasun Perera' },
  driverPhone: { type: String, default: '0771234567' },
  step: { type: Number, default: 2, min: 0, max: 4 },
  delayMin: { type: Number, default: 0 },
  status: { type: String, enum: ['live', 'completed'], default: 'live' },
}, { timestamps: true }));

const PickupNote = mongoose.model('PickupNote', new Schema({
  parent: owner,
  text: { type: String, required: true, trim: true },
}, { timestamps: true }));

const Trip = mongoose.model('Trip', new Schema({
  parent: owner,
  title: String,
  date: Date,
  durationMin: Number,
  arrivedAt: String,
}, { timestamps: true }));

const Feedback = mongoose.model('Feedback', new Schema({
  parent: owner,
  trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
}, { timestamps: true }));

const Alert = mongoose.model('Alert', new Schema({
  parent: owner,
  title: String,
  body: String,
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
}, { timestamps: true }));

const Session = mongoose.model('Session', new Schema({
  parent: owner,
  device: { type: String, default: '' },
}, { timestamps: true }));

module.exports = { Session, Parent, Child, Journey, PickupNote, Trip, Feedback, Alert };
