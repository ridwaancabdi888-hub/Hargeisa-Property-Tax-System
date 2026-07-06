const { Router } = require("express");
const { query } = require("express-validator");
const activityLogController = require("../controllers/activityLogController");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");

const router = Router();

router.get(
  "/",
  verifyAuth,
  requireRole("admin"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("date_from").optional().isISO8601().withMessage("date_from must be a valid date"),
    query("date_to").optional().isISO8601().withMessage("date_to must be a valid date"),
  ],
  validate,
  activityLogController.list
);

module.exports = router;
