const mongoose = require("mongoose");

const GarageVehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    partyId: { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true }, // Linked Customer
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String },
    model: { type: String },
    vehicleType: { type: String, default: 'Car' },
    customerName: { type: String }, // Redundant but good for quick display
    customerPhone: { type: String },
    kmReading: { type: Number, default: 0 },
    nextServiceKm: { type: Number },
    nextServiceDate: { type: Date },
    lastServiceDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique per garage (owner)
GarageVehicleSchema.index({ owner: 1, vehicleNumber: 1 }, { unique: true });

module.exports = mongoose.model("GarageVehicle", GarageVehicleSchema);
