const pool = require("../config/db");

const FIELDS =
  "user_id, theme, language, timezone, date_format, notify_property_created, notify_property_sold, notify_property_deleted, updated_at";

async function findByUserId(userId) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM user_settings WHERE user_id = ? LIMIT 1`, [userId]);
  return rows[0] || null;
}

async function createDefault(userId) {
  await pool.query("INSERT IGNORE INTO user_settings (user_id) VALUES (?)", [userId]);
  return findByUserId(userId);
}

async function update(userId, fields) {
  const columns = Object.keys(fields);
  if (columns.length === 0) return findByUserId(userId);

  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = columns.map((col) => fields[col]);
  await pool.query(`UPDATE user_settings SET ${setClause} WHERE user_id = ?`, [...values, userId]);
  return findByUserId(userId);
}

module.exports = { findByUserId, createDefault, update };
