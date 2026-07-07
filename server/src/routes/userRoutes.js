const { Router } = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/userController");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");
const { STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE } = require("../utils/passwordPolicy");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("role").optional().isIn(["admin", "agent", "viewer"]).withMessage("Invalid role"),
  ],
  validate,
  userController.list
);

router.patch(
  "/:id/status",
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid user id"),
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
  ],
  validate,
  userController.updateStatus
);

router.patch(
  "/:id/role",
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid user id"),
    body("role").isIn(["agent", "viewer"]).withMessage("Role must be 'agent' or 'viewer'"),
  ],
  validate,
  userController.updateRole
);

router.post(
  "/",
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
