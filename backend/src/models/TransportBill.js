const mongoose = require("mongoose");

const TransportBillSchema = new mongoose.Schema(
  {
    owner:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    party:  { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true }, // optional — user may type billed-to manually

    billNumber: { type: String, index: true }, // Auto-generated on finalise

    // Linked trips (optional — for account-based billing)
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],

    // Manual line items (date | from | to | chalanNo | amount)
    items: [
      {
        date:        { type: Date },
        companyFrom: { type: String, trim: true },
        companyTo:   { type: String, trim: true },
        chalanNo:    { type: String, trim: true },
        amount:      { type: Number, default: 0 },
        tripIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
      },
    ],

    // Customer / billed-to snapshot (filled from Party or overridden)
    billedToName:    { type: String },
    billedToPhone:   { type: String },
    billedToEmail:   { type: String, lowercase: true },
    billedToAddress: { type: String },
    billedToCity:    { type: String },
    billedToState:   { type: String },
    billedToPincode: { type: String },
    billedToGstin:   { type: String, uppercase: true },
    billedToPan:     { type: String, uppercase: true },

    // Extra charges
    loadingCharge:   { type: Number, default: 0 },
    unloadingCharge: { type: Number, default: 0 },
    detentionCharge: { type: Number, default: 0 },
    otherCharge:     { type: Number, default: 0 },

    // Tax
    gstPercent: { type: Number, default: 0 },
    gstType:    { type: String, enum: ["CGST+SGST", "IGST"], default: "CGST+SGST" },
    gstAmount:  { type: Number, default: 0 },

    // Totals
    subTotal:   { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: ["draft", "unpaid", "paid", "cancelled"],
      default: "draft",
    },
    paymentMode: { type: String, enum: ["topay", "paid", "tbb"], default: "topay" },

    billingDate: { type: Date, default: Date.now },
    dueDate:     { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 },

    notes: { type: String, default: "Grateful for Moving What Matters to You!" },
  },
  { timestamps: true }
);

TransportBillSchema.index({ owner: 1, status: 1 });
TransportBillSchema.index({ owner: 1, billingDate: -1 });

module.exports = mongoose.model("TransportBill", TransportBillSchema);
