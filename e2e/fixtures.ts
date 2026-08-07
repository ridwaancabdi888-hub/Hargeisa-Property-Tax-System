import type { Page } from "@playwright/test";

export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Admin@12345";

export async function login(page: Page, username: string, password: string) {
  await page.goto("/");
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10000 });
  await page.waitForSelector("text=Regional Overview", { timeout: 10000 });
}

export async function logout(page: Page) {
  // Sidebar navigates to "/" before awaiting the logout API call (to avoid a
  // different race with ProtectedRoute's redirect), so the URL can change
  // before the server has actually cleared the session cookie. Wait for the
  // real /api/auth/logout response, not just the URL, before considering the
  // session gone.
  const logoutResponse = page.waitForResponse(
    (res) => res.url().includes("/api/auth/logout") && res.request().method() === "POST"
  );
  await page.click('aside button[aria-label="Log out"]');
  await logoutResponse;
  await page.waitForURL("http://localhost:5173/", { timeout: 10000 });
}

function csrfHeaders(page: Page): Promise<string> {
  return page.evaluate(() => {
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  });
}

// Creates a throwaway agent/viewer account via an authenticated fetch from
// within the page context (must already be logged in as admin).
export async function createUser(page: Page, role: "agent" | "viewer") {
  const csrfToken = await csrfHeaders(page);
  const username = `${role}_e2e_${Date.now()}`;
  const password = "TestPass1";
  const result = await page.evaluate(
    async ({ username, password, role, csrfToken }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ fullName: `E2E ${role}`, username, email: `${username}@example.com`, password, role }),
      });
      return { status: res.status };
    },
    { username, password, role, csrfToken }
  );
  if (result.status !== 201) {
    throw new Error(`Failed to create ${role} user via fixture (status ${result.status})`);
  }
  return { username, password };
}
