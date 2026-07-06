const request = require("supertest");
const app = require("../src/app");

// supertest's agent persists cookies (session + csrf_token) across requests
// automatically, mirroring what a real browser does.
function createAgent() {
  return request.agent(app);
}

async function getCsrfToken(agent) {
  const res = await agent.get("/api/csrf-token");
  return res.body.data.csrfToken;
}

async function loginAs(agent, username, password) {
  const csrfToken = await getCsrfToken(agent);
  const res = await agent.post("/api/auth/login").set("X-CSRF-Token", csrfToken).send({ username, password });
  return { res, csrfToken };
}

// Creates a fresh admin-authenticated agent plus one agent per requested role,
// so tests can exercise RBAC without repeating the login dance every time.
async function createUserAndLogin(adminAgent, csrfToken, { role = "agent", passwordSuffix = "" } = {}) {
  const username = `${role}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const password = `TestPass1${passwordSuffix}`;
  const createRes = await adminAgent
    .post("/api/users")
    .set("X-CSRF-Token", csrfToken)
    .send({
      fullName: `Test ${role}`,
      username,
      email: `${username}@example.com`,
      password,
      role,
    });

  const agent = createAgent();
  const { csrfToken: newCsrfToken } = await loginAs(agent, username, password);
  return { agent, csrfToken: newCsrfToken, username, password, createRes };
}

module.exports = { app, createAgent, getCsrfToken, loginAs, createUserAndLogin };
