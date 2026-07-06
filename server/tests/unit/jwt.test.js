const { signToken, verifyToken } = require("../../src/utils/jwt");

describe("jwt utils", () => {
  test("signs and verifies a round-trip payload", () => {
    const token = signToken({ sub: 1, role: "admin" });
    const payload = verifyToken(token);
    expect(payload.sub).toBe(1);
    expect(payload.role).toBe("admin");
  });

  test("rejects a tampered token", () => {
    const token = signToken({ sub: 1, role: "admin" });
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyToken(tampered)).toThrow();
  });

  test("rejects a token signed with a different secret", () => {
    const jwt = require("jsonwebtoken");
    const foreignToken = jwt.sign({ sub: 1 }, "a-different-secret");
    expect(() => verifyToken(foreignToken)).toThrow();
  });
});
