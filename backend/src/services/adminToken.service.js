const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AdminRefreshToken = require("../models/AdminRefreshToken");
const { requireEnv, isProd } = require("../config/env");

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function parseDurationToMs(v) {
  if (typeof v === "number") return v;
  const s = String(v || "").trim();
  if (/^\d+$/.test(s)) return Number(s);
  const m = s.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  const mult = u === "s" ? 1000 : u === "m" ? 60_000 : u === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}

function refreshExpiryMs() {
  const raw = process.env.JWT_REFRESH_EXPIRY || "7d";
  const ms = parseDurationToMs(raw);
  if (!ms) return 7 * 24 * 60 * 60_000;
  return ms;
}

function accessExpiry() {
  return process.env.JWT_ACCESS_EXPIRY || "15m";
}

function signAccessToken(admin) {
  const secret = requireEnv("JWT_SECRET");
  return jwt.sign(
    { sub: String(admin._id), role: "admin", email: admin.email },
    secret,
    { expiresIn: accessExpiry() }
  );
}

function refreshCookieOptions() {
  const secure = isProd();
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/api",
  };
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

async function issueRefreshToken({ adminId, ip, userAgent }) {
  const token = generateRefreshToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + refreshExpiryMs());

  await AdminRefreshToken.create({
    adminId,
    tokenHash,
    expiresAt,
    createdByIp: ip || null,
    userAgent: userAgent || null,
  });

  return { token, tokenHash, expiresAt };
}

async function revokeTokenHash(tokenHash, { replacedByTokenHash } = {}) {
  await AdminRefreshToken.updateOne(
    { tokenHash, revokedAt: null },
    {
      $set: {
        revokedAt: new Date(),
        replacedByTokenHash: replacedByTokenHash || null,
      },
    }
  );
}

async function rotateRefreshToken(oldToken, { ip, userAgent } = {}) {
  const oldHash = sha256(oldToken);
  const rec = await AdminRefreshToken.findOne({ tokenHash: oldHash }).lean();
  if (!rec) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    throw err;
  }

  if (rec.revokedAt) {
    const err = new Error("Refresh token revoked");
    err.statusCode = 401;
    throw err;
  }

  if (new Date(rec.expiresAt).getTime() <= Date.now()) {
    await revokeTokenHash(oldHash);
    const err = new Error("Refresh token expired");
    err.statusCode = 401;
    throw err;
  }

  const next = await issueRefreshToken({ adminId: rec.adminId, ip, userAgent });
  await revokeTokenHash(oldHash, { replacedByTokenHash: next.tokenHash });

  return { adminId: rec.adminId, refreshToken: next.token, refreshExpiresAt: next.expiresAt };
}

async function revokeRefreshToken(token) {
  const tokenHash = sha256(String(token || ""));
  await revokeTokenHash(tokenHash);
}

module.exports = {
  signAccessToken,
  refreshCookieOptions,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};

