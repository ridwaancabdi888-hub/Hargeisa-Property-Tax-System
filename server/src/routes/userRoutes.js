const { Router } = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");
const { STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE } = require("../utils/passwordPolicy");

const router = Router();

router.post(
  "/",
  verifyAuth,
  requireRole("admin"),
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be 3-50 characters"),
    body("email").trim().isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .bail()
      .matches(STRONG_PASSWORD_REGEX)
      .withMessage(STRONG_PASSWORD_MESSAGE),
    body("role").optional().isIn(["agent", "viewer"]).withMessage("Role must be 'agent' or 'viewer'"),
  ],
  validate,
  userController.createUser
);

module.exports = router;
