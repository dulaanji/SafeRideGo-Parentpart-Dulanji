const { Child, Journey, Trip, Alert } = require('./models');

// Gives every new parent some starting data so the app is not empty.
module.exports = async function seed(parentId) {
  await Child.create({ parent: parentId, name: 'Nethmi P.', grade: 'Grade 6' });
  await Journey.create({ parent: parentId, childName: 'Nethmi P.' });
  const day = 24 * 3600 * 1000;
  await Trip.insertMany([
    { parent: parentId, title: 'Home to SLIIT College', date: new Date(), durationMin: 24, arrivedAt: '7:02 AM' },
    { parent: parentId, title: 'Home to SLIIT College', date: new Date(Date.now() - day), durationMin: 26, arrivedAt: '7:05 AM' },
    { parent: parentId, title: 'Home to SLIIT College', date: new Date(Date.now() - 2 * day), durationMin: 23, arrivedAt: '7:01 AM' },
  ]);
  await Alert.insertMany([
    { parent: parentId, title: 'Van approaching your stop', body: 'About 5 minutes away', type: 'van' },
    { parent: parentId, title: 'Nethmi reached school', body: 'SLIIT College, 7:02 AM', type: 'school' },
  ]);
};
