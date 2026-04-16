const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicleNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, default: 'Truck' },
    ownerName: { type: String, default: null }, // for hired vehicles
    capacity: { type: String, default: null }, // e.g. "10 Ton"
    notes: { type: String, default: null },
    
    documents: {
      rcUrl: { type: String, default: null },
      insuranceUrl: { type: String, default: null },
      permitUrl: { type: String, default: null },
      fitnessUrl: { type: String, default: null },
    },

    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
