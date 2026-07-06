const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const AVATAR_UPLOAD_DIR = path.join(__dirname, "../../uploads/avatars");
fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TYPES[file.mimetype] || path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
  }
  cb(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("avatar");

// Same error-wrapping pattern as middleware/upload.js — turns multer's callback-style
// errors (bad mimetype, oversized file) into a normal { success:false, message } 400.
function uploadAvatar(req, res, next) {
  multerUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "Avatar upload failed" });
    }
    next();
  });
}

module.exports = { uploadAvatar, AVATAR_UPLOAD_DIR };
