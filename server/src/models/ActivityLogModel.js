const pool = require("../config/db");

async function create({ userId, action, entityType = null, entityId = null, description, oldValues = null, newValues = null, ipAddress = null }) {
  const [result] = await pool.query(
    `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, old_values, new_values, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      action,
      entityType,
      entityId,
      description,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress,
    ]
  );
  return result.insertId;
}

function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.search) {
    clauses.push("(al.description LIKE ? OR u.full_name LIKE ? OR u.username LIKE ?)");
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  if (query.action) {
    clauses.push("al.action = ?");
    params.push(query.action);
  }
  if (query.userId) {
    clauses.push("al.user_id = ?");
    params.push(query.userId);
  }
  if (query.date_from) {
    clauses.push("al.created_at >= ?");
    params.push(query.date_from);
  }
  if (query.date_to) {
    clauses.push("al.created_at <= ?");
    params.push(query.date_to);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

async function list({ whereSql, params, limit, offset }) {
  const [rows] = await pool.query(
    `SELECT al.id, al.user_id, u.full_name AS user_full_name, u.username AS user_username,
            al.action, al.entity_type, al.entity_id, al.description,
            al.old_values, al.new_values, al.ip_address, al.created_at
     FROM activity_logs al
     LEFT JOIN users u ON u.id = al.user_id
     ${whereSql}
     ORDER BY al.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

async function count({ whereSql, params }) {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM activity_logs al LEFT JOIN users u ON u.id = al.user_id ${whereSql}`,
    params
  );
  return total;
}

module.exports = { create, buildFilters, list, count };
