const User = require("../models/User");
const { uploadToCloudinary } = require("../middleware/upload.middleware");

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password -otp -otpExpires");
    
    if (!user) {
      const Admin = require("../models/Admin");
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
    console.log("[Profile] Body keys:", Object.keys(req.body));
    console.log("[Profile] Files present:", req.files ? Object.keys(req.files) : "None");
    const allowed = [
      "name", "businessName", "slogan", "email", "address", "city", "state",
      "pincode", "panNo", "gstin", "aadharNo", "bankDetails", "alternatePhone", "phone"
    ];
    
    const updateData = {};
    console.log("[Profile] Update body keys:", Object.keys(req.body));
    
    for (const key of allowed) {
      if (req.body[key] !== undefined && !key.toLowerCase().endsWith('url')) {
        updateData[key] = req.body[key];
      }
    }

    // Handle bankDetails nested update if sent as JSON string (common with FormData)
    if (updateData.bankDetails && typeof updateData.bankDetails === 'string') {
      try {
        console.log("[Profile] Attempting to parse bankDetails...");
        updateData.bankDetails = JSON.parse(updateData.bankDetails);
      } catch (err) {
        console.warn("[Profile] Failed to parse bankDetails JSON string:", err.message);
        // If it's "[object Object]", we should probably ignore it rather than trying to save it
        if (updateData.bankDetails === '[object Object]') {
          delete updateData.bankDetails;
        }
      }
    }

    // Process file uploads if present
    if (req.files) {
      console.log("[Profile] Processing files:", Object.keys(req.files));
      
      if (req.files.logo && req.files.logo[0]) {
        console.log("[Profile] Uploading logo...");
        const url = await uploadToCloudinary(req.files.logo[0].buffer, "logos");
        if (url) updateData.logoUrl = url;
      }
      
      if (req.files.signature && req.files.signature[0]) {
        console.log("[Profile] Uploading signature...");
        const url = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        if (url) updateData.signatureUrl = url;
      }
    }

    let updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).select("-password -otp -otpExpires");

    if (!updatedUser) {
      const Admin = require("../models/Admin");
      updatedUser = await Admin.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { returnDocument: 'after', runValidators: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "Profile not found to update" });
    }

    return res.json({ success: true, user: updatedUser });
  } catch (e) {
    console.error("[updateProfile Error]", e);
    next(e);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
