const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const asyncHandler = require("../utils/asyncHandler");
const { toPublicUser } = require("./authController");
const { logActivity } = require("../services/activityLogService");
const { sendSuccess } = require("../utils/apiResponse");

function toAdminUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    email: row.email,
    role: row.role,
    isActive: !!row.is_active,
    createdBy: row.created_by,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    UserModel.list({ query: req.query, limit, offset }),
    UserModel.count(req.query),
  ]);

  sendSuccess(res, {
    message: "Users fetched successfully",
    data: items.map(toAdminUser),
    meta: { total, totalPages: Math.max(Math.ceil(total / limit), 1), currentPage: page, limit },
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (target.role === "admin") {
    return res.status(400).json({ success: false, message: "Admin accounts cannot be deactivated here" });
  }
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot change your own account status" });
  }

  const updated = await UserModel.setActive(req.params.id, req.body.isActive);
  await logActivity(req, {
    action: req.body.isActive ? "user_activated" : "user_deactivated",
    entityType: "user",
    entityId: updated.id,
    description: `${req.body.isActive ? "Activated" : "Deactivated"} account "${updated.username}"`,
  });

  sendSuccess(res, { message: "User status updated successfully", data: toAdminUser(updated) });
});

const updateRole = asyncHandler(async (req, res) => {
  const target = await UserModel.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (target.role === "admin") {
    return res.status(400).json({ success: false, message: "Admin role cannot be changed here" });
  }
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot change your own role" });
  }

  const updated = await UserModel.updateRole(req.params.id, req.body.role);
  await logActivity(req, {
    action: "user_role_changed",
    entityType: "user",
    entityId: updated.id,
    description: `Changed role of "${updated.username}" from ${target.role} to ${req.body.role}`,
    oldValues: { role: target.role },
    newValues: { role: req.body.role },
  });

  sendSuccess(res, { message: "User role updated successfully", data: toAdminUser(updated) });
});

const createUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role } = req.body;

  const [existingUsername, existingEmail] = await Promise.all([
    UserModel.findByUsername(username),
    UserModel.findByEmail(email),
  ]);
  if (existingUsername || existingEmail) {
    return res.status(409).json({ success: false, message: "Username or email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({
    fullName,
    username,
    email,
    passwordHash,
    role: role || "agent",
    createdBy: req.user.id,
  });

  await logActivity(req, {
    action: "user_created",
    entityType: "user",
    entityId: user.id,
    description: `Created ${user.role} account "${user.username}"`,
  });

  res.status(201).json({ success: true, user: toPublicUser(user) });
});

module.exports = { createUser, list, updateStatus, updateRole };
