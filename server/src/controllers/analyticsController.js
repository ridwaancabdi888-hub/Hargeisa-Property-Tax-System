const analyticsService = require("../services/analyticsService");
const { toAnalyticsPdfBuffer } = require("../services/exportService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getOverview();
  sendSuccess(res, { message: "Analytics fetched successfully", data: overview });
});

const exportPdf = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getOverview();
  const buffer = await toAnalyticsPdfBuffer(overview);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="analytics-${Date.now()}.pdf"`);
  res.send(buffer);
});

module.exports = { getOverview, exportPdf };
