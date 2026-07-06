const { createAgent, loginAs } = require("../helpers");

describe("Users (admin account management)", () => {
  let adminAgent;
  let csrfToken;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("admin creates an agent account (role defaults to 'agent')", async () => {
    const username = `agent_${Date.now()}`;
    const res = await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send({
      fullName: "Test Agent",
      username,
      email: `${username}@example.com`,
      password: "TestPass1",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("agent");
  });

  test("admin creates a viewer account explicitly", async () => {
    const username = `viewer_${Date.now()}`;
    const res = await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send({
      fullName: "Test Viewer",
      username,
      email: `${username}@example.com`,
      password: "TestPass1",
      role: "viewer",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("viewer");
  });

  test("attempting to create an account with role=admin is rejected (400)", async () => {
    const username = `escalate_${Date.now()}`;
    const res = await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send({
      fullName: "Should Not Be Admin",
      username,
      email: `${username}@example.com`,
      password: "TestPass1",
      role: "admin",
    });
    expect(res.status).toBe(400);
  });

  test("a non-admin cannot create users (403)", async () => {
    const username = `agent2_${Date.now()}`;
    await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send({
      fullName: "Agent Two",
      username,
      email: `${username}@example.com`,
      password: "TestPass1",
    });
    const agentAgent = createAgent();
    const { csrfToken: agentCsrf } = await loginAs(agentAgent, username, "TestPass1");

    const blockedUsername = `blocked_${Date.now()}`;
    const res = await agentAgent.post("/api/users").set("X-CSRF-Token", agentCsrf).send({
      fullName: "Should Not Exist",
      username: blockedUsername,
      email: `${blockedUsername}@example.com`,
      password: "TestPass1",
    });
    expect(res.status).toBe(403);
  });

  test("duplicate username/email is rejected (409)", async () => {
    const username = `dup_${Date.now()}`;
    const payload = { fullName: "Dup", username, email: `${username}@example.com`, password: "TestPass1" };
    const first = await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send(payload);
    expect(first.status).toBe(201);
    const second = await adminAgent.post("/api/users").set("X-CSRF-Token", csrfToken).send(payload);
    expect(second.status).toBe(409);
  });
});
