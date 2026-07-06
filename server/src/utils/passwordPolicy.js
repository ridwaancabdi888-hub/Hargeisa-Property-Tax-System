// At least 8 characters, one uppercase, one lowercase, and one digit.
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const STRONG_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number";

module.exports = { STRONG_PASSWORD_REGEX, STRONG_PASSWORD_MESSAGE };
