import { test, expect } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME, createUser, login, logout } from "./fixtures";

test.describe("Role-based access control", () => {
  test("viewer sees read-only Properties UI and no admin-only nav items", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    const viewer = await createUser(page, "viewer");
    await logout(page);

    await login(page, viewer.username, viewer.password);

    await expect(page.locator('aside a:has-text("Analytics")')).toHaveCount(0);
    await expect(page.locator('aside a:has-text("Tax Management")')).toHaveCount(0);
    await expect(page.locator('aside a:has-text("Activity Log")')).toHaveCount(0);
    await expect(page.locator('aside a:has-text("Backups")')).toHaveCount(0);

    await page.goto("/property-listings");
    await page.waitForSelector("text=Manage rental and sale property listings");
    await expect(page.locator('button:has-text("Add Property")')).toHaveCount(0);
    await expect(page.locator('button[aria-label="Edit property"]')).toHaveCount(0);
  });

  test("viewer hitting an admin-only route directly is redirected to /unauthorized", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    const viewer = await createUser(page, "viewer");
    await logout(page);

    await login(page, viewer.username, viewer.password);
    await page.goto("/property-analytics");
    await page.waitForURL("http://localhost:5173/unauthorized", { timeout: 10000 });
  });

  test("agent can create/edit properties but has no delete icon", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    const agent = await createUser(page, "agent");
    await logout(page);

    await login(page, agent.username, agent.password);
    await page.goto("/property-listings");
    await page.waitForSelector("text=Manage rental and sale property listings");
    await expect(page.locator('button:has-text("Add Property")')).toBeVisible();
    await expect(page.locator('button[aria-label="Delete property"]')).toHaveCount(0);
  });
});
