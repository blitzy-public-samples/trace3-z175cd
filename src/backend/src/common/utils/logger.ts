/**
 * @fileoverview Provides utility functions for logging application events, errors, and debugging information
 * in a standardized format.
 * 
 * Requirements Addressed:
 * - Logging and Monitoring (Technical Specification/Cross-Cutting Concerns/Logging):
 *   Implements a centralized logging mechanism to capture application events, errors, and debugging information.
 * 
 * Human Tasks:
 * - Ensure proper log rotation and retention policies are configured in the production environment
 * - Set up log aggregation and monitoring alerts in the production environment
 * - Configure appropriate log levels for different environments (development, staging, production)
 */

// winston v3.8.2
import winston from 'winston';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Winston logger configuration with custom format and multiple transports
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'substack-replica' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Logs informational messages to the logging system.
 * 
 * @param message - The information message to log
 */
export const logInfo = (message: string): void => {
  logger.info(message, {
    timestamp: new Date().toISOString(),
    level: 'info'
  });
};

/**
 * Logs error messages to the logging system with detailed error information.
 * 
 * @param message - The error message to log
 * @param errorDetails - Additional error details including stack trace, error code, etc.
 */
export const logError = (message: string, errorDetails: Record<string, any>): void => {
  const errorCode = errorDetails.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  
  // Map error codes to log metadata
  const errorMetadata: Record<string, any> = {
    timestamp: new Date().toISOString(),
    level: 'error',
    errorCode,
    ...errorDetails
  };

  // Add specific metadata based on error type
  switch (errorCode) {
    case ERROR_CODES.VALIDATION_ERROR:
      errorMetadata.validationErrors = errorDetails.validationErrors;
      break;
    case ERROR_CODES.RESOURCE_NOT_FOUND:
      errorMetadata.resourceId = errorDetails.resourceId;
      errorMetadata.resourceType = errorDetails.resourceType;
      break;
    case ERROR_CODES.UNAUTHORIZED_ACCESS:
    case ERROR_CODES.FORBIDDEN:
      errorMetadata.userId = errorDetails.userId;
      errorMetadata.requiredPermissions = errorDetails.requiredPermissions;
      break;
  }

  logger.error(message, errorMetadata);
};

/**
 * Logs debugging information to the logging system.
 * Only logs when NODE_ENV is not production or LOG_LEVEL is debug.
 * 
 * @param message - The debug message to log
 */
export const logDebug = (message: string): void => {
  if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
    logger.debug(message, {
      timestamp: new Date().toISOString(),
      level: 'debug'
    });
  }
};