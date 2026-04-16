const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    garage: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // The garage user
    
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    
    serviceId: { type: String, unique: true, required: true }, // Custom ID like SRV-123
    
    description: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    finalCost: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    
    requestedDate: { type: Date, default: Date.now },
    completedDate: { type: Date, default: null },
    
    partsReplaced: [
      {
        name: String,
        cost: Number,
      },
    ],
    
    notes: { type: String, default: null },
    invoiceUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
