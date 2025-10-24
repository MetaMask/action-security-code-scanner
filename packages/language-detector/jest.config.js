export default {
  testEnvironment: 'node',
  transform: {},
  preset: null,
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  verbose: true,
};
