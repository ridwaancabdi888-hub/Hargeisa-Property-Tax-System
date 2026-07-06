const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const { toPublicUser } = require("./authController");
const { logActivity } = require("../services/activityLogService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { AVATAR_UPLOAD_DIR } = require("../middleware/avatarUpload");

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  const existingEmail = await UserModel.findByEmail(email);
  if (existingEmail && existingEmail.id !== req.user.id) {
    return res.status(409).json({ success: false, message: "Email is already in use" });
  }

  const before = toPublicUser(req.user);
  const updated = await UserModel.updateProfile(req.user.id, { fullName, email });

  await logActivity(req, {
    action: "profile_updated",
    entityType: "user",
    entityId: req.user.id,
    description: `${req.user.username} updated their profile`,
    oldValues: before,
    newValues: toPublicUser(updated),
  });

  sendSuccess(res, { message: "Profile updated successfully", data: toPublicUser(updated) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await UserModel.findByIdWithPassword(req.user.id);
  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) {
    return res.status(401).json({ success: false, message: "Current password is incorrect" });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await UserModel.updatePassword(req.user.id, newHash);

  await logActivity(req, {
    action: "password_changed",
    entityType: "user",
    entityId: req.user.id,
    description: `${req.user.username} changed their password`,
  });

  sendSuccess(res, { message: "Password changed successfully" });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "An image file is required" });
  }

  if (req.user.avatar_url) {
    await fs.unlink(path.join(AVATAR_UPLOAD_DIR, path.basename(req.user.avatar_url))).catch(() => {});
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const updated = await UserModel.updateAvatar(req.user.id, avatarUrl);

  await logActivity(req, {
    action: "profile_updated",
    entityType: "user",
    entityId: req.user.id,
    description: `${req.user.username} updated their profile picture`,
  });

  sendSuccess(res, { message: "Profile picture updated successfully", data: toPublicUser(updated) });
});

const deleteAvatar = asyncHandler(async (req, res) => {
  if (req.user.avatar_url) {
    await fs.unlink(path.join(AVATAR_UPLOAD_DIR, path.basename(req.user.avatar_url))).catch(() => {});
  }
  const updated = await UserModel.updateAvatar(req.user.id, null);

  await logActivity(req, {
    action: "profile_updated",
    entityType: "user",
    entityId: req.user.id,
    description: `${req.user.username} removed their profile picture`,
  });

  sendSuccess(res, { message: "Profile picture removed successfully", data: toPublicUser(updated) });
});

module.exports = { updateProfile, changePassword, uploadAvatar, deleteAvatar };
