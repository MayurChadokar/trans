const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    party: { type: mongoose.Schema.Types.ObjectId, ref: "Party", required: true, index: true },
    
    tripId: { type: String, unique: true }, // Auto-generated ID like TRP-xxxx
    
    source: { type: String, required: true },
    destination: { type: String, required: true },
    amount: { type: Number, default: 0 },
    
    // Detailed Trip Charges
    loadingCharge: { type: Number, default: 0 },
    unloadingCharge: { type: Number, default: 0 },
    detentionCharge: { type: Number, default: 0 },
    otherCharge: { type: Number, default: 0 },
    
    numberOfTrips: { type: Number, default: 1 },
    
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    
    driverName: { type: String, default: null },
    driverPhone: { type: String, default: null },
    
    expenses: [
      {
        description: String,
        amount: Number,
        date: { type: Date, default: Date.now },
        receiptUrl: String,
      },
    ],
    
    totalDistance: { type: Number, default: 0 },
    notes: { type: String, default: null },
    
    // Billing connection
    billed: { type: Boolean, default: false, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", default: null },
  },
  { timestamps: true }
);

TripSchema.pre('save', function(next) {
  if (!this.tripId) {
    this.tripId = 'TRP-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

TripSchema.index({ owner: 1, status: 1 });
TripSchema.index({ owner: 1, startDate: -1 });

module.exports = mongoose.model("Trip", TripSchema);
