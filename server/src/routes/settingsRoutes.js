const { Router } = require("express");
const { body } = require("express-validator");
const settingsController = require("../controllers/settingsController");
const validate = require("../middleware/validate");
const { verifyAuth } = require("../middleware/authMiddleware");

const router = Router();

router.use(verifyAuth);

router.get("/", settingsController.getSettings);

router.put(
  "/",
  [
    body("theme").optional().isIn(["light", "dark"]).withMessage("Theme must be 'light' or 'dark'"),
    body("language").optional().isLength({ min: 2, max: 10 }).withMessage("Invalid language code"),
    body("timezone").optional().isLength({ min: 1, max: 50 }).withMessage("Invalid timezone"),
    body("dateFormat")
      .optional()
      .isIn(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
      .withMessage("Invalid date format"),
    body("notifyPropertyCreated").optional().isBoolean().withMessage("notifyPropertyCreated must be a boolean"),
    body("notifyPropertySold").optional().isBoolean().withMessage("notifyPropertySold must be a boolean"),
    body("notifyPropertyDeleted").optional().isBoolean().withMessage("notifyPropertyDeleted must be a boolean"),
  ],
  validate,
  settingsController.updateSettings
);

module.exports = router;
