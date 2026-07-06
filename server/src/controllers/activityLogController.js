const activityLogService = require("../services/activityLogService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function toPublicLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userFullName: row.user_full_name,
    userUsername: row.user_username,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    description: row.description,
    oldValues: row.old_values ? JSON.parse(row.old_values) : null,
    newValues: row.new_values ? JSON.parse(row.new_values) : null,
    ipAddress: row.ip_address,
    createdAt: row.created_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await activityLogService.listActivityLogs(req.query);
  sendSuccess(res, { message: "Activity logs fetched successfully", data: items.map(toPublicLog), meta });
});

module.exports = { list };
