const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true },
    bill: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", index: true },

    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, default: "General" }, // e.g. Fuel, Salary, Freight Payment
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["cash", "bank", "check", "online"], default: "cash" },
    
    date: { type: Date, default: Date.now, index: true },
    description: { type: String, default: null },
    reference: { type: String, default: null }, // e.g. Check Number, Transaction ID
  },
  { timestamps: true }
);

TransactionSchema.index({ owner: 1, type: 1 });
TransactionSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
