const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Backups (admin only)", () => {
  let adminAgent;
  let csrfToken;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken } = await loginAs(adminAgent, "admin", "Admin@12345"));
  });

  test("non-admin cannot access backups (403)", async () => {
    const viewerUser = await createUserAndLogin(adminAgent, csrfToken, { role: "viewer" });
    const res = await viewerUser.agent.get("/api/backups");
    expect(res.status).toBe(403);
  });

  test("creates a backup, lists it, and can download it", async () => {
    const createRes = await adminAgent.post("/api/backups").set("X-CSRF-Token", csrfToken);
    expect(createRes.status).toBe(201);
    const { filename } = createRes.body.data;

    const listRes = await adminAgent.get("/api/backups");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((b) => b.filename === filename)).toBe(true);

    const downloadRes = await adminAgent.get(`/api/backups/${filename}/download`);
    expect(downloadRes.status).toBe(200);
    expect(downloadRes.text).toContain("-- MariaDB dump");
  });

  test("rejects a path-traversal filename", async () => {
    const res = await adminAgent.get("/api/backups/..%2F..%2Fetc%2Fpasswd/download");
    expect(res.status).toBe(400);
  });

  test("restores from an uploaded backup and takes an automatic safety backup first", async () => {
    const createRes = await adminAgent.post("/api/backups").set("X-CSRF-Token", csrfToken);
    const { filename } = createRes.body.data;
    const downloadRes = await adminAgent.get(`/api/backups/${filename}/download`).buffer(true).parse((res, cb) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => cb(null, Buffer.concat(chunks)));
    });

    const restoreRes = await adminAgent
      .post("/api/backups/restore")
      .set("X-CSRF-Token", csrfToken)
      .attach("backup", downloadRes.body, { filename: "restore-test.sql", contentType: "application/sql" });
    expect(restoreRes.status).toBe(200);
    expect(typeof restoreRes.body.data.safetyBackup).toBe("string");

    // confirm the DB still works after restore (admin can still log in)
    const meRes = await adminAgent.get("/api/auth/me");
    expect(meRes.status).toBe(200);
  }, 30000);
});
