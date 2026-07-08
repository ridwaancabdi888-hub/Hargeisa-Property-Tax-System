const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Clients (CRUD, search/pagination, RBAC, property linkage)", () => {
  let adminAgent;
  let adminCsrf;
  let agentUser;
  let viewerUser;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken: adminCsrf } = await loginAs(adminAgent, "admin", "Admin@12345"));
    agentUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "agent" });
    viewerUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "viewer" });
  });

  test("create requires a valid full name (400 on invalid)", async () => {
    const res = await adminAgent.post("/api/clients").set("X-CSRF-Token", adminCsrf).send({ fullName: "a" });
    expect(res.status).toBe(400);
  });

  test("viewer can list clients but cannot create (403)", async () => {
    const listRes = await viewerUser.agent.get("/api/clients");
    expect(listRes.status).toBe(200);

    const createRes = await viewerUser.agent
      .post("/api/clients")
      .set("X-CSRF-Token", viewerUser.csrfToken)
      .send({ fullName: "Viewer Owner" });
    expect(createRes.status).toBe(403);
  });

  test("agent can create and edit but not delete (403)", async () => {
    const createRes = await agentUser.agent
      .post("/api/clients")
      .set("X-CSRF-Token", agentUser.csrfToken)
      .send({ fullName: "Agent Owner", phone: "+252634000001", email: "agent-owner@example.com" });
    expect(createRes.status).toBe(201);
    const clientId = createRes.body.data.id;

    const updateRes = await agentUser.agent
      .put(`/api/clients/${clientId}`)
      .set("X-CSRF-Token", agentUser.csrfToken)
      .send({ fullName: "Agent Owner Updated" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.fullName).toBe("Agent Owner Updated");

    const deleteRes = await agentUser.agent.delete(`/api/clients/${clientId}`).set("X-CSRF-Token", agentUser.csrfToken);
    expect(deleteRes.status).toBe(403);

    const adminDeleteRes = await adminAgent.delete(`/api/clients/${clientId}`).set("X-CSRF-Token", adminCsrf);
    expect(adminDeleteRes.status).toBe(200);
  });

  test("search and pagination work together", async () => {
    const seed = [
      { fullName: "Search Jane Owner", phone: "+252630000001", email: "jane.search@example.com" },
      { fullName: "Search John Owner", phone: "+252630000002", email: "john.search@example.com" },
    ];
    const created = [];
    for (const payload of seed) {
      const res = await adminAgent.post("/api/clients").set("X-CSRF-Token", adminCsrf).send(payload);
      created.push(res.body.data);
    }

    const searchRes = await adminAgent.get("/api/clients?search=search");
    expect(searchRes.body.data.filter((c) => c.fullName.includes("Search")).length).toBeGreaterThanOrEqual(2);

    const pageRes = await adminAgent.get("/api/clients?page=1&limit=1");
    expect(pageRes.body.data.length).toBeLessThanOrEqual(1);
    expect(pageRes.body.meta.limit).toBe(1);

    for (const client of created) {
      await adminAgent.delete(`/api/clients/${client.id}`).set("X-CSRF-Token", adminCsrf);
    }
  });

  test("get/update/delete on a missing id returns 404", async () => {
    const getRes = await adminAgent.get("/api/clients/9999999");
    expect(getRes.status).toBe(404);
    const updateRes = await adminAgent
      .put("/api/clients/9999999")
      .set("X-CSRF-Token", adminCsrf)
      .send({ fullName: "Valid Name" });
    expect(updateRes.status).toBe(404);
    const deleteRes = await adminAgent.delete("/api/clients/9999999").set("X-CSRF-Token", adminCsrf);
    expect(deleteRes.status).toBe(404);
  });

  test("linking a client to a property surfaces owner details and property count", async () => {
    const clientRes = await adminAgent
      .post("/api/clients")
      .set("X-CSRF-Token", adminCsrf)
      .send({ fullName: "Owner With Property", phone: "+252630000099", email: "owner.withproperty@example.com" });
    const clientId = clientRes.body.data.id;

    const propertyRes = await adminAgent
      .post("/api/property-listings")
      .set("X-CSRF-Token", adminCsrf)
      .send({ title: "Owned Villa", description: "x", price: 500, location: "Hargeisa", type: "sale", clientId });
    expect(propertyRes.status).toBe(201);
    expect(propertyRes.body.data.clientId).toBe(clientId);
    expect(propertyRes.body.data.clientName).toBe("Owner With Property");

    const getClientRes = await adminAgent.get(`/api/clients/${clientId}`);
    expect(getClientRes.body.data.propertyCount).toBe(1);

    const filteredListRes = await adminAgent.get(`/api/property-listings?client_id=${clientId}`);
    expect(filteredListRes.body.data.every((p) => p.clientId === clientId)).toBe(true);
    expect(filteredListRes.body.data.length).toBeGreaterThanOrEqual(1);

    await adminAgent.delete(`/api/property-listings/${propertyRes.body.data.id}`).set("X-CSRF-Token", adminCsrf);
    await adminAgent.delete(`/api/clients/${clientId}`).set("X-CSRF-Token", adminCsrf);
  });
});
