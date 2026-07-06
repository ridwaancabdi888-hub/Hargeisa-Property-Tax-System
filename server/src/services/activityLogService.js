const ActivityLogModel = require("../models/ActivityLogModel");

// Thin convenience wrapper so controllers don't repeat req.user.id/req.ip plumbing.
// `req` may be omitted for system-initiated events with no request context.
async function logActivity(req, { action, entityType, entityId, description, oldValues, newValues }) {
  await ActivityLogModel.create({
    userId: req?.user?.id ?? null,
    action,
    entityType,
    entityId,
    description,
    oldValues,
    newValues,
    ipAddress: req?.ip ?? null,
  });
}

async function listActivityLogs(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;

  const { whereSql, params } = ActivityLogModel.buildFilters(query);

  const [items, total] = await Promise.all([
    ActivityLogModel.list({ whereSql, params, limit, offset }),
    ActivityLogModel.count({ whereSql, params }),
  ]);

  return {
    items,
    meta: {
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      currentPage: page,
      limit,
    },
  };
}

module.exports = { logActivity, listActivityLogs };
