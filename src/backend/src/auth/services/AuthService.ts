/**
 * @fileoverview Provides authentication services including user login, registration, and role-based access control.
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods):
 *   Implements secure user authentication and role-based access control using JWTs.
 * - User Management (Technical Specification/Security Considerations/Authentication and Authorization):
 *   Handles user registration, login, and password verification.
 * 
 * Human Tasks:
 * - Configure password policy requirements (minimum length, complexity, etc.)
 * - Set up email verification system for new user registrations
 * - Configure rate limiting for authentication endpoints
 * - Set up monitoring for failed authentication attempts
 */

import { ERROR_CODES } from '../../common/constants/errorCodes';
import { ROLES } from '../../common/constants/roles';
import { encrypt } from '../../common/utils/encryption';
import { logError } from '../../common/utils/logger';
import { User } from '../models/User';
import { generateToken, validateToken } from './TokenService';

/**
 * Interface for user registration data
 */
interface UserRegistrationData {
  email: string;
  password: string;
  role?: string;
}

/**
 * Registers a new user by encrypting their password and storing their details.
 * 
 * @param userData - Object containing user registration information
 * @returns The newly created user object
 * @throws Error if registration fails or validation errors occur
 */
export const registerUser = async (userData: UserRegistrationData): Promise<User> => {
  try {
    // Validate user data
    if (!userData.email || !userData.password) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Email and password are required`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Invalid email format`);
    }

    // Validate password strength (minimum 8 characters, at least one number and one special character)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Password must be at least 8 characters long and contain at least one number and one special character`);
    }

    // Generate unique user ID (implementation depends on your database)
    const userId = generateUserId(); // This function should be implemented based on your needs

    // Assign default role if not provided
    const userRole = userData.role && Object.values(ROLES).includes(userData.role) 
      ? userData.role 
      : ROLES.SUBSCRIBER;

    // Create new user instance
    const newUser = new User(
      userId,
      userData.email,
      userData.password,
      userRole,
      false // isVerified defaults to false until email verification
    );

    // Save user to database (implementation depends on your database)
    await saveUserToDatabase(newUser); // This function should be implemented based on your needs

    // Return user object (excluding sensitive data)
    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified
    } as any;

  } catch (error) {
    logError('User registration failed', {
      code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error.message,
      email: userData.email
    });
    throw error;
  }
};

/**
 * Authenticates a user by verifying their password and generating a JWT.
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns A JWT for the authenticated user
 * @throws Error if authentication fails
 */
export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    // Retrieve user from database (implementation depends on your database)
    const user = await getUserByEmail(email); // This function should be implemented based on your needs

    if (!user) {
      throw new Error(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Invalid email or password`);
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new Error(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Invalid email or password`);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    }, user.role);

    return token;

  } catch (error) {
    logError('User login failed', {
      code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error.message,
      email
    });
    throw error;
  }
};

/**
 * Authorizes a user based on their role and the required permissions.
 * 
 * @param token - JWT token to validate
 * @param requiredRoles - Array of roles that are authorized for access
 * @returns True if the user is authorized, otherwise throws an error
 * @throws Error if authorization fails
 */
export const authorizeUser = async (token: string, requiredRoles: string[]): Promise<boolean> => {
  try {
    // Validate token
    const decodedToken = validateToken(token);

    // Check if user's role is in the required roles array
    const hasRequiredRole = requiredRoles.includes(decodedToken.role);

    if (!hasRequiredRole) {
      throw new Error(`${ERROR_CODES.FORBIDDEN}: Insufficient permissions`);
    }

    return true;

  } catch (error) {
    logError('User authorization failed', {
      code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error.message,
      requiredRoles
    });
    throw error;
  }
};

// Note: These helper functions need to be implemented based on your specific database and requirements
function generateUserId(): string {
  // Implementation depends on your database and ID generation strategy
  throw new Error('Not implemented');
}

async function saveUserToDatabase(user: User): Promise<void> {
  // Implementation depends on your database
  throw new Error('Not implemented');
}

async function getUserByEmail(email: string): Promise<User | null> {
  // Implementation depends on your database
  throw new Error('Not implemented');
}