/**
 * Human Tasks:
 * 1. Configure environment variables for test environment in .env.test
 * 2. Set up test cleanup to reset mock server state between tests
 * 3. Verify mock server responses match API contracts
 * 4. Add error scenarios for comprehensive testing coverage
 */

/**
 * @requirement Testing Framework
 * Location: Technical Specification/Development & Deployment/Testing
 * Provides a Jest configuration file to define the testing environment, setup files, 
 * and module mappings for the frontend application.
 */

// jest v29.x
// @testing-library/react v13.x
// msw v1.x

import type { Config } from '@jest/types';
import { setupTestingEnvironment } from './tests/setup';

const config: Config.InitialOptions = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',

  // Use jsdom for browser environment simulation
  testEnvironment: 'jsdom',

  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.ts'
  ],

  // Module name mappings for non-JS/TS files
  moduleNameMapper: {
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/mocks/fileMock.js'
  },

  // TypeScript file transformation
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },

  // Code coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Test environment globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true
    }
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Maximum number of concurrent tests
  maxConcurrency: 5,

  // Test timeout in milliseconds
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests
  resetModules: true,

  // Automatically restore mocks between tests
  restoreMocks: true
};

export default config;