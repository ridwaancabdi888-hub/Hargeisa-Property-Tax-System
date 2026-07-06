const { createAgent, loginAs } = require("../helpers");

describe("Notifications", () => {
  let adminAgent;
  let csrfToken;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("creating a property generates a notification, and it can be marked read", async () => {
    const createRes = await adminAgent
      .post("/api/property-listings")
      .set("X-CSRF-Token", csrfToken)
      .send({ title: "Notif Test Property", description: "x", price: 100, location: "Hargeisa", type: "sale" });
    const propertyId = createRes.body.data.id;

    const listRes = await adminAgent.get("/api/notifications");
    expect(listRes.status).toBe(200);
    expect(typeof listRes.body.meta.unreadCount).toBe("number");
    const notification = listRes.body.data.find((n) => n.message.includes("Notif Test Property"));
    expect(notification).toBeDefined();
    expect(notification.isRead).toBe(false);

    const markRes = await adminAgent.post(`/api/notifications/${notification.id}/read`).set("X-CSRF-Token", csrfToken);
    expect(markRes.status).toBe(200);

    const afterRes = await adminAgent.get("/api/notifications");
    const updated = afterRes.body.data.find((n) => n.id === notification.id);
    expect(updated.isRead).toBe(true);

    await adminAgent.delete(`/api/property-listings/${propertyId}`).set("X-CSRF-Token", csrfToken);
  });
});
