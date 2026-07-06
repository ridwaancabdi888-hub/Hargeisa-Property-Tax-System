const pool = require("../config/db");

async function getOverview() {
  const [statusRows] = await pool.query(
    "SELECT status, COUNT(*) AS count FROM properties GROUP BY status"
  );
  const [typeRows] = await pool.query(
    "SELECT type, COUNT(*) AS count FROM properties GROUP BY type"
  );
  const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM properties");
  const [[{ revenue }]] = await pool.query(
    "SELECT COALESCE(SUM(price), 0) AS revenue FROM properties WHERE status = 'sold'"
  );
  const [trendRows] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
     FROM properties
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY month
     ORDER BY month ASC`
  );

  const byStatus = { available: 0, sold: 0, rented: 0 };
  statusRows.forEach((row) => {
    byStatus[row.status] = Number(row.count);
  });

  const byType = { rent: 0, sale: 0 };
  typeRows.forEach((row) => {
    byType[row.type] = Number(row.count);
  });

  return {
    totals: {
      total: Number(total),
      available: byStatus.available,
      sold: byStatus.sold,
      rented: byStatus.rented,
    },
    revenue: Number(revenue),
    byType: [
      { type: "rent", count: byType.rent },
      { type: "sale", count: byType.sale },
    ],
    monthlyTrend: trendRows.map((row) => ({ month: row.month, count: Number(row.count) })),
  };
}

module.exports = { getOverview };
