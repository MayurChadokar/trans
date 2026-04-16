const User = require("../models/User");
const { uploadToCloudinary } = require("../middleware/upload.middleware");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (e) {
    next(e);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const allowed = [
      "name", "businessName", "slogan", "email", "address", "city", 
      "pincode", "panNo", "gstin", "aadharNo", "bankDetails"
    ];
    
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Handle bankDetails nested update if sent as flat JSON (common with FormData)
    if (updateData.bankDetails && typeof updateData.bankDetails === 'string') {
      try {
        updateData.bankDetails = JSON.parse(updateData.bankDetails);
      } catch (err) {
        console.warn("[Profile] Failed to parse bankDetails JSON string");
      }
    }

    // Process file uploads if present
    if (req.files) {
      if (req.files.logo) {
        console.log("[Profile] Uploading logo to Cloudinary...");
        const url = await uploadToCloudinary(req.files.logo[0].buffer, "logos");
        updateData.logoUrl = url;
        console.log("[Profile] Logo uploaded:", url);
      }
      if (req.files.signature) {
        console.log("[Profile] Uploading signature to Cloudinary...");
        const url = await uploadToCloudinary(req.files.signature[0].buffer, "signatures");
        updateData.signatureUrl = url;
        console.log("[Profile] Signature uploaded:", url);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).select("-password -otp -otpExpires");

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
