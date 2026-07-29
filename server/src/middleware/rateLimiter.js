const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const pool = require("../config/db");

class MySqlRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.windowMs = 60_000;
    // Counters are shared by every process connected to the same database.
    this.localKeys = false;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  keyFor(key) {
    return crypto
      .createHash("sha256")
      .update(`${this.prefix}:${key}`)
      .digest("hex");
  }

  async increment(key) {
    const bucketKey = this.keyFor(key);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      const [rows] = await connection.query(
        `SELECT window_start_ms, request_count
         FROM rate_limit_buckets
         WHERE bucket_key = ?
         FOR UPDATE`,
        [bucketKey],
      );

      const now = Date.now();
      let windowStart = now;
      let totalHits = 1;

      if (rows.length === 0) {
        await connection.query(
          `INSERT INTO rate_limit_buckets
             (bucket_key, window_start_ms, request_count)
           VALUES (?, ?, 1)`,
          [bucketKey, now],
        );
      } else {
        const existingWindowStart = Number(rows[0].window_start_ms);
        const windowExpired = now - existingWindowStart >= this.windowMs;

        if (windowExpired) {
          await connection.query(
            `UPDATE rate_limit_buckets
             SET window_start_ms = ?, request_count = 1
             WHERE bucket_key = ?`,
            [now, bucketKey],
          );
        } else {
          windowStart = existingWindowStart;
          totalHits = Number(rows[0].request_count) + 1;
          await connection.query(
            `UPDATE rate_limit_buckets
             SET request_count = ?
             WHERE bucket_key = ?`,
            [totalHits, bucketKey],
          );
        }
      }

      await connection.commit();
      return {
        totalHits,
        resetTime: new Date(windowStart + this.windowMs),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async decrement(key) {
    await pool.query(
      `UPDATE rate_limit_buckets
       SET request_count = GREATEST(request_count - 1, 0)
       WHERE bucket_key = ?`,
      [this.keyFor(key)],
    );
  }

  async resetKey(key) {
    await pool.query(
      "DELETE FROM rate_limit_buckets WHERE bucket_key = ?",
      [this.keyFor(key)],
    );
  }
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new MySqlRateLimitStore("api"),
  message: { success: false, message: "Too many requests. Please try again later." },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: new MySqlRateLimitStore("login"),
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

module.exports = { apiLimiter, loginLimiter, MySqlRateLimitStore };
