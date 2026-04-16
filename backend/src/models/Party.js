const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    gstin: { type: String, uppercase: true, trim: true },
    pan: { type: String, uppercase: true, trim: true },
    
    partyType: { type: String, enum: ["transport", "garage"], default: "transport" },
    
    // Financial Standing
    openingBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ["toReceive", "toPay"], default: "toReceive" },
    balance: { type: Number, default: 0 }, // Positive means they owe us
    creditLimit: { type: Number, default: 0 },
    
    signatureUrl: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

PartySchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model("Party", PartySchema);
