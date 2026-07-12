const pool = require("../config/db");

const FIELDS =
  "p.id, p.title, p.description, p.price, p.location, p.latitude, p.longitude, p.type, p.status, " +
  "p.client_id, c.full_name AS client_name, c.phone AS client_phone, c.email AS client_email, " +
  "(SELECT pi.url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.id ASC LIMIT 1) AS cover_image_url, " +
  "p.created_by, p.created_at, p.updated_at";
const FROM = "properties p LEFT JOIN clients c ON c.id = p.client_id";

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${FIELDS} FROM ${FROM} WHERE p.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ title, description, price, location, latitude, longitude, clientId, type, status, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO properties (title, description, price, location, latitude, longitude, client_id, type, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'available'), ?)`,
    [title, description, price, location, latitude ?? null, longitude ?? null, clientId ?? null, type, status ?? null, createdBy]
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
  // whereSql clauses reference bare column names (e.g. "type = ?") — since
  // properties is the only table with those column names, no "p." prefix
  // rewrite is needed for the join to resolve them correctly.
  const [rows] = await pool.query(
    `SELECT ${FIELDS} FROM ${FROM} ${whereSql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

async function count({ whereSql, params }) {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM ${FROM} ${whereSql}`,
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
