/**
 * @fileoverview Custom type definitions extending Express Request and Response objects
 * 
 * Requirements Addressed:
 * - Custom Middleware Support (Technical Specification/System Architecture/Cross-Cutting Concerns)
 *   Provides type safety and consistency for custom properties added to Express Request and Response objects.
 * 
 * Human Tasks:
 * 1. Ensure error handling middleware is properly configured to use the sendError method
 * 2. Verify that authentication middleware correctly sets the user object
 * 3. Confirm validation middleware populates the validatedData property
 */

import { Request, Response } from 'express'; // v4.18.2
import { EnvironmentVariables } from './environment';

/**
 * Standard error response structure for the application
 */
interface ErrorResponse {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Represents the structure of an authenticated user
 */
interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  [key: string]: unknown;
}

/**
 * Extends the Express Request object to include custom properties used across
 * the application's middleware and route handlers.
 */
export interface CustomRequest extends Request {
  /**
   * The authenticated user object, populated by the authentication middleware.
   * Will be null for unauthenticated requests.
   */
  user: AuthenticatedUser | null;

  /**
   * Data that has been validated and transformed by the validation middleware.
   * Will be null if no validation middleware has processed the request.
   */
  validatedData: Record<string, unknown> | null;

  /**
   * Environment variables accessible within the request context
   * @internal
   */
  env?: EnvironmentVariables;
}

/**
 * Extends the Express Response object to include custom methods for
 * standardized response handling across the application.
 */
export interface CustomResponse extends Response {
  /**
   * Sends a standardized error response
   * @param status HTTP status code
   * @param message Error message
   * @param code Optional error code for client-side error handling
   * @param details Optional additional error details
   */
  sendError(
    status: number,
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ): void;
}

// Augment the Express namespace to use our custom types
declare global {
  namespace Express {
    interface Request extends CustomRequest {}
    interface Response extends CustomResponse {}
  }
}

// Ensure this file is treated as a module
export {};