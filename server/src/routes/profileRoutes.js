const { Router } = require("express");
const { body } = require("express-validator");
const profileController = require("../controllers/profileController");
const validate = require("../middleware/validate");
const { verifyAuth } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/avatarUpload");
const { STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE } = require("../utils/passwordPolicy");

const router = Router();

router.use(verifyAuth);

router.patch(
  "/",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").trim().isEmail().withMessage("A valid email is required"),
  ],
  validate,
  profileController.updateProfile
);

router.patch(
  "/password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .bail()
      .matches(STRONG_PASSWORD_REGEX)
      .withMessage(STRONG_PASSWORD_MESSAGE),
  ],
  validate,
  profileController.changePassword
);

router.post("/avatar", uploadAvatar, profileController.uploadAvatar);
router.delete("/avatar", profileController.deleteAvatar);

module.exports = router;
