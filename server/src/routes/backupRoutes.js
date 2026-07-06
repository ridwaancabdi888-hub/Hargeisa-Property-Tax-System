const { Router } = require("express");
const { param } = require("express-validator");
const backupController = require("../controllers/backupController");
const { uploadBackupFile } = require("../middleware/backupUpload");
const { isSafeFilename } = require("../services/backupService");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");

const router = Router();

router.use(verifyAuth, requireRole("admin"));

router.get("/", backupController.list);
router.post("/", backupController.create);
router.get(
  "/:filename/download",
  param("filename").custom((value) => isSafeFilename(value)).withMessage("Invalid backup filename"),
  validate,
  backupController.download
);
router.post("/restore", uploadBackupFile, backupController.restore);

module.exports = router;
