const UserSettingsModel = require("../models/UserSettingsModel");

// Maps the camelCase request/response field names to the snake_case DB columns.
const FIELD_MAP = {
  theme: "theme",
  language: "language",
  timezone: "timezone",
  dateFormat: "date_format",
  notifyPropertyCreated: "notify_property_created",
  notifyPropertySold: "notify_property_sold",
  notifyPropertyDeleted: "notify_property_deleted",
};

async function getSettings(userId) {
  const existing = await UserSettingsModel.findByUserId(userId);
  if (existing) return existing;
  return UserSettingsModel.createDefault(userId);
}

function updateSettings(userId, payload) {
  const fields = {};
  for (const [camelKey, columnName] of Object.entries(FIELD_MAP)) {
    if (payload[camelKey] !== undefined) fields[columnName] = payload[camelKey];
  }
  return UserSettingsModel.update(userId, fields);
}

module.exports = { getSettings, updateSettings };
