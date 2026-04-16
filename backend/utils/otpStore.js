const OTP_TTL_SECONDS = 5 * 60;

// In-memory OTP store: good for dev/single instance.
// For production, replace with Redis or DB table.
const store = new Map(); // phone -> { otp, expiresAtMs }

function generateOtp(phone) {
  // Fixed OTP for test admin/transport phones
  if (phone === "9999999999" || phone === "8888888888") return "123456";
  
  // Random 6 digit OTP for others
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function issueOtp(phone) {
  const otp = generateOtp(phone);
  const expiresAtMs = Date.now() + OTP_TTL_SECONDS * 1000;
  store.set(phone, { otp, expiresAtMs });
  return { otp, ttlSeconds: OTP_TTL_SECONDS };
}

function verifyOtp(phone, otp) {
  const rec = store.get(phone);
  if (!rec) return false;
  if (Date.now() > rec.expiresAtMs) {
    store.delete(phone);
    return false;
  }
  const ok = rec.otp === otp;
  if (ok) store.delete(phone);
  return ok;
}

module.exports = { issueOtp, verifyOtp };

