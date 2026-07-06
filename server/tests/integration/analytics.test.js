const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Analytics", () => {
  let adminAgent;
  let adminCsrf;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken: adminCsrf } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("admin can view analytics with the expected shape", async () => {
    const res = await adminAgent.get("/api/analytics");
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totals.total).toBe("number");
    expect(Array.isArray(res.body.data.byType)).toBe(true);
    expect(Array.isArray(res.body.data.monthlyTrend)).toBe(true);
  });

  test("agent and viewer cannot view analytics (403)", async () => {
    const agentUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "agent" });
    const viewerUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "viewer" });

    const agentRes = await agentUser.agent.get("/api/analytics");
    expect(agentRes.status).toBe(403);

    const viewerRes = await viewerUser.agent.get("/api/analytics");
    expect(viewerRes.status).toBe(403);
  });

  test("PDF export returns a PDF file", async () => {
    const res = await adminAgent.get("/api/analytics/export/pdf");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.body.slice(0, 4).toString()).toBe("%PDF");
  });
});
