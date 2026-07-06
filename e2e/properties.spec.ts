import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ADMIN_PASSWORD, ADMIN_USERNAME, login } from "./fixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Properties: CRUD, uploads, exports", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.goto("/property-listings");
    await page.waitForSelector("text=Manage rental and sale property listings");
  });

  test("creates, edits, and deletes a property with an uploaded image", async ({ page }) => {
    const tinyPngPath = path.join(__dirname, "tiny.png");
    fs.writeFileSync(tinyPngPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    const title = `E2E Villa ${Date.now()}`;
    await page.click('button:has-text("Add Property")');
    await page.waitForSelector('h2:has-text("Add Property")');
    await page.fill("#property-title", title);
    await page.fill("#property-description", "Created by the e2e suite");
    await page.fill("#property-price", "150000");
    await page.fill("#property-location", "Hargeisa");
    await page.setInputFiles('input[type="file"]', tinyPngPath);
    await page.waitForTimeout(300);
    await page.click('button:has-text("Create Property")');
    await page.waitForSelector(`text=${title}`, { timeout: 10000 });

    await page.locator(`tr:has-text("${title}") button[aria-label="Edit property"]`).click();
    await page.waitForSelector('h2:has-text("Edit Property")');
    await expect(page.locator('img[alt=""]').first()).toBeVisible();
    await page.fill("#property-price", "175000");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector("text=$175,000", { timeout: 10000 });

    await page.locator(`tr:has-text("${title}") button[aria-label="Delete property"]`).click();
    await page.waitForSelector("text=Delete this property?");
    await page.click('button:has-text("Delete")');
    await page.waitForTimeout(500);
    await expect(page.locator(`text=${title}`)).toHaveCount(0);

    fs.unlinkSync(tinyPngPath);
  });

  test("search finds a property by title", async ({ page }) => {
    const title = `E2E Search Target ${Date.now()}`;
    await page.click('button:has-text("Add Property")');
    await page.fill("#property-title", title);
    await page.fill("#property-description", "x");
    await page.fill("#property-price", "500");
    await page.fill("#property-location", "Hargeisa");
    await page.click('button:has-text("Create Property")');
    await page.waitForSelector(`text=${title}`, { timeout: 10000 });

    await page.fill('input[placeholder="Search by title or location..."]', title);
    await page.waitForTimeout(600);
    await expect(page.getByText(title)).toBeVisible();

    await page.locator(`tr:has-text("${title}") button[aria-label="Delete property"]`).click();
    await page.click('button:has-text("Delete")');
  });

  test("CSV and Excel export buttons trigger a file download", async ({ page }) => {
    const [csvDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.click('a:has(button:has-text("CSV"))'),
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);

    const [excelDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.click('a:has(button:has-text("Excel"))'),
    ]);
    expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx$/);
  });
});
