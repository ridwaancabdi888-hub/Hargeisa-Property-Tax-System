function sendSuccess(res, { status = 200, message = "OK", data = null, meta = null } = {}) {
  res.status(status).json({ success: true, message, data, meta });
}

module.exports = { sendSuccess };
