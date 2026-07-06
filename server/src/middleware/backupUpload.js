const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const RESTORE_UPLOAD_DIR = path.join(__dirname, "../../backups/incoming");
fs.mkdirSync(RESTORE_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, RESTORE_UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `restore-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.sql`),
});

function fileFilter(req, file, cb) {
  if (!file.originalname.toLowerCase().endsWith(".sql")) {
    return cb(new Error("Only .sql backup files are accepted"));
  }
  cb(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024, files: 1 },
}).single("backup");

function uploadBackupFile(req, res, next) {
  multerUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Backup upload failed" });
    }
    next();
  });
}

module.exports = { uploadBackupFile, RESTORE_UPLOAD_DIR };
