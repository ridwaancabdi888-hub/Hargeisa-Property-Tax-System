const { createAgent, loginAs, createUserAndLogin } = require("../helpers");

describe("Profile", () => {
  let adminAgent;
  let adminCsrf;
  let testUser;

  beforeAll(async () => {
    adminAgent = createAgent();
    ({ csrfToken: adminCsrf } = await loginAs(adminAgent, "admin", "Admin@12345"));
    testUser = await createUserAndLogin(adminAgent, adminCsrf, { role: "agent" });
  });

  test("updates full name and email", async () => {
    const res = await testUser.agent
      .patch("/api/profile")
      .set("X-CSRF-Token", testUser.csrfToken)
      .send({ fullName: "Renamed Agent", email: `${testUser.username}@example.com` });
    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Renamed Agent");
  });

  test("rejects updating to an email already in use (409)", async () => {
    const res = await testUser.agent
      .patch("/api/profile")
      .set("X-CSRF-Token", testUser.csrfToken)
      .send({ fullName: "X", email: "admin@hargeisatax.gov.so" });
    expect(res.status).toBe(409);
  });

  test("change password: wrong current password rejected, weak new password rejected, correct flow succeeds", async () => {
    const wrongCurrent = await testUser.agent
      .patch("/api/profile/password")
      .set("X-CSRF-Token", testUser.csrfToken)
      .send({ currentPassword: "totally-wrong", newPassword: "NewPass123" });
    expect(wrongCurrent.status).toBe(401);

    const weak = await testUser.agent
      .patch("/api/profile/password")
      .set("X-CSRF-Token", testUser.csrfToken)
      .send({ currentPassword: testUser.password, newPassword: "weak" });
    expect(weak.status).toBe(400);

    const ok = await testUser.agent
      .patch("/api/profile/password")
      .set("X-CSRF-Token", testUser.csrfToken)
      .send({ currentPassword: testUser.password, newPassword: "NewPass456" });
    expect(ok.status).toBe(200);

    const oldLoginAgent = createAgent();
    const csrfForOld = await require("../helpers").getCsrfToken(oldLoginAgent);
    const oldLoginRes = await oldLoginAgent.post("/api/auth/login").set("X-CSRF-Token", csrfForOld).send({ username: testUser.username, password: testUser.password });
    expect(oldLoginRes.status).toBe(401);

    const newLoginAgent = createAgent();
    const csrfForNew = await require("../helpers").getCsrfToken(newLoginAgent);
    const newLoginRes = await newLoginAgent.post("/api/auth/login").set("X-CSRF-Token", csrfForNew).send({ username: testUser.username, password: "NewPass456" });
    expect(newLoginRes.status).toBe(200);
  });

  test("uploads and removes an avatar", async () => {
    const uploadRes = await testUser.agent
      .post("/api/profile/avatar")
      .set("X-CSRF-Token", testUser.csrfToken)
      .attach("avatar", Buffer.from([0x89, 0x50, 0x4e, 0x47]), { filename: "avatar.png", contentType: "image/png" });
    expect(uploadRes.status).toBe(200);
    expect(typeof uploadRes.body.data.avatarUrl).toBe("string");

    const deleteRes = await testUser.agent.delete("/api/profile/avatar").set("X-CSRF-Token", testUser.csrfToken);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.data.avatarUrl).toBeNull();
  });
});
