import { test, expect } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME, login } from "./fixtures";

test.describe("Analytics", () => {
  test("renders portfolio stat cards and charts, and exports a PDF", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.click('aside a:has-text("Analytics")');
    await page.waitForURL("**/property-analytics");
    await page.waitForSelector("text=Total Properties", { timeout: 10000 });
    await page.waitForTimeout(1000); // let recharts' ResponsiveContainer settle before reading the DOM

    await expect(page.getByText("Properties by Status")).toBeVisible();
    await expect(page.getByText("Rent vs Sale")).toBeVisible();
    await expect(page.getByText("Monthly Creation Trend")).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('a:has(button:has-text("Export PDF"))'),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
