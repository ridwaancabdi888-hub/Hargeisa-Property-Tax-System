const { STRONG_PASSWORD_REGEX } = require("../../src/utils/passwordPolicy");

describe("passwordPolicy", () => {
  test.each([
    ["Admin@12345", true],
    ["AgentPass123", true],
    ["Abcdefg1", true],
    ["alllowercase1", false], // no uppercase
    ["ALLUPPERCASE1", false], // no lowercase
    ["NoDigitsHere", false], // no digit
    ["", false],
  ])("%s -> %s", (password, expected) => {
    expect(STRONG_PASSWORD_REGEX.test(password)).toBe(expected);
  });
});
