const pool = require("../config/db");

const FIELDS = "id, full_name, phone, email, address, notes, created_by, created_at, updated_at";

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM clients WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ fullName, phone, email, address, notes, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO clients (full_name, phone, email, address, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, phone ?? null, email ?? null, address ?? null, notes ?? null, createdBy]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const columns = Object.keys(fields);
  if (columns.length === 0) return findById(id);

  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = columns.map((col) => fields[col]);
  await pool.query(`UPDATE clients SET ${setClause} WHERE id = ?`, [...values, id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM clients WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function list({ whereSql, params, limit, offset }) {
  const [rows] = await pool.query(
    `SELECT ${FIELDS} FROM clients ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

async function count({ whereSql, params }) {
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM clients ${whereSql}`, params);
  return total;
}

async function countPropertiesForClient(id) {
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM properties WHERE client_id = ?", [id]);
  return total;
}

module.exports = { findById, create, update, remove, list, count, countPropertiesForClient };
