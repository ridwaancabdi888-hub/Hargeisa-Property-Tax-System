const ClientModel = require("../models/ClientModel");

// Maps camelCase request body fields to their snake_case DB column names —
// ClientModel.update() uses object keys directly as SQL column names.
const UPDATE_FIELD_COLUMNS = {
  fullName: "full_name",
  phone: "phone",
  email: "email",
  address: "address",
  notes: "notes",
};

function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.search) {
    clauses.push("(full_name LIKE ? OR phone LIKE ? OR email LIKE ?)");
    const term = `%${query.search}%`;
    params.push(term, term, term);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

async function listClients(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const offset = (page - 1) * limit;

  const { whereSql, params } = buildFilters(query);

  const [items, total] = await Promise.all([
    ClientModel.list({ whereSql, params, limit, offset }),
    ClientModel.count({ whereSql, params }),
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

function createClient(payload, createdBy) {
  return ClientModel.create({ ...payload, createdBy });
}

function updateClient(id, payload) {
  const fields = {};
  for (const [camelKey, column] of Object.entries(UPDATE_FIELD_COLUMNS)) {
    if (payload[camelKey] !== undefined) fields[column] = payload[camelKey];
  }
  return ClientModel.update(id, fields);
}

module.exports = {
  listClients,
  createClient,
  updateClient,
  getClient: ClientModel.findById,
  deleteClient: ClientModel.remove,
  countPropertiesForClient: ClientModel.countPropertiesForClient,
};
