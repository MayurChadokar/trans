const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trans_billing';

async function createDummies() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB...');

    // 1. Dummy Transport
    const transportUser = {
      phone: '9999911111',
      role: 'transport',
      name: 'Mayur Transport',
      businessName: 'Mayur Transport Services',
      setupComplete: true,
      city: 'Indore',
      state: 'Madhya Pradesh',
      address: '123 Transport Nagar',
      email: 'transport@example.com'
    };

    // 2. Dummy Garage
    const garageUser = {
      phone: '9999922222',
      role: 'garage',
      name: 'City Auto Garage',
      businessName: 'City Auto Services',
      setupComplete: true,
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      address: '456 Garage Lane',
      email: 'garage@example.com'
    };

    await User.findOneAndUpdate({ phone: transportUser.phone }, transportUser, { upsert: true, new: true });
    await User.findOneAndUpdate({ phone: garageUser.phone }, garageUser, { upsert: true, new: true });

    console.log('Dummy accounts created successfully!');
    console.log('Transport: 9999911111');
    console.log('Garage: 9999922222');

    process.exit(0);
  } catch (err) {
    console.error('Error creating dummies:', err);
    process.exit(1);
  }
}

createDummies();
