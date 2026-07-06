const PropertyModel = require("../models/PropertyModel");

const ALLOWED_UPDATE_FIELDS = ["title", "description", "price", "location", "type", "status"];

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

function createProperty(payload, createdBy) {
  return PropertyModel.create({ ...payload, createdBy });
}

function updateProperty(id, payload) {
  const fields = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (payload[key] !== undefined) fields[key] = payload[key];
  }
  return PropertyModel.update(id, fields);
}

module.exports = {
  listProperties,
  listAllForExport,
  createProperty,
  updateProperty,
  getProperty: PropertyModel.findById,
  deleteProperty: PropertyModel.remove,
};
