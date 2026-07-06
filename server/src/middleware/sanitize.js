// Strips control characters and trims whitespace from every string field in the
// request body. Deliberately does NOT HTML-entity-escape values: React already
// escapes on render (no dangerouslySetInnerHTML anywhere in this app), so escaping
// here would just corrupt legitimate apostrophes/quotes in stored text for no
// additional safety.
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

function sanitizeValue(value) {
  if (typeof value === "string") {
    return value.replace(CONTROL_CHARS, "").trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj) {
  for (const key of Object.keys(obj)) {
    obj[key] = sanitizeValue(obj[key]);
  }
  return obj;
}

function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  next();
}

module.exports = sanitizeInput;
