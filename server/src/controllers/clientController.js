const clientService = require("../services/clientService");
const { logActivity } = require("../services/activityLogService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function toPublicClient(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await clientService.listClients(req.query);
  sendSuccess(res, { message: "Clients fetched successfully", data: items.map(toPublicClient), meta });
});

const getOne = asyncHandler(async (req, res) => {
  const client = await clientService.getClient(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, message: "Client not found" });
  }
  const propertyCount = await clientService.countPropertiesForClient(client.id);
  sendSuccess(res, { message: "Client fetched successfully", data: { ...toPublicClient(client), propertyCount } });
});

const create = asyncHandler(async (req, res) => {
  const { fullName, phone, email, address, notes } = req.body;
  const client = await clientService.createClient({ fullName, phone, email, address, notes }, req.user.id);

  await logActivity(req, {
    action: "client_created",
    entityType: "client",
    entityId: client.id,
    description: `Added client "${client.full_name}"`,
  });

  sendSuccess(res, { status: 201, message: "Client created successfully", data: toPublicClient(client) });
});

const update = asyncHandler(async (req, res) => {
  const existing = await clientService.getClient(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Client not found" });
  }
  const client = await clientService.updateClient(req.params.id, req.body);

  await logActivity(req, {
    action: "client_updated",
    entityType: "client",
    entityId: client.id,
    description: `Updated client "${client.full_name}"`,
    oldValues: toPublicClient(existing),
    newValues: toPublicClient(client),
  });

  sendSuccess(res, { message: "Client updated successfully", data: toPublicClient(client) });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await clientService.getClient(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Client not found" });
  }
  await clientService.deleteClient(req.params.id);

  await logActivity(req, {
    action: "client_deleted",
    entityType: "client",
    entityId: existing.id,
    description: `Deleted client "${existing.full_name}"`,
    oldValues: toPublicClient(existing),
  });

  sendSuccess(res, { message: "Client deleted successfully" });
});

module.exports = { list, getOne, create, update, remove, toPublicClient };
