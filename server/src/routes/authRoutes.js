const { Router } = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const { verifyAuth } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");

const router = Router();

router.post(
  "/login",
  loginLimiter,
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post("/logout", authController.logout);

router.get("/me", verifyAuth, authController.me);

module.exports = router;
