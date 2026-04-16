const mongoose = require("mongoose");

const SoftwareSaleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The Admin who recorded the sale
    transporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The business who bought it
    
    planName: { type: String, required: true }, // e.g., "Professional Yearly", "Basic Monthly"
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ["paid", "partial", "pending"],
      default: "pending"
    },
    
    paymentHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        mode: { type: String, enum: ["cash", "upi", "bank_transfer", "check"], default: "cash" },
        transactionId: String
      }
    ],
    
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    notes: String
  },
  { timestamps: true }
);

// Virtual for pending balance
SoftwareSaleSchema.virtual("pendingAmount").get(function() {
  return Math.max(0, this.totalAmount - this.amountPaid);
});

SoftwareSaleSchema.set("toJSON", { virtuals: true });
SoftwareSaleSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SoftwareSale", SoftwareSaleSchema);
