const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const phone = "8888888888";
    const existing = await User.findOne({ phone });

    const transportData = {
      phone,
      role: "transport",
      name: "Dummy Transport Owner",
      businessName: "Dummy Transport Services",
      setupComplete: true,
      address: "123, Transport Nagar",
      city: "Rajkot",
      pincode: "360001",
    };

    if (existing) {
      await User.updateOne({ phone }, { $set: transportData });
      console.log("Updated existing dummy transport user.");
    } else {
      await User.create(transportData);
      console.log("Created new dummy transport user.");
    }

    console.log("Seeding complete. Use phone 8888888888 to login.");
    process.exit(0);
  } catch (e) {
    console.error("Seeding failed:", e.message);
    process.exit(1);
  }
}

seed();
