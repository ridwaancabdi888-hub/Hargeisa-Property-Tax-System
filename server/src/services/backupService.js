const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");

const BACKUP_DIR = path.join(__dirname, "../../backups");
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const MYSQLDUMP_BIN = process.env.MYSQLDUMP_BIN || "mysqldump";
const MYSQL_BIN = process.env.MYSQL_BIN || "mysql";

function connectionArgs() {
  return ["-h", process.env.DB_HOST, "-P", String(process.env.DB_PORT || 3306), "-u", process.env.DB_USER];
}

function connectionEnv() {
  // MYSQL_PWD avoids the password ever appearing in a process listing (argv is
  // visible to other processes/users on the same machine; env vars set this way
  // for a single child process are not).
  return { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD || "" };
}

function isSafeFilename(filename) {
  return /^[\w.-]+\.sql$/.test(filename);
}

function createBackup() {
  return new Promise((resolve, reject) => {
    const filename = `backup-${Date.now()}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);
    const args = [...connectionArgs(), process.env.DB_NAME];

    const dump = spawn(MYSQLDUMP_BIN, args, { env: connectionEnv() });
    const out = fs.createWriteStream(filePath);
    dump.stdout.pipe(out);

    let stderr = "";
    dump.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    dump.on("error", (err) => reject(new Error(`Failed to start mysqldump: ${err.message}`)));
    dump.on("close", (code) => {
      if (code !== 0) {
        fs.unlink(filePath, () => {});
        return reject(new Error(`mysqldump exited with code ${code}: ${stderr.slice(0, 500)}`));
      }
      resolve({ filename, filePath });
    });
  });
}

function runRestore(filePath) {
  return new Promise((resolve, reject) => {
    const args = [...connectionArgs(), process.env.DB_NAME];
    const restore = spawn(MYSQL_BIN, args, { env: connectionEnv() });
    fs.createReadStream(filePath).pipe(restore.stdin);

    let stderr = "";
    restore.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    restore.on("error", (err) => reject(new Error(`Failed to start mysql: ${err.message}`)));
    restore.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`mysql restore exited with code ${code}: ${stderr.slice(0, 500)}`));
      }
      resolve();
    });
  });
}

async function restoreBackup(sqlFilePath) {
  // Always take a fresh safety backup immediately before overwriting anything.
  const safetyBackup = await createBackup();
  await runRestore(sqlFilePath);
  return safetyBackup;
}

async function listBackups() {
  const files = await fsp.readdir(BACKUP_DIR);
  const sqlFiles = files.filter((f) => f.endsWith(".sql"));
  const withStats = await Promise.all(
    sqlFiles.map(async (filename) => {
      const stat = await fsp.stat(path.join(BACKUP_DIR, filename));
      return { filename, sizeBytes: stat.size, createdAt: stat.mtime };
    })
  );
  return withStats.sort((a, b) => b.createdAt - a.createdAt);
}

function getBackupPath(filename) {
  if (!isSafeFilename(filename)) return null;
  const filePath = path.join(BACKUP_DIR, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

module.exports = { createBackup, restoreBackup, listBackups, getBackupPath, BACKUP_DIR, isSafeFilename };
