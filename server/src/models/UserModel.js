const pool = require("../config/db");

const PUBLIC_FIELDS =
  "id, full_name, username, email, role, created_by, is_active, avatar_url, created_at, updated_at";

async function findByUsername(username) {
  const [rows] = await pool.query(
    `SELECT id, full_name, username, email, password_hash, role, created_by, is_active, avatar_url, created_at, updated_at
     FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id, full_name, username, email, password_hash, role, created_by, is_active, avatar_url, created_at, updated_at
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByIdWithPassword(id) {
  const [rows] = await pool.query(
    `SELECT id, full_name, username, email, password_hash, role, created_by, is_active, avatar_url, created_at, updated_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ fullName, username, email, passwordHash, role, createdBy }) {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, username, email, password_hash, role, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullName, username, email, passwordHash, role, createdBy]
  );
  return findById(result.insertId);
}

async function updateProfile(id, { fullName, email }) {
  await pool.query("UPDATE users SET full_name = ?, email = ? WHERE id = ?", [fullName, email, id]);
  return findById(id);
}

async function updatePassword(id, passwordHash) {
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

async function updateAvatar(id, avatarUrl) {
  await pool.query("UPDATE users SET avatar_url = ? WHERE id = ?", [avatarUrl, id]);
  return findById(id);
}

function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.search) {
    clauses.push("(full_name LIKE ? OR username LIKE ? OR email LIKE ?)");
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }
  if (query.role) {
    clauses.push("role = ?");
    params.push(query.role);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

async function list({ query, limit, offset }) {
  const { whereSql, params } = buildFilters(query);
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM users ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows;
}

async function count(query) {
  const { whereSql, params } = buildFilters(query);
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
  return total;
}

async function setActive(id, isActive) {
  await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [isActive, id]);
  return findById(id);
}

async function updateRole(id, role) {
  await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return findById(id);
}

module.exports = {
  findByUsername,
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  updateProfile,
  updatePassword,
  updateAvatar,
  list,
  count,
  setActive,
  updateRole,
};
