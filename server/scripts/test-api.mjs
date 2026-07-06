import { BASE_URL, extractCookie, getCsrfToken, buildHeaders, makeChecker } from "./testHelpers.mjs";

const { check, summary } = makeChecker();

async function run() {
  const { csrfToken, csrfCookie } = await getCsrfToken();

  // 1. Login as seeded admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username: "admin", password: "Admin@12345" }),
  });
  check("admin login succeeds", adminLoginRes.status, 200);
  const adminCookie = extractCookie(adminLoginRes);
  const adminHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: adminCookie });

  // 2. GET /me as admin
  const adminMeRes = await fetch(`${BASE_URL}/auth/me`, { headers: adminHeaders });
  check("admin /me succeeds", adminMeRes.status, 200);
  const adminMeBody = await adminMeRes.json();
  check("admin /me returns role=admin", adminMeBody.user?.role, "admin");

  // 3. Admin creates an agent account (role omitted, should default to 'agent')
  const agentUsername = `agent_${Date.now()}`;
  const createAgentRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: "Test Agent Member",
      username: agentUsername,
      email: `${agentUsername}@hargeisatax.gov.so`,
      password: "AgentPass123",
    }),
  });
  check("admin creates agent account", createAgentRes.status, 201);
  const createAgentBody = await createAgentRes.json();
  check("created account defaults to role=agent", createAgentBody.user?.role, "agent");

  // 3b. Admin attempts to escalate a new account to 'admin' — must be rejected outright
  const escalateRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({
      fullName: "Should Not Become Admin",
      username: `escalate_${Date.now()}`,
      email: `escalate_${Date.now()}@hargeisatax.gov.so`,
      password: "Whatever123",
      role: "admin",
    }),
  });
  check("creating a user with role=admin is rejected (400)", escalateRes.status, 400);

  // 4. Login as the new agent account
  const agentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username: agentUsername, password: "AgentPass123" }),
  });
  check("agent login succeeds", agentLoginRes.status, 200);
  const agentCookie = extractCookie(agentLoginRes);
  const agentHeaders = buildHeaders({ csrfToken, csrfCookie, sessionCookie: agentCookie });

  // 5. GET /me as agent
  const agentMeRes = await fetch(`${BASE_URL}/auth/me`, { headers: agentHeaders });
  check("agent /me succeeds", agentMeRes.status, 200);
  const agentMeBody = await agentMeRes.json();
  check("agent /me returns role=agent", agentMeBody.user?.role, "agent");

  // 6. Agent attempts to create another user (should be forbidden)
  const agentCreateRes = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: agentHeaders,
    body: JSON.stringify({
      fullName: "Should Not Exist",
      username: `blocked_${Date.now()}`,
      email: `blocked_${Date.now()}@hargeisatax.gov.so`,
      password: "Whatever123",
    }),
  });
  check("agent cannot create users (403)", agentCreateRes.status, 403);

  // 7. No cookie at all
  const noCookieRes = await fetch(`${BASE_URL}/auth/me`);
  check("/me with no cookie is unauthorized (401)", noCookieRes.status, 401);

  // 8. Wrong password
  const wrongPasswordRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username: "admin", password: "wrong-password" }),
  });
  check("login with wrong password is rejected (401)", wrongPasswordRes.status, 401);

  // 9. Missing fields validation
  const missingFieldsRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: buildHeaders({ csrfToken, csrfCookie }),
    body: JSON.stringify({ username: "" }),
  });
  check("login with missing fields is a 400", missingFieldsRes.status, 400);

  // 9b. Mutating request without CSRF header is rejected
  const noCsrfRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Cookie: `${csrfCookie}; ${adminCookie}` },
  });
  check("mutating request without X-CSRF-Token header is rejected (403)", noCsrfRes.status, 403);

  // 10. Logout then verify session is gone
  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: adminHeaders,
  });
  check("logout succeeds", logoutRes.status, 200);
  const clearedCookie = extractCookie(logoutRes);
  const afterLogoutMeRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: buildHeaders({ csrfToken, csrfCookie, sessionCookie: clearedCookie ?? adminCookie }),
  });
  check("/me after logout with cleared cookie is 401", afterLogoutMeRes.status, 401);

  // 11. Unknown route
  const notFoundRes = await fetch(`${BASE_URL}/does-not-exist`);
  check("unknown route returns 404", notFoundRes.status, 404);

  const failed = summary();
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
