/**
 * @fileoverview Controller for handling authentication-related API endpoints, including user login,
 * registration, and token validation.
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods):
 *   Implements secure user authentication and role-based access control using JWTs.
 * - API Design (Technical Specification/System Design/API Design):
 *   Provides endpoints for user authentication and token management.
 * 
 * Human Tasks:
 * - Configure rate limiting for authentication endpoints
 * - Set up monitoring for failed authentication attempts
 * - Configure password policy requirements
 * - Set up email verification system for new user registrations
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { TokenService } from '../services/TokenService';
import { jwtMiddleware } from '../middleware/JwtMiddleware';
import { IController } from '../../common/interfaces/IController';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { logError } from '../../common/utils/logger';

// joi v17.6.0
import * as Joi from 'joi';

/**
 * Validation schema for user registration
 */
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
    .required(),
  role: Joi.string().optional()
});

/**
 * Validation schema for user login
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Controller class for handling authentication-related endpoints
 */
export class AuthController implements IController {
  private authService: AuthService;
  private tokenService: TokenService;

  constructor() {
    this.authService = new AuthService();
    this.tokenService = new TokenService();
  }

  /**
   * Handles user registration requests
   * 
   * @param req - Express request object containing user registration data
   * @param res - Express response object
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = await validationMiddleware(registrationSchema, { body: true })(req, res, () => {});
      
      // Register user using AuthService
      const user = await this.authService.registerUser({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      });

      // Generate JWT token for the new user
      const token = await this.tokenService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Send success response
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      });
    } catch (error) {
      logError('User registration failed', {
        code: error.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: error.message,
        email: req.body.email
      });
      errorHandler(error, req, res, () => {});
    }
  }

  /**
   * Handles user login requests
   * 
   * @param req - Express request object containing login credentials
   * @param res - Express response object
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = await validationMiddleware(loginSchema, { body: true })(req, res, () => {});

      // Authenticate user
      const user = await this.authService.loginUser(
        req.body.email,
        req.body.password
      );

      // Generate JWT token
      const token = await this.tokenService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Send success response
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      logError('User login failed', {
        code: error.code || ERROR_CODES.UNAUTHORIZED_ACCESS,
        error: error.message,
        email: req.body.email
      });
      errorHandler(error, req, res, () => {});
    }
  }

  /**
   * Validates a JWT token and returns the decoded payload
   * 
   * @param req - Express request object containing JWT token
   * @param res - Express response object
   */
  public async validateToken(req: Request, res: Response): Promise<void> {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error(`${ERROR_CODES.UNAUTHORIZED_ACCESS}: No token provided`);
      }

      const token = authHeader.split(' ')[1];

      // Validate token
      const decodedToken = await this.tokenService.validateToken(token);

      // Send decoded token payload
      res.status(200).json({
        message: 'Token is valid',
        payload: {
          userId: decodedToken.userId,
          email: decodedToken.email,
          role: decodedToken.role
        }
      });
    } catch (error) {
      logError('Token validation failed', {
        code: error.code || ERROR_CODES.UNAUTHORIZED_ACCESS,
        error: error.message,
        token: req.headers.authorization?.substring(0, 10) + '...'
      });
      errorHandler(error, req, res, () => {});
    }
  }

  /**
   * Implements the IController interface
   * 
   * @param req - Express request object
   * @param res - Express response object
   */
  public async handleRequest(req: Request, res: Response): Promise<void> {
    const method = req.method;
    const path = req.path;

    switch (`${method} ${path}`) {
      case 'POST /register':
        await this.register(req, res);
        break;
      case 'POST /login':
        await this.login(req, res);
        break;
      case 'GET /validate':
        await this.validateToken(req, res);
        break;
      default:
        res.status(404).json({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Endpoint not found'
        });
    }
  }
}