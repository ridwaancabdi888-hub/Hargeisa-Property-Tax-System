const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const asyncHandler = require("../utils/asyncHandler");
const { toPublicUser } = require("./authController");

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
  // role is constrained to 'agent'/'viewer' by the route validator — this endpoint
  // must never be usable to mint additional admins.
  const user = await UserModel.create({
    fullName,
    username,
    email,
    passwordHash,
    role: role || "agent",
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, user: toPublicUser(user) });
});

module.exports = { createUser };
