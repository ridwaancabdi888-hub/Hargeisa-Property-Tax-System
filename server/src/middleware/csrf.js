const crypto = require("crypto");

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Double-submit-cookie CSRF: the cookie is readable by JS (not httpOnly) so the
// frontend can echo it back as a header. An attacker's cross-site form/script can
// trigger a request with the cookie attached automatically, but cannot read the
// cookie's value to also set the matching header — so the two won't match.
function ensureCsrfCookie(req, res, next) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    req.cookies = { ...req.cookies, [CSRF_COOKIE]: token };
  }
  next();
}

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get(CSRF_HEADER);
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, message: "Invalid or missing CSRF token" });
  }
  next();
}

function getCsrfToken(req, res) {
  res.json({ success: true, message: "CSRF token issued", data: { csrfToken: req.cookies[CSRF_COOKIE] } });
}

module.exports = { ensureCsrfCookie, csrfProtection, getCsrfToken };
