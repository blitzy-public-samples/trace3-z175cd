// @ts-check

// validator v13.11.0
import validateEmail from 'validator';

/**
 * @fileoverview Authentication type definitions for the Substack Replica platform.
 * Addresses requirement: Authentication Data Structures
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Purpose: Provides standardized interfaces for authentication-related data structures
 */

/**
 * Represents an authenticated user in the system.
 * Contains essential user information and authentication state.
 */
export interface AuthUser {
  /**
   * Unique identifier for the user
   * Format: UUID v4
   */
  id: string;

  /**
   * User's email address
   * Must be a valid email format
   */
  email: string;

  /**
   * User's role in the system
   * Possible values: 'admin', 'writer', 'subscriber', 'guest'
   * Used for role-based access control (RBAC)
   */
  role: string;

  /**
   * JWT token for the authenticated session
   * Format: Base64 encoded JWT string
   * Contains: user claims, permissions, and session metadata
   */
  token: string;
}

/**
 * Represents the response structure for authentication operations.
 * Used for login, registration, and token refresh responses.
 */
export interface AuthResponse {
  /**
   * Authenticated user information
   * Contains user details and session state
   */
  user: AuthUser;

  /**
   * Authentication token for subsequent requests
   * Format: Base64 encoded JWT string
   * Used for: API authorization
   */
  token: string;
}