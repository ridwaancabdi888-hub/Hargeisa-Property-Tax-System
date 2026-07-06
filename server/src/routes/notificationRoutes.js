const { Router } = require("express");
const { param } = require("express-validator");
const notificationController = require("../controllers/notificationController");
const validate = require("../middleware/validate");
const { verifyAuth } = require("../middleware/authMiddleware");

const router = Router();

router.use(verifyAuth);

router.get("/", notificationController.list);
router.post(
  "/:id/read",
  param("id").isInt({ min: 1 }).withMessage("Invalid notification id"),
  validate,
  notificationController.markRead
);

module.exports = router;
