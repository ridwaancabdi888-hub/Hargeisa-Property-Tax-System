const propertyService = require("../services/propertyService");
const PropertyImageModel = require("../models/PropertyImageModel");
const NotificationModel = require("../models/NotificationModel");
const { logActivity } = require("../services/activityLogService");
const { toCsv, toExcelBuffer, toTaxBillPdfBuffer } = require("../services/exportService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

// Illustrative flat municipal property tax rate used for the "Generate Tax
// Bill" feature. No real per-property tax assessment model exists in this
// system, so bills are computed as a simple percentage of the listing price.
const TAX_RATE = 0.01;

function toPublicProperty(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    location: row.location,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    type: row.type,
    status: row.status,
    clientId: row.client_id ?? null,
    clientName: row.client_name ?? null,
    clientPhone: row.client_phone ?? null,
    clientEmail: row.client_email ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const list = asyncHandler(async (req, res) => {
  const { items, meta } = await propertyService.listProperties(req.query);
  sendSuccess(res, { message: "Properties fetched successfully", data: items.map(toPublicProperty), meta });
});

const getCounts = asyncHandler(async (req, res) => {
  const counts = await propertyService.getCounts();
  sendSuccess(res, { message: "Property counts fetched successfully", data: counts });
});

const getOne = asyncHandler(async (req, res) => {
  const property = await propertyService.getProperty(req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }
  const images = await PropertyImageModel.findByPropertyId(property.id);
  sendSuccess(res, {
    message: "Property fetched successfully",
    data: {
      ...toPublicProperty(property),
      images: images.map((img) => ({ id: img.id, url: img.url, createdAt: img.created_at })),
    },
  });
});

const create = asyncHandler(async (req, res) => {
  const { title, description, price, location, latitude, longitude, clientId, type, status } = req.body;
  const property = await propertyService.createProperty(
    { title, description, price, location, latitude, longitude, clientId, type, status },
    req.user.id
  );

  await NotificationModel.create({
    type: "property_created",
    message: `"${property.title}" was added to the property listings`,
    relatedPropertyId: property.id,
    createdBy: req.user.id,
  });
  await logActivity(req, {
    action: "property_created",
    entityType: "property",
    entityId: property.id,
    description: `Created property "${property.title}"`,
    newValues: toPublicProperty(property),
  });

  sendSuccess(res, { status: 201, message: "Property created successfully", data: toPublicProperty(property) });
});

const update = asyncHandler(async (req, res) => {
  const existing = await propertyService.getProperty(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }
  const property = await propertyService.updateProperty(req.params.id, req.body);

  if (existing.status !== "sold" && property.status === "sold") {
    await NotificationModel.create({
      type: "property_sold",
      message: `"${property.title}" was marked as sold`,
      relatedPropertyId: property.id,
      createdBy: req.user.id,
    });
  }
  await logActivity(req, {
    action: "property_updated",
    entityType: "property",
    entityId: property.id,
    description: `Updated property "${property.title}"`,
    oldValues: toPublicProperty(existing),
    newValues: toPublicProperty(property),
  });

  sendSuccess(res, { message: "Property updated successfully", data: toPublicProperty(property) });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await propertyService.getProperty(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }
  await propertyService.deleteProperty(req.params.id);

  await NotificationModel.create({
    type: "property_deleted",
    message: `"${existing.title}" was deleted`,
    createdBy: req.user.id,
  });
  await logActivity(req, {
    action: "property_deleted",
    entityType: "property",
    entityId: existing.id,
    description: `Deleted property "${existing.title}"`,
    oldValues: toPublicProperty(existing),
  });

  sendSuccess(res, { message: "Property deleted successfully" });
});

const exportCsv = asyncHandler(async (req, res) => {
  const properties = await propertyService.listAllForExport(req.query);
  const csv = toCsv(properties.map(toPublicProperty));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="properties-${Date.now()}.csv"`);
  res.send(csv);
});

const exportExcel = asyncHandler(async (req, res) => {
  const properties = await propertyService.listAllForExport(req.query);
  const buffer = await toExcelBuffer(properties.map(toPublicProperty));
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="properties-${Date.now()}.xlsx"`);
  res.send(buffer);
});

const generateTaxBill = asyncHandler(async (req, res) => {
  const property = await propertyService.getProperty(req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }
  const publicProperty = toPublicProperty(property);
  const buffer = await toTaxBillPdfBuffer(publicProperty, TAX_RATE);

  await logActivity(req, {
    action: "tax_bill_generated",
    entityType: "property",
    entityId: property.id,
    description: `Generated tax bill for "${property.title}"`,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="tax-bill-${property.id}-${Date.now()}.pdf"`);
  res.send(buffer);
});

module.exports = { list, getCounts, getOne, create, update, remove, exportCsv, exportExcel, generateTaxBill };
