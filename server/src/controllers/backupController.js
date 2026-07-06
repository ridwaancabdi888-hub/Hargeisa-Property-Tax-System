const fs = require("fs/promises");
const backupService = require("../services/backupService");
const { logActivity } = require("../services/activityLogService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const list = asyncHandler(async (req, res) => {
  const backups = await backupService.listBackups();
  sendSuccess(res, { message: "Backups fetched successfully", data: backups });
});

const create = asyncHandler(async (req, res) => {
  const backup = await backupService.createBackup();

  await logActivity(req, {
    action: "backup_created",
    entityType: "backup",
    description: `Created database backup "${backup.filename}"`,
  });

  sendSuccess(res, { status: 201, message: "Backup created successfully", data: backup });
});

const download = asyncHandler(async (req, res) => {
  const filePath = backupService.getBackupPath(req.params.filename);
  if (!filePath) {
    return res.status(404).json({ success: false, message: "Backup not found" });
  }
  res.download(filePath, req.params.filename);
});

const restore = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "A .sql backup file is required" });
  }

  try {
    const safetyBackup = await backupService.restoreBackup(req.file.path);

    await logActivity(req, {
      action: "backup_restored",
      entityType: "backup",
      description: `Restored database from an uploaded backup (safety backup: "${safetyBackup.filename}")`,
    });

    sendSuccess(res, { message: "Database restored successfully", data: { safetyBackup: safetyBackup.filename } });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

module.exports = { list, create, download, restore };
