/**
 * @fileoverview Sets up the global testing environment for Jest, including initializing configurations,
 * mocking services, and preparing the environment for backend tests.
 * 
 * Requirements Addressed:
 * - Testing Environment Setup (Technical Specification/Development & Deployment/Testing):
 *   Prepares the global testing environment for Jest, ensuring all necessary configurations and mocks are in place.
 * 
 * Human Tasks:
 * 1. Ensure test database is properly configured and accessible
 * 2. Configure test Redis instance with appropriate memory settings
 * 3. Verify test environment variables are properly set
 * 4. Set up monitoring for test environment resource usage
 */

// jest v29.0.0
import { jest } from '@jest/globals';
// faker v5.5.3
import faker from 'faker';
import { generateMockData, validateMockData } from './utils/testHelpers';
import { DATABASE_URL, REDIS_URL } from '../.env.example';

/**
 * Initializes the global testing environment for Jest.
 * This function is called once before all tests are run.
 */
export const initializeTestEnvironment = async (): Promise<void> => {
  try {
    // Set test environment flag
    process.env.NODE_ENV = 'test';

    // Configure test database connection
    process.env.DATABASE_URL = DATABASE_URL.replace(
      '<database>',
      'test_database'
    );

    // Configure test Redis connection
    process.env.REDIS_URL = REDIS_URL.replace(
      '<port>',
      '6380' // Use different port for test Redis instance
    );

    // Initialize faker seed for consistent test data
    faker.seed(123);

    // Set up global mocks
    setupGlobalMocks();

    // Set up test data validation
    setupTestDataValidation();

    // Configure Jest environment
    setupJestEnvironment();

  } catch (error) {
    console.error('Failed to initialize test environment:', error);
    throw error;
  }
};

/**
 * Sets up global mocks for external services and dependencies
 */
const setupGlobalMocks = (): void => {
  // Mock Redis client
  jest.mock('../common/config/redis', () => ({
    initializeRedis: jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn()
    })
  }));

  // Mock email service
  jest.mock('../delivery/services/EmailService', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
  }));

  // Mock Stripe service
  jest.mock('../payment/services/StripeService', () => ({
    StripeService: jest.fn().mockImplementation(() => ({
      createPaymentIntent: jest.fn().mockResolvedValue({ id: 'test_payment_intent' }),
      createSubscription: jest.fn().mockResolvedValue({ id: 'test_subscription' }),
      refundPayment: jest.fn().mockResolvedValue(true)
    }))
  }));

  // Mock AWS S3 storage
  jest.mock('../common/config/storage', () => ({
    initializeStorage: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ Location: 'test-url' }),
      delete: jest.fn().mockResolvedValue(true)
    })
  }));
};

/**
 * Sets up test data validation using the validation helpers
 */
const setupTestDataValidation = (): void => {
  // Register custom test data validators
  const mockDataTypes = ['user', 'article', 'comment', 'profile'];
  
  mockDataTypes.forEach(type => {
    const mockData = generateMockData(type);
    validateMockData(mockData, {
      // Basic schema validation for test data
      required: true,
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    });
  });
};

/**
 * Configures Jest-specific environment settings
 */
const setupJestEnvironment = (): void => {
  // Set default test timeout
  jest.setTimeout(30000);

  // Configure Jest environment globals
  global.testDatabase = {
    url: process.env.DATABASE_URL,
    reset: async () => {
      // Implementation for resetting test database
    }
  };

  global.testRedis = {
    url: process.env.REDIS_URL,
    flush: async () => {
      // Implementation for flushing test Redis
    }
  };

  // Configure console output for tests
  global.console = {
    ...console,
    // Suppress console.log during tests but keep errors
    log: jest.fn(),
    error: console.error,
    warn: console.warn
  };
};