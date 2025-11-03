module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/server.js', // Exclude server entry point
    '!src/scripts/**' // Exclude migration scripts
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/src/**/*.test.js',
    '**/src/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testTimeout: 10000, // 10 seconds for most tests
  verbose: true,
  collectCoverage: false, // Only collect when explicitly requested
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/build/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/tests/']
};
