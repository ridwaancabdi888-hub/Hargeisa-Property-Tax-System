import { defineConfig, devices } from "@playwright/test";

// Assumes the frontend (npm run dev, :5173), backend (server: npm run dev, :5000),
// and MariaDB are already running with the dev database migrated — this suite
// exercises the real app end-to-end rather than mocking the network.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
