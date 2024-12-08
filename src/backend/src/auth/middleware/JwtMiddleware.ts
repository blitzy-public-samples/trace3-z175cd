/**
 * @fileoverview Middleware for validating JSON Web Tokens (JWTs) in incoming requests to secure API endpoints.
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods):
 *   Implements JWT-based authentication and authorization mechanisms for secure user access.
 * - Role-Based Access Control (Technical Specification/Security Considerations/Authorization Model):
 *   Enforces role-based access control by validating user roles in JWTs.
 * 
 * Human Tasks:
 * - Configure JWT secret key in environment variables
 * - Set up token expiration policies for different environments
 * - Configure token blacklist/revocation mechanism if needed
 * - Monitor and alert on high rates of unauthorized access attempts
 */

import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/TokenService';
import { ROLES } from '../../common/constants/roles';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { logError } from '../../common/utils/logger';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';

/**
 * Interface extending Express Request to include JWT payload
 */
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

/**
 * Express middleware function for validating JWTs in incoming requests.
 * Extracts the JWT from the Authorization header, validates it, and checks the user role.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const jwtMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract the JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: No token provided`);
    }

    // Get the token part after 'Bearer '
    const token = authHeader.split(' ')[1];

    try {
      // Validate the JWT and extract payload
      const decodedToken = await validateToken(token);

      // Validate user role from token
      const userRole = decodedToken.role?.toLowerCase();
      if (!userRole || !Object.values(ROLES).includes(userRole)) {
        logError('Invalid role in token', {
          code: ERROR_CODES.FORBIDDEN,
          role: userRole,
          userId: decodedToken.userId,
          path: req.path
        });
        throw new Error(`${ERROR_CODES.FORBIDDEN}: Invalid user role`);
      }

      // Attach decoded token payload to request for downstream middleware
      req.user = {
        userId: decodedToken.userId,
        email: decodedToken.email,
        role: userRole,
        ...decodedToken
      };

      // Token is valid, proceed to next middleware
      next();
    } catch (tokenError) {
      // Log token validation failure
      logError('Token validation failed', {
        code: ERROR_CODES.UNAUTHORIZED_ACCESS,
        error: tokenError.message,
        path: req.path,
        token: token.substring(0, 10) + '...' // Log only token prefix for security
      });

      throw new Error(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: Invalid token`);
    }
  } catch (error) {
    // Handle all errors through the error handling middleware
    errorHandler(error, req, res, next);
  }
};