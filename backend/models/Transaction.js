const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", index: true },
    
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, default: "General" }, // e.g., "Fuel", "Salary", "Payment Received"
    
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["cash", "online", "cheque", "transfer"], default: "cash" },
    referenceId: { type: String, default: null }, // Transaction ID, Check number, etc.
    
    date: { type: Date, default: Date.now },
    notes: { type: String, default: null },
    
    // For specific expense tracking
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  },
  { timestamps: true }
);

// Performance indexes
TransactionSchema.index({ owner: 1, date: -1 });
TransactionSchema.index({ owner: 1, type: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
