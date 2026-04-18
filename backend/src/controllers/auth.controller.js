const User = require("../models/User");
const otpService = require("../services/otp.service");
const tokenService = require("../services/token.service");
const smsService = require("../services/sms.service");
const { hashPassword, verifyPassword } = require("../utils/password");

const ADMIN_OTP_PHONE = "9999999999";

function sanitizePhone(v) {
  return String(v || "").replace(/\D/g, "");
}

function sanitizeOtp(v) {
  return String(v || "").replace(/\D/g, "");
}

function normalizeEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function userDto(user) {
  return {
    id: String(user._id),
    phone: user.phone,
    alternatePhone: user.alternatePhone || null,
    name: user.name || null,
    role: user.role || null,
    email: user.email || null,
    businessName: user.businessName || null,
    slogan: user.slogan || null,
    address: user.address || null,
    city: user.city || null,
    pincode: user.pincode || null,
    gstin: user.gstin || null,
    panNo: user.panNo || null,
    logoUrl: user.logoUrl || null,
    signatureUrl: user.signatureUrl || null,
    bankDetails: user.bankDetails || null,
    setupComplete: !!user.setupComplete,
    subscriptionActive: !!user.subscriptionActive,
    subscriptionExpiry: user.subscriptionExpiry || null,
    allowedVehicles: user.allowedVehicles || 0,
    planName: user.planId?.name || null,
  };
}

async function sendOtp(req, res, next) {
  try {
    const phone = sanitizePhone(req.body?.phone);
    if (phone.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone" });
    }

    const { otp, ttlSeconds } = otpService.issue(phone);
    
    let smsResult = null;
    if (process.env.NODE_ENV !== 'production') {
      // In dev, wait for result to debug
      smsResult = await smsService.sendOtpSms(phone, otp);
    } else {
      // In prod, fire-and-forget
      smsService.sendOtpSms(phone, otp).catch(e => console.error("OTP SMS Failed:", e.message));
    }

    return res.json({ 
      success: true, 
      message: "OTP sent", 
      ttlSeconds,
      ...(process.env.NODE_ENV !== 'production' ? { otp, smsResult } : {})
    });
  } catch (e) {
    return next(e);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const phone = sanitizePhone(req.body?.phone);
    const otp = sanitizeOtp(req.body?.otp);
    if (phone.length !== 10) {
      return res.status(400).json({ success: false, message: "Invalid phone" });
    }
    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const ok = otpService.verify(phone, otp);

    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    const isAdminOtpLogin = phone === ADMIN_OTP_PHONE;

    const user = await User.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: { phone },
        ...(isAdminOtpLogin ? { $set: { role: "admin" } } : {}),
      },
      { new: true, upsert: true }
    ).populate('planId');

    const isNewUser = !user.role;
    const accessToken = tokenService.signAccessToken(user);

    const { token: refreshToken } = await tokenService.issueRefreshToken({
      userId: user._id,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.cookie("refresh_token", refreshToken, tokenService.refreshCookieOptions());

    return res.json({
      success: true,
      isNewUser,
      accessToken,
      user: userDto(user),
    });
  } catch (e) {
    return next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rotated = await tokenService.rotateRefreshToken(token, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    const user = await User.findById(rotated.userId).populate('planId');
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accessToken = tokenService.signAccessToken(user);

    res.cookie("refresh_token", rotated.refreshToken, tokenService.refreshCookieOptions());

    return res.json({ success: true, accessToken, user: userDto(user) });
  } catch (e) {
    return next(e);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await tokenService.revokeRefreshToken(token);
    }
    res.clearCookie("refresh_token", tokenService.refreshCookieOptions());
    return res.json({ success: true });
  } catch (e) {
    return next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user?.id).populate('planId');
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    return res.json({ success: true, user: userDto(user) });
  } catch (e) {
    return next(e);
  }
}

async function setRole(req, res, next) {
  try {
    const role = String(req.body?.role || "").toLowerCase();
    if (!["admin", "transport", "garage"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { $set: { role } },
      { new: true, upsert: false }
    ).populate('planId');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const accessToken = tokenService.signAccessToken(user);
    return res.json({ success: true, user: userDto(user), accessToken });
  } catch (e) {
    return next(e);
  }
}

async function registerTransport(req, res, next) {
  try {
    const { 
      name, businessName, address, email, 
      aadharNo, panNo, bankDetails, 
      signatureUrl, logoUrl, documents 
    } = req.body;

    if (!name || !businessName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { 
        $set: { 
          name, businessName, address, email,
          aadharNo, panNo, bankDetails,
          signatureUrl, logoUrl, documents,
          role: "transport",
          setupComplete: true 
        } 
      },
      { new: true, upsert: false }
    ).populate('planId');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const accessToken = tokenService.signAccessToken(user);
    return res.json({ success: true, user: userDto(user), accessToken });
  } catch (e) {
    return next(e);
  }
}

async function registerGarage(req, res, next) {
  try {
    const { 
      name, businessName, address, email, 
      aadharNo, panNo, bankDetails, 
      logoUrl, documents 
    } = req.body;

    if (!name || !businessName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { 
        $set: { 
          name, businessName, address, email,
          aadharNo, panNo, bankDetails,
          logoUrl, documents,
          role: "garage",
          setupComplete: true 
        } 
      },
      { new: true, upsert: false }
    ).populate('planId');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const accessToken = tokenService.signAccessToken(user);
    return res.json({ success: true, user: userDto(user), accessToken });
  } catch (e) {
    return next(e);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = [
      "name",
      "businessName",
      "setupComplete",
      "email",
      "address",
      "city",
      "pincode",
      "panNo",
      "gstin",
      "aadharNo",
      "bankDetails",
      "signatureUrl",
      "logoUrl",
      "documents",
      "alternatePhone",
    ];
    
    const updates = {};
    for (const k of allowed) {
      if (req.body?.[k] !== undefined) {
        updates[k] = req.body[k];
      }
    }

    // Ensure we don't accidentally wipe out the role if not provided
    const user = await User.findOneAndUpdate(
      { phone: req.user.phone },
      { $set: updates },
      { new: true, upsert: false }
    ).populate('planId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: userDto(user) });
  } catch (e) {
    return next(e);
  }
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).populate('planId');
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid credentials or password not set" });
    }

    const ok = verifyPassword(password, {
      salt: user.passwordSalt,
      hash: user.passwordHash,
      iterations: user.passwordIterations,
    });

    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = tokenService.signAccessToken(user);
    const { token: refreshToken } = await tokenService.issueRefreshToken({
      userId: user._id,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.cookie("refresh_token", refreshToken, tokenService.refreshCookieOptions());

    return res.json({ success: true, user: userDto(user), accessToken });
  } catch (e) {
    next(e);
  }
}

async function setPassword(req, res, next) {
  try {
    const password = String(req.body?.password || "");
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const h = hashPassword(password);
    user.passwordSalt = h.salt;
    user.passwordHash = h.hash;
    user.passwordIterations = h.iterations;
    await user.save();

    return res.json({ success: true, message: "Password set successfully" });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
  refresh,
  logout,
  me,
  setRole,
  updateProfile,
  registerTransport,
  registerGarage,
  login,
  setPassword,
  userDto,
};

