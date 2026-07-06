// Applies the schema + seeds the default admin against the dedicated test database
// (hargeisa_tax_test_db), never the dev database. Run via `npm run pretest`.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.test"), override: true });
require("../src/db/migrate.js");
