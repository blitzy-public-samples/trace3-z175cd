/**
 * @fileoverview Configuration file for Jest, the testing framework used in the backend.
 * 
 * Requirements Addressed:
 * - Testing Framework Configuration (Technical Specification/System Design/Development & Deployment):
 *   Configures Jest for running unit and integration tests in the backend.
 * 
 * Human Tasks:
 * 1. Ensure test database is properly configured and accessible
 * 2. Configure test Redis instance with appropriate memory settings
 * 3. Verify test environment variables are properly set
 * 4. Set up monitoring for test environment resource usage
 */

// jest v29.0.0
// ts-jest v29.0.0

const config = {
  // Specify test environment
  testEnvironment: 'node',

  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
    '^@delivery/(.*)$': '<rootDir>/src/delivery/$1',
    '^@payment/(.*)$': '<rootDir>/src/payment/$1'
  },

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Enable code coverage collection
  collectCoverage: true,

  // Specify files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**'
  ],

  // Output directory for coverage reports
  coverageDirectory: '<rootDir>/coverage',

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};

export default config;