const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const PROPERTY_COLUMNS = [
  { header: "ID", key: "id", width: 8 },
  { header: "Title", key: "title", width: 30 },
  { header: "Description", key: "description", width: 40 },
  { header: "Price", key: "price", width: 14 },
  { header: "Location", key: "location", width: 22 },
  { header: "Owner", key: "clientName", width: 22 },
  { header: "Type", key: "type", width: 10 },
  { header: "Status", key: "status", width: 12 },
  { header: "Created At", key: "createdAt", width: 20 },
];

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(properties) {
  const header = PROPERTY_COLUMNS.map((c) => c.header).join(",");
  const rows = properties.map((p) => PROPERTY_COLUMNS.map((c) => csvEscape(p[c.key])).join(","));
  return [header, ...rows].join("\n");
}

async function toExcelBuffer(properties) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hargeisa Tax Property Management";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Properties");
  sheet.columns = PROPERTY_COLUMNS;
  sheet.getRow(1).font = { bold: true };
  properties.forEach((p) => sheet.addRow(p));

  return workbook.xlsx.writeBuffer();
}

function toAnalyticsPdfBuffer(overview) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Property Analytics Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666666").text(`Generated ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1.5);
    doc.fillColor("#000000");

    doc.fontSize(14).text("Portfolio Totals");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Properties: ${overview.totals.total}`);
    doc.text(`Available: ${overview.totals.available}`);
    doc.text(`Sold: ${overview.totals.sold}`);
    doc.text(`Rented: ${overview.totals.rented}`);
    doc.text(`Realized Revenue: $${Number(overview.revenue).toLocaleString()}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text("Listings by Type");
    doc.moveDown(0.5);
    doc.fontSize(11);
    overview.byType.forEach((t) => doc.text(`${t.type === "sale" ? "Sale" : "Rent"}: ${t.count}`));
    doc.moveDown(1.5);

    doc.fontSize(14).text("Monthly Creation Trend");
    doc.moveDown(0.5);
    doc.fontSize(11);
    if (overview.monthlyTrend.length === 0) {
      doc.text("No properties created in the last 12 months.");
    } else {
      overview.monthlyTrend.forEach((m) => doc.text(`${m.month}: ${m.count} new listing(s)`));
    }

    doc.end();
  });
}

function toTaxBillPdfBuffer(property, taxRate) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const taxAmount = property.price * taxRate;
    const billNumber = `HMS-${property.id}-${new Date().getFullYear()}`;

    doc.fontSize(18).text("Hargeisa Municipal Property Tax Bill", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666666").text(`Bill No. ${billNumber}`, { align: "center" });
    doc.text(`Issued ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1.5);
    doc.fillColor("#000000");

    doc.fontSize(14).text("Property Details");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Property ID: ${property.id}`);
    doc.text(`Title: ${property.title}`);
    doc.text(`Location: ${property.location}`);
    doc.text(`Listing Type: ${property.type === "sale" ? "Sale" : "Rent"}`);
    doc.text(`Status: ${property.status}`);
    doc.text(`Listing Price: $${Number(property.price).toLocaleString()}`);
    doc.moveDown(1.5);

    doc.fontSize(14).text("Billed To (Owner)");
    doc.moveDown(0.5);
    doc.fontSize(11);
    if (property.clientName) {
      doc.text(`Name: ${property.clientName}`);
      if (property.clientPhone) doc.text(`Phone: ${property.clientPhone}`);
      if (property.clientEmail) doc.text(`Email: ${property.clientEmail}`);
    } else {
      doc.fillColor("#999999").text("No owner on file for this property.");
      doc.fillColor("#000000");
    }
    doc.moveDown(1.5);

    doc.fontSize(14).text("Tax Assessment");
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Tax Rate: ${(taxRate * 100).toFixed(1)}% of listing price`);
    doc.text(`Tax Amount Due: $${taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    doc.moveDown(1.5);

    doc.fontSize(9).fillColor("#666666").text(
      "This bill is generated using a flat illustrative municipal tax rate for demonstration purposes and does not reflect a formal property assessment.",
      { align: "left" }
    );

    doc.end();
  });
}

module.exports = { toCsv, toExcelBuffer, toAnalyticsPdfBuffer, toTaxBillPdfBuffer };
