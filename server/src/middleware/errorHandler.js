function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// The unused 4th parameter is required: Express only treats a middleware as an
// error handler when its function signature declares exactly four parameters.
function errorHandler(err, req, res, _next) {
  // Always log the full error server-side regardless of environment.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ success: false, message: "Username or email already in use" });
  }

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  // Never leak internals (stack traces, raw driver messages) to the client in production.
  const message = status === 500 && isProduction ? "Internal server error" : err.message || "Internal server error";

  const body = { success: false, message };
  if (!isProduction && status === 500) {
    body.stack = err.stack;
  }
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
