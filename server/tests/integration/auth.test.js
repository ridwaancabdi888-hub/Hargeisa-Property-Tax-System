const { createAgent, getCsrfToken, loginAs } = require("../helpers");

describe("Authentication", () => {
  test("login succeeds with correct credentials and sets a session", async () => {
    const agent = createAgent();
    const { res } = await loginAs(agent, "admin", "Admin@12345");
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  test("login fails with wrong password", async () => {
    const agent = createAgent();
    const csrfToken = await getCsrfToken(agent);
    const res = await agent.post("/api/auth/login").set("X-CSRF-Token", csrfToken).send({ username: "admin", password: "wrong" });
    expect(res.status).toBe(401);
  });

  test("login fails with missing fields", async () => {
    const agent = createAgent();
    const csrfToken = await getCsrfToken(agent);
    const res = await agent.post("/api/auth/login").set("X-CSRF-Token", csrfToken).send({ username: "" });
    expect(res.status).toBe(400);
  });

  test("mutating request without CSRF header is rejected", async () => {
    const agent = createAgent();
    await getCsrfToken(agent); // sets the cookie but we deliberately omit the header below
    const res = await agent.post("/api/auth/login").send({ username: "admin", password: "Admin@12345" });
    expect(res.status).toBe(403);
  });

  test("GET /me requires authentication", async () => {
    const agent = createAgent();
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /me returns the logged-in user after login", async () => {
    const agent = createAgent();
    await loginAs(agent, "admin", "Admin@12345");
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("admin");
  });

  test("logout clears the session", async () => {
    const agent = createAgent();
    const { csrfToken } = await loginAs(agent, "admin", "Admin@12345");
    const logoutRes = await agent.post("/api/auth/logout").set("X-CSRF-Token", csrfToken);
    expect(logoutRes.status).toBe(200);
    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(401);
  });

  test("unknown route returns 404", async () => {
    const agent = createAgent();
    const res = await agent.get("/api/does-not-exist");
    expect(res.status).toBe(404);
  });
});
