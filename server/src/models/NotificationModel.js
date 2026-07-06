const pool = require("../config/db");

async function create({ type, message, relatedPropertyId = null, createdBy = null }) {
  const [result] = await pool.query(
    "INSERT INTO notifications (type, message, related_property_id, created_by) VALUES (?, ?, ?, ?)",
    [type, message, relatedPropertyId, createdBy]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, type, message, related_property_id, created_by, created_at FROM notifications WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function listForUser(userId, { limit = 20 } = {}) {
  const [rows] = await pool.query(
    `SELECT n.id, n.type, n.message, n.related_property_id, n.created_by, n.created_at,
            (nr.notification_id IS NOT NULL) AS is_read
     FROM notifications n
     LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
     ORDER BY n.created_at DESC
     LIMIT ?`,
    [userId, limit]
  );
  return rows;
}

async function countUnreadForUser(userId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM notifications n
     LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
     WHERE nr.notification_id IS NULL`,
    [userId]
  );
  return Number(count);
}

async function markAsRead(notificationId, userId) {
  await pool.query(
    "INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)",
    [notificationId, userId]
  );
}

module.exports = { create, findById, listForUser, countUnreadForUser, markAsRead };
