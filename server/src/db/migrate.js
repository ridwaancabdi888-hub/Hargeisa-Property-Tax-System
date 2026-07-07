require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SEED_ADMIN_USERNAME,
  SEED_ADMIN_PASSWORD,
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_FULL_NAME,
} = process.env;

// "ADD COLUMN IF NOT EXISTS" is a MariaDB-only extension — real MySQL (e.g.
// Railway's MySQL 9.4) rejects it with a syntax error. Check information_schema
// first so this works identically on both engines.
async function addColumnIfMissing(connection, dbName, table, column, definitionSql) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, table, column]
  );
  if (rows[0].cnt > 0) return;
  await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definitionSql}`);
}

async function main() {
  const bootstrapConnection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await bootstrapConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrapConnection.end();

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await connection.query(schema);
  console.log(`Schema applied to database "${DB_NAME}".`);

  // Phase 4 role rename (admin/staff -> admin/agent/viewer). CREATE TABLE IF NOT EXISTS
  // above is a no-op on an already-existing users table, so the enum widen/migrate/narrow
  // has to happen explicitly here. All three statements are safe to re-run.
  await connection.query(
    "ALTER TABLE users MODIFY role ENUM('admin','staff','agent','viewer') NOT NULL DEFAULT 'agent'"
  );
  const [staffMigration] = await connection.query(
    "UPDATE users SET role = 'agent' WHERE role = 'staff'"
  );
  if (staffMigration.affectedRows > 0) {
    console.log(`Migrated ${staffMigration.affectedRows} 'staff' user(s) to 'agent'.`);
  }
  await connection.query(
    "ALTER TABLE users MODIFY role ENUM('admin','agent','viewer') NOT NULL DEFAULT 'agent'"
  );

  // Phase 5: profile pictures. Schema.sql's CREATE TABLE IF NOT EXISTS won't add a
  // column to the already-existing users table, so add it explicitly (idempotent).
  await addColumnIfMissing(connection, DB_NAME, "users", "avatar_url", "VARCHAR(255) NULL");

  // GIS map coordinates. Optional — only properties with both set are plotted.
  await addColumnIfMissing(connection, DB_NAME, "properties", "latitude", "DECIMAL(10, 7) NULL AFTER location");
  await addColumnIfMissing(connection, DB_NAME, "properties", "longitude", "DECIMAL(10, 7) NULL AFTER latitude");

  const [existingAdmins] = await connection.query(
    "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
  );

  if (existingAdmins.length === 0) {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
    await connection.query(
      `INSERT INTO users (full_name, username, email, password_hash, role, created_by)
       VALUES (?, ?, ?, ?, 'admin', NULL)`,
      [SEED_ADMIN_FULL_NAME, SEED_ADMIN_USERNAME, SEED_ADMIN_EMAIL, passwordHash]
    );
    console.log("Seeded default admin account:");
    console.log(`  username: ${SEED_ADMIN_USERNAME}`);
    console.log(`  password: ${SEED_ADMIN_PASSWORD}`);
  } else {
    console.log("Admin account already exists, skipping seed.");
  }

  const [[{ count }]] = await connection.query(
    "SELECT COUNT(*) AS count FROM users"
  );
  console.log(`Migration complete. users table has ${count} row(s).`);

  await connection.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
