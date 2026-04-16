const mongoose = require("mongoose");

const SoftwarePlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Basic Monthly", "Pro Yearly"
    interval: { 
      type: String, 
      enum: ["Monthly", "Yearly"], 
      default: "Monthly" 
    },
    price: { type: Number, required: true },
    features: { type: String }, // Comma separated or just a string
    allowedVehicles: { type: Number, default: 0 }, // 0 could mean unlimited or a default
    target: { 
      type: String, 
      enum: ["transport", "garage"], 
      default: "transport" 
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SoftwarePlan", SoftwarePlanSchema);
