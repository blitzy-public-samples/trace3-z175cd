/**
 * @fileoverview Defines the routing logic for authentication-related API endpoints.
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods):
 *   Implements secure user authentication and role-based access control using JWTs.
 * - API Design (Technical Specification/System Design/API Design):
 *   Provides endpoints for user authentication and token management.
 * - Rate Limiting (Technical Specification/Security Considerations/Security Controls):
 *   Implements rate-limiting to restrict the number of API requests from a single source.
 * - Role-Based Access Control (Technical Specification/Security Considerations/Authorization Model):
 *   Enforces role-based access control by validating user roles in JWTs.
 * 
 * Human Tasks:
 * 1. Configure rate limiting thresholds based on environment requirements
 * 2. Set up monitoring for authentication failures and rate limit violations
 * 3. Review and adjust JWT token expiration settings
 * 4. Configure role-based access control policies
 */

// express v4.18.2
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { jwtMiddleware } from '../middleware/JwtMiddleware';
import { rateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { roleMiddleware } from '../middleware/RoleMiddleware';
import { ROLES } from '../../common/constants/roles';

// Initialize router
const authRoutes = Router();

// Initialize controller
const authController = new AuthController();

/**
 * Rate limit configuration for authentication endpoints
 * More restrictive limits for authentication to prevent brute force attacks
 */
const authRateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
};

/**
 * POST /register
 * Register a new user account
 * Rate limited to prevent abuse
 */
authRoutes.post(
  '/register',
  rateLimitMiddleware(authRateLimitOptions),
  async (req, res) => {
    await authController.register(req, res);
  }
);

/**
 * POST /login
 * Authenticate user and receive JWT token
 * Rate limited to prevent brute force attacks
 */
authRoutes.post(
  '/login',
  rateLimitMiddleware(authRateLimitOptions),
  async (req, res) => {
    await authController.login(req, res);
  }
);

/**
 * GET /validate
 * Validate JWT token and return decoded payload
 * Requires valid JWT and appropriate role
 */
authRoutes.get(
  '/validate',
  rateLimitMiddleware(), // Use default rate limit for protected routes
  jwtMiddleware,
  roleMiddleware([ROLES.ADMIN, ROLES.WRITER, ROLES.SUBSCRIBER]),
  async (req, res) => {
    await authController.validateToken(req, res);
  }
);

export { authRoutes };