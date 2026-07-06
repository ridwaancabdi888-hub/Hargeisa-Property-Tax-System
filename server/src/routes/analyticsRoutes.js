const { Router } = require("express");
const analyticsController = require("../controllers/analyticsController");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");

const router = Router();

router.get("/", verifyAuth, requireRole("admin"), analyticsController.getOverview);
router.get("/export/pdf", verifyAuth, requireRole("admin"), analyticsController.exportPdf);

module.exports = router;
