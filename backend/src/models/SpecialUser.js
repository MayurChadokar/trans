const mongoose = require("mongoose");

const SpecialUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["driver", "mechanic", "staff"], 
      required: true 
    },
    target: { 
      type: String, 
      enum: ["transport", "garage"], 
      required: true 
    },
    status: { type: String, default: "Active" },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SpecialUser", SpecialUserSchema);
