const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    
    billType: { type: String, enum: ["transport", "garage"], required: true },
    billNumber: { type: String, sparse: true, unique: true }, // Optional when in draft
    
    // For Transport
    trips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    
    // For Garage / General Items
    items: [
      {
        description: String,
        quantity: { type: Number, default: 1 },
        rate: Number,
        amount: Number,
      },
    ],

    // Garage Specific Fields
    vehicleNo: { type: String, uppercase: true, trim: true },
    vehicleModel: { type: String },
    vehicleCompany: { type: String },
    kmReading: { type: Number },
    nextServiceKm: { type: Number },
    nextServiceDate: { type: Date },
    laborCharge: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    partsTotal: { type: Number, default: 0 }, // subtotal for items only

    // Customer info (if not using party model or for overrides)
    customerName: { type: String },
    customerPhone: { type: String },

    subTotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    status: {
      type: String,
      enum: ["draft", "unpaid", "partially_paid", "paid", "cancelled"],
      default: "draft"
    },
    paymentReceived: { type: Number, default: 0 },

    billingDate: { type: Date, default: Date.now },
    dueDate: { type: Date, default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 }, // Default 7 days

    notes: { type: String, default: "Thank you for your business!" },
  },
  { timestamps: true }
);

BillSchema.index({ owner: 1, status: 1 });
BillSchema.index({ owner: 1, billingDate: -1 });

module.exports = mongoose.model("Bill", BillSchema);
