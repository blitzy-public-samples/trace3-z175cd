/**
 * @fileoverview Error handling middleware for the backend application that captures errors,
 * logs them, and sends standardized error responses to clients.
 * 
 * Requirements Addressed:
 * - Error Handling (Technical Specification/Cross-Cutting Concerns/Logging):
 *   Provides a centralized mechanism for capturing, logging, and responding to 
 *   errors in the backend application.
 * - API Error Responses (Technical Specification/API Design/Endpoint Specifications):
 *   Ensures consistent error responses are returned to API clients for better 
 *   error handling and debugging.
 * 
 * Human Tasks:
 * - Ensure proper error monitoring and alerting is set up in production
 * - Configure error reporting thresholds and notification channels
 * - Set up error tracking and analytics tools integration
 */

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { ERROR_CODES } from '../constants/errorCodes';
import { logError } from '../utils/logger';

/**
 * Interface for standardized error responses sent to clients
 */
interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Maps error codes to their corresponding HTTP status codes
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 404,
  [ERROR_CODES.UNAUTHORIZED_ACCESS]: 401,
  [ERROR_CODES.FORBIDDEN]: 403
};

/**
 * Express middleware for handling errors in the application.
 * Captures errors, logs them, and sends standardized error responses to clients.
 * 
 * @param err - Error object thrown in the application
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error response
  const errorResponse: ErrorResponse = {
    status: 500,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred'
  };

  // Handle known application errors
  if (err instanceof AppError) {
    errorResponse.status = err.status;
    errorResponse.code = err.code;
    errorResponse.message = err.message;
    if (err.details) {
      errorResponse.details = err.details;
    }
  } 
  // Handle validation errors (express-validator)
  else if (err instanceof Error && 'errors' in (err as any)) {
    errorResponse.status = 400;
    errorResponse.code = ERROR_CODES.VALIDATION_ERROR;
    errorResponse.message = 'Validation failed';
    errorResponse.details = (err as any).errors;
  }
  // Handle other known error types
  else if (err instanceof Error) {
    // Map specific error types to appropriate error codes
    switch (err.constructor.name) {
      case 'JsonWebTokenError':
      case 'TokenExpiredError':
        errorResponse.status = 401;
        errorResponse.code = ERROR_CODES.UNAUTHORIZED_ACCESS;
        errorResponse.message = 'Authentication failed';
        break;
      case 'NotFoundError':
        errorResponse.status = 404;
        errorResponse.code = ERROR_CODES.RESOURCE_NOT_FOUND;
        errorResponse.message = err.message || 'Resource not found';
        break;
      case 'ForbiddenError':
        errorResponse.status = 403;
        errorResponse.code = ERROR_CODES.FORBIDDEN;
        errorResponse.message = err.message || 'Access forbidden';
        break;
    }
  }

  // Log the error with detailed information
  logError(errorResponse.message, {
    code: errorResponse.code,
    status: errorResponse.status,
    stack: err.stack,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    params: req.params,
    headers: req.headers,
    timestamp: new Date().toISOString(),
    details: errorResponse.details
  });

  // Send error response to client
  res.status(errorResponse.status).json({
    error: {
      code: errorResponse.code,
      message: errorResponse.message,
      ...(errorResponse.details && { details: errorResponse.details }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};