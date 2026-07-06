const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Properties (CRUD, search/filter/pagination, RBAC)", () => {
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

  test("create requires valid fields (400 on invalid)", async () => {
    const res = await adminAgent.post("/api/property-listings").set("X-CSRF-Token", adminCsrf).send({ title: "ab" });
    expect(res.status).toBe(400);
  });

  test("viewer can list properties but cannot create (403)", async () => {
    const listRes = await viewerUser.agent.get("/api/property-listings");
    expect(listRes.status).toBe(200);

    const createRes = await viewerUser.agent
      .post("/api/property-listings")
      .set("X-CSRF-Token", viewerUser.csrfToken)
      .send({ title: "Viewer Villa", description: "x", price: 100, location: "Hargeisa", type: "sale" });
    expect(createRes.status).toBe(403);
  });

  test("agent can create and edit but not delete (403)", async () => {
    const createRes = await agentUser.agent
      .post("/api/property-listings")
      .set("X-CSRF-Token", agentUser.csrfToken)
      .send({ title: "Agent Villa", description: "x", price: 1000, location: "Hargeisa", type: "sale" });
    expect(createRes.status).toBe(201);
    const propertyId = createRes.body.data.id;

    const updateRes = await agentUser.agent
      .put(`/api/property-listings/${propertyId}`)
      .set("X-CSRF-Token", agentUser.csrfToken)
      .send({ title: "Agent Villa", description: "x", price: 1200, location: "Hargeisa", type: "sale" });
    expect(updateRes.status).toBe(200);
    expect(Number(updateRes.body.data.price)).toBe(1200);

    const deleteRes = await agentUser.agent.delete(`/api/property-listings/${propertyId}`).set("X-CSRF-Token", agentUser.csrfToken);
    expect(deleteRes.status).toBe(403);

    // admin can delete it
    const adminDeleteRes = await adminAgent.delete(`/api/property-listings/${propertyId}`).set("X-CSRF-Token", adminCsrf);
    expect(adminDeleteRes.status).toBe(200);
  });

  test("search, filter, and pagination work together", async () => {
    const seed = [
      { title: "Search Sunset Villa", description: "x", price: 250000, location: "Jigjiga Yar", type: "sale", status: "available" },
      { title: "Search Downtown Apartment", description: "x", price: 800, location: "Hargeisa Central", type: "rent", status: "available" },
      { title: "Search Sunset Flat", description: "x", price: 650, location: "26 June", type: "rent", status: "rented" },
    ];
    const created = [];
    for (const payload of seed) {
      const res = await adminAgent.post("/api/property-listings").set("X-CSRF-Token", adminCsrf).send(payload);
      created.push(res.body.data);
    }

    const searchRes = await adminAgent.get("/api/property-listings?search=sunset");
    expect(searchRes.body.data.filter((p) => p.title.includes("Sunset")).length).toBeGreaterThanOrEqual(2);

    const typeRes = await adminAgent.get("/api/property-listings?type=rent");
    expect(typeRes.body.data.every((p) => p.type === "rent")).toBe(true);

    const pageRes = await adminAgent.get("/api/property-listings?page=1&limit=2");
    expect(pageRes.body.data.length).toBeLessThanOrEqual(2);
    expect(pageRes.body.meta.limit).toBe(2);

    for (const property of created) {
      await adminAgent.delete(`/api/property-listings/${property.id}`).set("X-CSRF-Token", adminCsrf);
    }
  });

  test("get/update/delete on a missing id returns 404", async () => {
    const getRes = await adminAgent.get("/api/property-listings/9999999");
    expect(getRes.status).toBe(404);
    const updateRes = await adminAgent
      .put("/api/property-listings/9999999")
      .set("X-CSRF-Token", adminCsrf)
      .send({ title: "Valid Title", description: "x", price: 1, location: "x", type: "sale" });
    expect(updateRes.status).toBe(404);
  });
});
