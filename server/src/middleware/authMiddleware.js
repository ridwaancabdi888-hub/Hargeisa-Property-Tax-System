const { verifyToken } = require("../utils/jwt");
const UserModel = require("../models/UserModel");
const asyncHandler = require("../utils/asyncHandler");

const verifyAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[process.env.COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: "Account no longer active" });
  }

  req.user = user;
  next();
});

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

module.exports = { verifyAuth, requireRole };
