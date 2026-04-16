const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },
    gstin: { type: String, default: null },
    pan: { type: String, default: null },
    openingBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ["toReceive", "toPay"], default: "toReceive" },
    balance: { type: Number, default: 0 },
    partyType: { type: String, enum: ["transport", "garage"], default: "transport" },
    signatureUrl: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Party", PartySchema);
