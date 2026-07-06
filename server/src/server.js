require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await pool.query("SELECT 1");
  console.log("Database connection verified.");

  app.listen(PORT, () => {
    console.log(`Hargeisa Tax API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
