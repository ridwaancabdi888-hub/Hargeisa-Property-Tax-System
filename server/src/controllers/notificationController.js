const NotificationModel = require("../models/NotificationModel");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function toPublicNotification(row) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    relatedPropertyId: row.related_property_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    NotificationModel.listForUser(req.user.id),
    NotificationModel.countUnreadForUser(req.user.id),
  ]);
  sendSuccess(res, {
    message: "Notifications fetched successfully",
    data: notifications.map(toPublicNotification),
    meta: { unreadCount },
  });
});

const markRead = asyncHandler(async (req, res) => {
  await NotificationModel.markAsRead(req.params.id, req.user.id);
  sendSuccess(res, { message: "Notification marked as read" });
});

module.exports = { list, markRead };
