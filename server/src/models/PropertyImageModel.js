const pool = require("../config/db");

async function findByPropertyId(propertyId) {
  const [rows] = await pool.query(
    "SELECT id, property_id, url, created_at FROM property_images WHERE property_id = ? ORDER BY created_at ASC",
    [propertyId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, property_id, url, created_at FROM property_images WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createMany(propertyId, urls) {
  if (urls.length === 0) return [];
  const values = urls.map((url) => [propertyId, url]);
  await pool.query("INSERT INTO property_images (property_id, url) VALUES ?", [values]);
  return findByPropertyId(propertyId);
}

async function remove(id) {
  const [result] = await pool.query("DELETE FROM property_images WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findByPropertyId, findById, createMany, remove };
