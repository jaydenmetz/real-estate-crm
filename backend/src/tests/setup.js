// Global test setup
// Runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-testing-do-not-use-in-production';
process.env.JWT_ACCESS_TOKEN_EXPIRY = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRY = '7d';

// Suppress console output during tests (cleaner test output)
// Comment out if you need to debug tests
global.console = {
  ...console,
  log: jest.fn(), // Suppress logs
  debug: jest.fn(), // Suppress debug
  info: jest.fn(), // Suppress info
  warn: jest.fn(), // Suppress warnings
  error: jest.fn(), // Suppress errors (or keep for debugging: console.error)
};

// Global test utilities
global.testUtils = {
  // Sleep utility for async tests
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Generate random email
  randomEmail: () => `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,

  // Generate random phone
  randomPhone: () => `555-${Math.floor(1000 + Math.random() * 9000)}`,
};

// Setup and teardown
beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});
