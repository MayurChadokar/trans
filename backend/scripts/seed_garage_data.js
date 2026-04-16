const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Bill = require('../models/Bill');

const DB_URI = process.env.MONGO_URI;

async function seedGarageData() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB...');

    const user = await User.findOne({ phone: '9999922222' });
    if (!user) {
      console.error('Garage user not found! Run create_dummy_users.js first.');
      process.exit(1);
    }

    const garageId = user._id;

    // Create a dummy party for these bills
    const Party = require('../models/Party');
    const dummyParty = await Party.findOneAndUpdate(
      { phone: '0000000000', owner: garageId },
      { name: 'Walk-in Customer', phone: '0000000000', owner: garageId },
      { upsert: true, new: true }
    );

    const dummyBills = [
      {
        owner: garageId,
        party: dummyParty._id,
        invoiceNo: 'JOB-701',
        billType: 'garage',
        type: 'garage',
        billingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        customerName: 'Aman Verma',
        customerPhone: '9827011111',
        vehicleNo: 'MP09 AB 1234',
        vehicleModel: 'Maruti Suzuki Swift',
        status: 'paid',
        items: [
          { description: 'Engine Oil Change', amount: 3500, qty: 1, rate: 3500 },
          { description: 'Oil Filter', amount: 450, qty: 1, rate: 450 },
          { description: 'Brake Pad Cleaning', amount: 800, qty: 1, rate: 800 }
        ],
        labor: 800,
        partsTotal: 3950,
        subTotal: 4750,
        grandTotal: 4750,
        nextServiceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months later
      },
      {
        owner: garageId,
        party: dummyParty._id,
        invoiceNo: 'JOB-702',
        billType: 'garage',
        type: 'garage',
        billingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        customerName: 'Rahul Singh',
        customerPhone: '9827022222',
        vehicleNo: 'MP04 CD 5678',
        vehicleModel: 'Hyundai Creta',
        status: 'unpaid',
        items: [
          { description: 'Bumper Painting', amount: 5000, qty: 1, rate: 5000 },
          { description: 'Denting Work', amount: 2000, qty: 1, rate: 2000 }
        ],
        labor: 2000,
        partsTotal: 5000,
        subTotal: 7000,
        grandTotal: 7000,
      },
      {
        owner: garageId,
        party: dummyParty._id,
        invoiceNo: 'JOB-703',
        billType: 'garage',
        type: 'garage',
        billingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        customerName: 'Sanjay Jain',
        customerPhone: '9827033333',
        vehicleNo: 'MP09 EF 9012',
        vehicleModel: 'Toyota Fortuner',
        status: 'paid',
        items: [
          { description: 'Wheel Alignment', amount: 600, qty: 1, rate: 600 },
          { description: 'Wheel Balancing', amount: 800, qty: 1, rate: 800 },
          { description: 'Full Body Wash', amount: 500, qty: 1, rate: 500 }
        ],
        labor: 500,
        partsTotal: 1400,
        subTotal: 1900,
        grandTotal: 1900,
      }
    ];

    await Bill.deleteMany({ owner: garageId, billType: 'garage' });
    await Bill.insertMany(dummyBills);

    console.log('Garage dummy data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding garage data:', err);
    process.exit(1);
  }
}

seedGarageData();
