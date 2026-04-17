const jwt = require("jsonwebtoken");
const { requireEnv } = require("../config/env");

function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const secret = requireEnv("JWT_SECRET");
    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.sub,
      phone: payload.phone || null,
      role: payload.role || null,
    };

    return next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    const r = req.user?.role;
    if (r === "admin" || r === role) return next();
    return res.status(403).json({ 
      success: false, 
      message: "Forbidden: Role mismatch", 
      debug: { currentRole: r, requiredRole: role } 
    });
  };
}

module.exports = { authRequired, requireRole };

