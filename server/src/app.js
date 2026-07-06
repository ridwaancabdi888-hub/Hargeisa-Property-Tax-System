const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const backupRoutes = require("./routes/backupRoutes");
const openapiSpec = require("./docs/openapiSpec");
const { apiLimiter } = require("./middleware/rateLimiter");
const { ensureCsrfCookie, csrfProtection, getCsrfToken } = require("./middleware/csrf");
const sanitizeInput = require("./middleware/sanitize");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const isTestEnv = process.env.NODE_ENV === "test";

// Swagger UI serves its own inline <script>/<style> HTML page — CSP is otherwise
// irrelevant here since this app only ever returns JSON/files to the separately
// hosted frontend, so disabling it globally is simpler than a per-route policy.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  })
);
app.use(cookieParser());
app.use(express.json());
if (!isTestEnv) app.use(morgan("dev"));
app.use(ensureCsrfCookie);
app.use(sanitizeInput);
app.use(csrfProtection);
// Rate limiting is skipped during automated test runs — a full Jest suite fires far
// more requests per IP in a few seconds than any real user, and would otherwise trip
// the same limiter this was designed to protect against.
if (!isTestEnv) app.use(apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "OK", data: { database: "connected" } });
  } catch {
    res.status(503).json({ success: false, message: "Database unreachable" });
  }
});
app.get("/api/csrf-token", getCsrfToken);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get("/api/docs.json", (req, res) => res.json(openapiSpec));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/property-listings", propertyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/backups", backupRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
