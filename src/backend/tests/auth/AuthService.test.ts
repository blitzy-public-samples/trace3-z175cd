// jest v29.0.0
import { jest } from '@jest/globals';
// faker v5.5.3
import faker from 'faker';

import { AuthService } from '../../src/auth/services/AuthService';
import { TokenService } from '../../src/auth/services/TokenService';
import { User } from '../../src/auth/models/User';
import { generateMockData, validateMockData } from '../utils/testHelpers';
import { initializeTestEnvironment } from '../setup';
import { ERROR_CODES } from '../../src/common/constants/errorCodes';
import { ROLES } from '../../src/common/constants/roles';

/**
 * Human Tasks:
 * 1. Ensure test database is properly configured and accessible
 * 2. Configure test environment variables for authentication
 * 3. Set up test encryption keys for password hashing
 * 4. Verify test user roles are properly configured
 */

describe('AuthService', () => {
  let authService: AuthService;
  let mockUser: any;

  beforeAll(async () => {
    // Initialize test environment
    await initializeTestEnvironment();
  });

  beforeEach(() => {
    // Generate mock user data for each test
    mockUser = generateMockData('user');
    authService = new AuthService();
  });

  /**
   * Test suite for user registration functionality
   * Requirements Addressed:
   * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods)
   */
  describe('registerUser', () => {
    it('should successfully register a new user with valid data', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: mockUser.password,
        role: ROLES.SUBSCRIBER
      };

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email.toLowerCase());
      expect(result.role).toBe(ROLES.SUBSCRIBER);
      expect(result.isVerified).toBe(false);
    });

    it('should throw error when registering with invalid email format', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: mockUser.password
      };

      // Act & Assert
      await expect(authService.registerUser(userData))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Invalid email format`);
    });

    it('should throw error when registering with weak password', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: 'weak'
      };

      // Act & Assert
      await expect(authService.registerUser(userData))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Password must be at least 8 characters long`);
    });

    it('should assign default role when no role is specified', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: mockUser.password
      };

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(result.role).toBe(ROLES.SUBSCRIBER);
    });
  });

  /**
   * Test suite for user login functionality
   * Requirements Addressed:
   * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods)
   */
  describe('loginUser', () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await authService.registerUser({
        email: mockUser.email,
        password: mockUser.password
      });
    });

    it('should successfully login with valid credentials', async () => {
      // Act
      const token = await authService.loginUser(mockUser.email, mockUser.password);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token contains correct user information
      const decodedToken = TokenService.validateToken(token);
      expect(decodedToken.email).toBe(mockUser.email.toLowerCase());
      expect(decodedToken.role).toBe(ROLES.SUBSCRIBER);
    });

    it('should throw error when logging in with incorrect password', async () => {
      // Act & Assert
      await expect(authService.loginUser(mockUser.email, 'wrongpassword'))
        .rejects
        .toThrow(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Invalid email or password`);
    });

    it('should throw error when logging in with non-existent email', async () => {
      // Act & Assert
      await expect(authService.loginUser('nonexistent@example.com', mockUser.password))
        .rejects
        .toThrow(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Invalid email or password`);
    });

    it('should throw error when logging in with invalid email format', async () => {
      // Act & Assert
      await expect(authService.loginUser('invalid-email', mockUser.password))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Invalid email format`);
    });
  });

  /**
   * Test suite for user authorization functionality
   * Requirements Addressed:
   * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods)
   */
  describe('authorizeUser', () => {
    let userToken: string;

    beforeEach(async () => {
      // Register and login a test user before each authorization test
      await authService.registerUser({
        email: mockUser.email,
        password: mockUser.password,
        role: ROLES.WRITER
      });
      userToken = await authService.loginUser(mockUser.email, mockUser.password);
    });

    it('should authorize user with correct role', async () => {
      // Act
      const result = await authService.authorizeUser(userToken, [ROLES.WRITER]);

      // Assert
      expect(result).toBe(true);
    });

    it('should authorize user with multiple allowed roles', async () => {
      // Act
      const result = await authService.authorizeUser(userToken, [ROLES.ADMIN, ROLES.WRITER]);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw error when user role is not authorized', async () => {
      // Act & Assert
      await expect(authService.authorizeUser(userToken, [ROLES.ADMIN]))
        .rejects
        .toThrow(`${ERROR_CODES.FORBIDDEN}: Insufficient permissions`);
    });

    it('should throw error with invalid token', async () => {
      // Act & Assert
      await expect(authService.authorizeUser('invalid-token', [ROLES.WRITER]))
        .rejects
        .toThrow(`${ERROR_CODES.UNAUTHORIZED_ACCESS}`);
    });

    it('should throw error with expired token', async () => {
      // Create an expired token
      const expiredToken = TokenService.generateToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: ROLES.WRITER
      }, ROLES.WRITER, '-1h');

      // Act & Assert
      await expect(authService.authorizeUser(expiredToken, [ROLES.WRITER]))
        .rejects
        .toThrow(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Token expired`);
    });
  });

  /**
   * Test suite for password validation functionality
   * Requirements Addressed:
   * - Testing Utilities (Technical Specification/Development & Deployment/Testing)
   */
  describe('password validation', () => {
    it('should validate password with minimum requirements', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: 'Test123!@#'
      };

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email.toLowerCase());
    });

    it('should reject password without special characters', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: 'TestPass123'
      };

      // Act & Assert
      await expect(authService.registerUser(userData))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Password must contain at least one special character`);
    });

    it('should reject password without numbers', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: 'TestPass!@#'
      };

      // Act & Assert
      await expect(authService.registerUser(userData))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Password must contain at least one number`);
    });

    it('should reject password shorter than minimum length', async () => {
      // Arrange
      const userData = {
        email: mockUser.email,
        password: 'Test1!'
      };

      // Act & Assert
      await expect(authService.registerUser(userData))
        .rejects
        .toThrow(`${ERROR_CODES.VALIDATION_ERROR}: Password must be at least 8 characters long`);
    });
  });
});