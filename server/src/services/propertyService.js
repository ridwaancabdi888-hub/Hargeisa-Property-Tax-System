const PropertyModel = require("../models/PropertyModel");

// Maps request body fields to their DB column names — PropertyModel.update()
// uses object keys directly as SQL column names. Most are identical; clientId
// is the one that differs from its column (client_id).
const ALLOWED_UPDATE_FIELDS = {
  title: "title",
  description: "description",
  price: "price",
  location: "location",
  latitude: "latitude",
  longitude: "longitude",
  clientId: "client_id",
  type: "type",
  status: "status",
};

function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.search) {
    clauses.push("(title LIKE ? OR location LIKE ?)");
    const term = `%${query.search}%`;
    params.push(term, term);
  }
  if (query.type) {
    clauses.push("type = ?");
    params.push(query.type);
  }
  if (query.status) {
    clauses.push("status = ?");
    params.push(query.status);
  }
  if (query.min_price !== undefined) {
    clauses.push("price >= ?");
    params.push(query.min_price);
  }
  if (query.max_price !== undefined) {
    clauses.push("price <= ?");
    params.push(query.max_price);
  }
  if (query.client_id !== undefined) {
    clauses.push("client_id = ?");
    params.push(query.client_id);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

async function listProperties(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const { whereSql, params } = buildFilters(query);

  const [items, total] = await Promise.all([
    PropertyModel.list({ whereSql, params, limit, offset }),
    PropertyModel.count({ whereSql, params }),
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

// For exports — same filters as listProperties but no pagination, capped to avoid
// unbounded memory use on a runaway export.
async function listAllForExport(query) {
  const { whereSql, params } = buildFilters(query);
  return PropertyModel.list({ whereSql, params, limit: 10000, offset: 0 });
}

// Single-query aggregate counts (total/by-status/by-type/assessed value),
// accessible to every authenticated role — unlike /api/analytics which is
// admin-only. Used by dashboard-style pages so they don't need to fire one
// request per count.
async function getCounts() {
  return PropertyModel.getCounts();
}

function createProperty(payload, createdBy) {
  return PropertyModel.create({ ...payload, createdBy });
}

function updateProperty(id, payload) {
  const fields = {};
  for (const [key, column] of Object.entries(ALLOWED_UPDATE_FIELDS)) {
    if (payload[key] !== undefined) fields[column] = payload[key];
  }
  return PropertyModel.update(id, fields);
}

module.exports = {
  listProperties,
  listAllForExport,
  getCounts,
  createProperty,
  updateProperty,
  getProperty: PropertyModel.findById,
  deleteProperty: PropertyModel.remove,
};
