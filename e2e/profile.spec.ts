import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ADMIN_PASSWORD, ADMIN_USERNAME, login } from "./fixtures";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Profile", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.goto("/profile");
    await page.waitForSelector("text=My Profile");
  });

  test("edits and reverts the full name", async ({ page }) => {
    await page.click('button:has-text("Edit")');
    await page.locator('label:has-text("Full Name") + input').fill("E2E Renamed Admin");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector("text=Profile updated successfully", { timeout: 5000 });
    // "E2E Renamed Admin" legitimately appears in the sidebar, the profile header,
    // and the details list — assert on the details list specifically.
    await expect(page.locator("dd", { hasText: "E2E Renamed Admin" })).toBeVisible();

    await page.click('button:has-text("Edit")');
    await page.locator('label:has-text("Full Name") + input').fill("System Administrator");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector("text=Profile updated successfully", { timeout: 5000 });
  });

  test("uploads and removes an avatar", async ({ page }) => {
    const tinyPngPath = path.join(__dirname, "tiny-avatar.png");
    fs.writeFileSync(tinyPngPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    await page.setInputFiles('input[type="file"]', tinyPngPath);
    await page.waitForSelector("text=Profile picture updated successfully", { timeout: 5000 });
    await expect(page.locator('img[alt=""]').first()).toBeVisible();

    await page.click('button:has-text("Remove photo")');
    await page.waitForSelector("text=Profile picture removed successfully", { timeout: 5000 });

    fs.unlinkSync(tinyPngPath);
  });
});
