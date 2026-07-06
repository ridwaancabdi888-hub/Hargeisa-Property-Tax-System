const { createAgent, loginAs } = require("../helpers");

describe("Settings", () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = createAgent();
    ({ csrfToken } = await loginAs(agent, "admin", "Admin@12345"));
  });

  test("gets default settings (lazily created)", async () => {
    const res = await agent.get("/api/settings");
    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe("light");
  });

  test("updates settings", async () => {
    const res = await agent
      .put("/api/settings")
      .set("X-CSRF-Token", csrfToken)
      .send({ theme: "dark", dateFormat: "DD/MM/YYYY", notifyPropertySold: false });
    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe("dark");
    expect(res.body.data.dateFormat).toBe("DD/MM/YYYY");
    expect(res.body.data.notifyPropertySold).toBe(false);

    // revert for other tests/manual use
    await agent.put("/api/settings").set("X-CSRF-Token", csrfToken).send({ theme: "light", dateFormat: "MM/DD/YYYY", notifyPropertySold: true });
  });

  test("rejects an invalid theme value", async () => {
    const res = await agent.put("/api/settings").set("X-CSRF-Token", csrfToken).send({ theme: "blue" });
    expect(res.status).toBe(400);
  });
});
