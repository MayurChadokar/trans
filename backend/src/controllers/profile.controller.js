const User = require("../models/User");
const Admin = require("../models/Admin");
const { uploadToCloudinary } = require("../middleware/upload.middleware");

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password -otp -otpExpires");
    
    if (!user) {
      user = await Admin.findById(userId).select("-password");
    }

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    console.log("[Profile] Update request for:", userId);
    
    const allowed = [
      "name", "businessName", "slogan", "wishingName", "email", "address", "city", "state",
      "pincode", "panNo", "gstin", "aadharNo", "bankDetails", "alternatePhone", "phone",
      "logoUrl", "signatureUrl", "documents"
    ];
    
    const updateData = {};
    
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        let val = req.body[key];
        
        // Handle JSON strings from FormData
        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try {
            val = JSON.parse(val);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
        
        // Skip placeholders
        if (val === '[object Object]') continue;
        
        updateData[key] = val;
      }
    }

    // Process file uploads if present
    if (req.files) {
      const fileKeys = Object.keys(req.files);
      console.log("[Profile] Received files:", fileKeys);
      
      if (req.files.logo && req.files.logo[0]) {
        console.log("[Profile] Uploading new logo to Cloudinary...");
        const url = await uploadToCloudinary(req.files.logo[0].buffer, "logos");
        if (url) {
          updateData.logoUrl = url;
          console.log("[Profile] Logo URL updated:", url);
        }
      }
      
      if (req.files.signature && req.files.signature[0]) {
        console.log("[Profile] Uploading new signature to Cloudinary...");
        const url = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        if (url) {
          updateData.signatureUrl = url;
          console.log("[Profile] Signature URL updated:", url);
        }
      }
    }

    // Determine which model to update
    const isUser = await User.exists({ _id: userId });
    const Model = isUser ? User : Admin;
    
    console.log("[Profile] Updating model:", Model.modelName, "for ID:", userId);
    console.log("[Profile] Data to set:", Object.keys(updateData));

    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Profile not found to update" });
    }

    console.log("[Profile] Update successful");
    return res.json({ success: true, user: updatedUser });
  } catch (e) {
    console.error("[updateProfile Error]", e);
    return res.status(500).json({ success: false, message: e.message || "Failed to update profile" });
  }
}

module.exports = {
  getProfile,
  updateProfile
};
