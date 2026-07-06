import { test, expect } from "@playwright/test";
import { ADMIN_PASSWORD, ADMIN_USERNAME, login, logout } from "./fixtures";

test.describe("Authentication", () => {
  test("unauthenticated access to a protected route redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/");
    await page.fill("#username", ADMIN_USERNAME);
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid username or password/i)).toBeVisible();
    expect(page.url()).toBe("http://localhost:5173/");
  });

  test("logs in, sees the dashboard, and logs out", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page.getByText("System Administrator")).toBeVisible();

    await logout(page);
    await page.goto("/dashboard");
    await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
  });

  test("session persists across a page reload", async ({ page }) => {
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.reload();
    await page.waitForSelector("text=Regional Overview", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");
  });
});
