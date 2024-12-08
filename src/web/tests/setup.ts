// jest v29.x
// @testing-library/react v13.x

import '@testing-library/jest-dom';
import { initializeMockServer } from './mocks/server';

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
 * Sets up the testing environment for Jest tests by initializing the mock server
 * and configuring global test settings.
 */

// Configure Jest timeout
jest.setTimeout(10000); // 10 seconds

// Suppress console errors during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};

/**
 * @requirement Testing Framework
 * Location: Technical Specification/Development & Deployment/Testing
 * Initializes the testing environment by starting the mock server and
 * setting up global configurations.
 */
export const setupTestingEnvironment = (): void => {
  // Initialize MSW mock server
  initializeMockServer();

  // Configure global test environment settings
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window.scrollTo
  window.scrollTo = jest.fn();

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

// Set up afterEach hook for all tests
afterEach(() => {
  // Clean up any mounted components
  jest.clearAllMocks();
});

// Initialize the testing environment
setupTestingEnvironment();