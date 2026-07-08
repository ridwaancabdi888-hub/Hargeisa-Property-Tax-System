import { test, expect } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME, login } from "./fixtures";

test.describe("Clients: CRUD and property ownership linkage", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.goto("/clients");
    await page.waitForSelector("text=Manage property owners");
  });

  test("creates, edits, and deletes a client", async ({ page }) => {
    const fullName = `E2E Owner ${Date.now()}`;
    await page.click('button:has-text("Add Client")');
    await page.waitForSelector('h2:has-text("Add Client")');
    await page.fill("#client-fullname", fullName);
    await page.fill("#client-phone", "+252634000123");
    await page.fill("#client-email", "e2e.owner@example.com");
    await page.click('button:has-text("Create Client")');
    await page.waitForSelector(`text=${fullName}`, { timeout: 10000 });

    await page.locator(`tr:has-text("${fullName}") button[aria-label="Edit client"]`).click();
    await page.waitForSelector('h2:has-text("Edit Client")');
    await page.fill("#client-address", "Jigjiga Yar, Hargeisa");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector("text=Jigjiga Yar, Hargeisa", { timeout: 10000 });

    await page.locator(`tr:has-text("${fullName}") button[aria-label="Delete client"]`).click();
    await page.waitForSelector("text=Delete this client?");
    await page.click('button:has-text("Delete")');
    // The success toast also contains the client's name, so scope to table rows
    // rather than the broader "text=" locator which would also match the toast.
    await expect(page.locator(`tr:has-text("${fullName}")`)).toHaveCount(0);
  });

  test("a client can be picked as a property's owner and a tax bill still generates", async ({ page }) => {
    const fullName = `E2E Linked Owner ${Date.now()}`;
    await page.click('button:has-text("Add Client")');
    await page.fill("#client-fullname", fullName);
    await page.click('button:has-text("Create Client")');
    await page.waitForSelector(`text=${fullName}`, { timeout: 10000 });

    await page.goto("/properties");
    await page.waitForSelector('button:has-text("Add Property")');
    const title = `E2E Owned Villa ${Date.now()}`;
    await page.click('button:has-text("Add Property")');
    await page.waitForSelector('h2:has-text("Add Property")');
    await page.fill("#property-title", title);
    await page.fill("#property-description", "Owned by an e2e client");
    await page.fill("#property-price", "90000");
    await page.fill("#property-location", "Hargeisa");
    await page.selectOption("#property-owner", { label: fullName });
    await page.click('button:has-text("Create Property")');
    await page.waitForSelector(`text=${title}`, { timeout: 10000 });

    await page.goto("/tax-management");
    await page.waitForSelector("text=Property Tax Roll");
    await page.click('button:has-text("Filter")');
    await page.fill('input[placeholder="Search by title or location..."]', title);
    await page.waitForTimeout(600);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click(`tr:has-text("${title}") >> text=Generate Bill`),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);

    await page.goto("/properties");
    await page.locator(`tr:has-text("${title}") button[aria-label="Edit property"]`).click();
    await page.waitForSelector('h2:has-text("Edit Property")');
    // The owner dropdown's options load asynchronously after the modal mounts.
    // <option> elements are never "visible" per Playwright's own definition, so wait for attachment instead.
    await page.waitForSelector(`#property-owner option:has-text("${fullName}")`, { state: "attached" });
    const selectedOwner = await page.locator("#property-owner").evaluate((el: HTMLSelectElement) => el.selectedOptions[0]?.textContent);
    expect(selectedOwner).toBe(fullName);
    await page.click('button:has-text("Cancel")');

    await page.goto("/clients");
    await page.locator(`tr:has-text("${fullName}") button[aria-label="Delete client"]`).click();
    await page.click('button:has-text("Delete")');
  });
});
