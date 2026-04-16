const mongoose = require("mongoose");

const GarageBillSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", index: true }, // optional

    billNumber: { type: String, index: true }, // Auto-generated on finalise (no unique — prefix+random is unique enough)

    // Customer snapshot (can be filled from Party or manually)
    customerName:      { type: String, required: true },
    customerPhone:     { type: String },
    customerEmail:     { type: String, lowercase: true },
    customerAddress:   { type: String },
    customerCity:      { type: String },
    customerState:     { type: String },
    customerPincode:   { type: String },
    customerGstin:     { type: String, uppercase: true },
    customerPan:       { type: String, uppercase: true },
    customerSignatureUrl: { type: String },

    // Vehicle Details
    vehicleNo:      { type: String, uppercase: true, trim: true },
    vehicleModel:   { type: String },
    vehicleCompany: { type: String },
    kmReading:      { type: Number },
    nextServiceKm:  { type: Number },
    nextServiceDate:{ type: Date },

    // Parts / Service line-items
    items: [
      {
        description: { type: String },
        qty:         { type: Number, default: 1 },
        rate:        { type: Number, default: 0 },
        amount:      { type: Number, default: 0 },
      },
    ],

    // Billing breakdown
    partsTotal:  { type: Number, default: 0 },
    laborCharge: { type: Number, default: 0 },
    subTotal:    { type: Number, default: 0 }, // partsTotal + laborCharge
    gstPercent:  { type: Number, default: 0 },
    gstAmount:   { type: Number, default: 0 },
    grandTotal:  { type: Number, required: true },

    status: {
      type: String,
      enum: ["draft", "unpaid", "partial", "paid", "cancelled"],
      default: "unpaid",
    },
    paymentMode: { type: String, enum: ["unpaid", "paid", "partial"], default: "unpaid" },
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Online Payment", "Bank Transfer", "Card", "Credit", "Cheque"], default: "Cash" },

    billingDate: { type: Date, default: Date.now },

    notes: { type: String },
  },
  { timestamps: true }
);

GarageBillSchema.index({ owner: 1, status: 1 });
GarageBillSchema.index({ owner: 1, billingDate: -1 });
GarageBillSchema.index({ vehicleNo: 1 });

module.exports = mongoose.model("GarageBill", GarageBillSchema);
