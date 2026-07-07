const pool = require("../config/db");

const FIELDS =
  "id, title, description, price, location, latitude, longitude, type, status, created_by, created_at, updated_at";

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM properties WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ title, description, price, location, latitude, longitude, type, status, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO properties (title, description, price, location, latitude, longitude, type, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'available'), ?)`,
    [title, description, price, location, latitude ?? null, longitude ?? null, type, status ?? null, createdBy]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const columns = Object.keys(fields);
  if (columns.length === 0) return findById(id);

  const setClause = columns.map((col) => `${col} = ?`).join(", ");
  const values = columns.map((col) => fields[col]);
  await pool.query(`UPDATE properties SET ${setClause} WHERE id = ?`, [...values, id]);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM properties WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

async function list({ whereSql, params, limit, offset }) {
  const [rows] = await pool.query(
    `SELECT ${FIELDS} FROM properties ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

async function count({ whereSql, params }) {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM properties ${whereSql}`,
    params
  );
  return total;
}

async function getCounts() {
  const [[row]] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'available') AS available,
       SUM(status = 'sold') AS sold,
       SUM(status = 'rented') AS rented,
       SUM(type = 'rent') AS rent,
       SUM(type = 'sale') AS sale,
       COALESCE(SUM(price), 0) AS assessedValue
     FROM properties`
  );
  return {
    total: Number(row.total),
    available: Number(row.available),
    sold: Number(row.sold),
    rented: Number(row.rented),
    rent: Number(row.rent),
    sale: Number(row.sale),
    assessedValue: Number(row.assessedValue),
  };
}

module.exports = { findById, create, update, remove, list, count, getCounts };
