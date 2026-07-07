const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const { signToken, verifyToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/activityLogService");

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url ?? null,
    createdAt: user.created_at,
  };
}

const DEFAULT_SESSION_MS = 8 * 60 * 60 * 1000; // 8h — matches JWT_EXPIRES_IN default
const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cookieOptions(maxAge = DEFAULT_SESSION_MS) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  };
}

const login = asyncHandler(async (req, res) => {
  const { username, password, rememberMe } = req.body;

  const user = await UserModel.findByUsername(username);
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  const maxAge = rememberMe ? REMEMBERED_SESSION_MS : DEFAULT_SESSION_MS;
  const token = signToken({ sub: user.id, role: user.role }, rememberMe ? "30d" : undefined);
  res.cookie(process.env.COOKIE_NAME, token, cookieOptions(maxAge));

  await logActivity({ user: { id: user.id }, ip: req.ip }, {
    action: "login",
    description: `${user.username} logged in`,
  });

  res.json({ success: true, user: toPublicUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  // Not behind verifyAuth (logout must always succeed to clear a stale/invalid
  // cookie), so we best-effort decode the token just to attribute the log entry.
  const token = req.cookies?.[process.env.COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyToken(token);
      await logActivity({ user: { id: payload.sub }, ip: req.ip }, {
        action: "logout",
        description: "User logged out",
      });
    } catch {
      // invalid/expired token — nothing meaningful to log
    }
  }

  res.clearCookie(process.env.COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  res.json({ success: true, message: "Logged out" });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: toPublicUser(req.user) });
});

module.exports = { login, logout, me, toPublicUser };
