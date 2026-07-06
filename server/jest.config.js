module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 15000,
  verbose: true,
};
