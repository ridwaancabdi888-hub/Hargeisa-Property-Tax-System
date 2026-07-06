const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Activity Logs", () => {
  let adminAgent;
  let adminCsrf;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken: adminCsrf } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("non-admin cannot view activity logs (403)", async () => {
    const viewerUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "viewer" });
    const res = await viewerUser.agent.get("/api/activity-logs");
    expect(res.status).toBe(403);
  });

  test("admin sees login/property CRUD entries with old/new value snapshots", async () => {
    const createRes = await adminAgent
      .post("/api/property-listings")
      .set("X-CSRF-Token", adminCsrf)
      .send({ title: "Activity Log Test Property", description: "x", price: 100, location: "Hargeisa", type: "sale" });
    const propertyId = createRes.body.data.id;

    await adminAgent
      .put(`/api/property-listings/${propertyId}`)
      .set("X-CSRF-Token", adminCsrf)
      .send({ title: "Activity Log Test Property", description: "x", price: 200, location: "Hargeisa", type: "sale" });

    await adminAgent.delete(`/api/property-listings/${propertyId}`).set("X-CSRF-Token", adminCsrf);

    const res = await adminAgent.get("/api/activity-logs?limit=50");
    expect(res.status).toBe(200);
    const actions = res.body.data.map((l) => l.action);
    expect(actions).toEqual(expect.arrayContaining(["login", "property_created", "property_updated", "property_deleted"]));

    const updateEntry = res.body.data.find((l) => l.action === "property_updated" && l.entityId === propertyId);
    expect(updateEntry.oldValues.price).not.toBe(updateEntry.newValues.price);
  });

  test("supports search, action filter, and pagination", async () => {
    const searchRes = await adminAgent.get("/api/activity-logs?search=Activity Log Test Property");
    expect(searchRes.body.data.length).toBeGreaterThan(0);

    const filterRes = await adminAgent.get("/api/activity-logs?action=property_deleted");
    expect(filterRes.body.data.every((l) => l.action === "property_deleted")).toBe(true);

    const pageRes = await adminAgent.get("/api/activity-logs?page=1&limit=2");
    expect(pageRes.body.data.length).toBeLessThanOrEqual(2);
    expect(typeof pageRes.body.meta.totalPages).toBe("number");
  });
});
