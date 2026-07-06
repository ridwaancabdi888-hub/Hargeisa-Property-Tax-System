const fs = require("fs/promises");
const path = require("path");
const PropertyImageModel = require("../models/PropertyImageModel");
const propertyService = require("../services/propertyService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { UPLOAD_DIR } = require("../middleware/upload");

function toPublicImage(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    url: row.url,
    createdAt: row.created_at,
  };
}

const uploadImages = asyncHandler(async (req, res) => {
  const property = await propertyService.getProperty(req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, message: "Property not found" });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "At least one image file is required" });
  }

  const urls = req.files.map((file) => `/uploads/properties/${file.filename}`);
  const images = await PropertyImageModel.createMany(property.id, urls);
  sendSuccess(res, {
    status: 201,
    message: "Images uploaded successfully",
    data: images.map(toPublicImage),
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const image = await PropertyImageModel.findById(req.params.imageId);
  if (!image || String(image.property_id) !== String(req.params.id)) {
    return res.status(404).json({ success: false, message: "Image not found" });
  }

  await PropertyImageModel.remove(image.id);
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(image.url))).catch(() => {});

  sendSuccess(res, { message: "Image deleted successfully" });
});

module.exports = { uploadImages, deleteImage, toPublicImage };
