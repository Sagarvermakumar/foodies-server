exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"], // path correct hai
  verbose: true,
  testTimeout: 30000
};
