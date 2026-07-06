const settingsService = require("../services/settingsService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function toPublicSettings(row) {
  return {
    theme: row.theme,
    language: row.language,
    timezone: row.timezone,
    dateFormat: row.date_format,
    notifyPropertyCreated: Boolean(row.notify_property_created),
    notifyPropertySold: Boolean(row.notify_property_sold),
    notifyPropertyDeleted: Boolean(row.notify_property_deleted),
    updatedAt: row.updated_at,
  };
}

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(req.user.id);
  sendSuccess(res, { message: "Settings fetched successfully", data: toPublicSettings(settings) });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.user.id, req.body);
  sendSuccess(res, { message: "Settings updated successfully", data: toPublicSettings(settings) });
});

module.exports = { getSettings, updateSettings };
