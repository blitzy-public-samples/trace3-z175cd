/**
 * @fileoverview Defines standardized error codes used across the backend application
 * for consistent error handling and logging.
 * 
 * Requirements Addressed:
 * - Error Handling (Technical Specification/Cross-Cutting Concerns/Logging):
 *   Provides a standardized mechanism for capturing, logging, and responding to 
 *   errors in the backend application.
 * - API Error Responses (Technical Specification/API Design/Endpoint Specifications):
 *   Ensures consistent error responses are returned to API clients for better 
 *   error handling and debugging.
 */

/**
 * Standardized error codes used throughout the backend application.
 * These codes follow the format: HTTP_STATUS_CODE_ERROR_TYPE
 * This ensures consistency in error reporting and makes debugging easier
 * by providing a clear mapping between HTTP status codes and internal error types.
 */
export const ERROR_CODES = {
    /**
     * Used for unexpected server errors or when the error doesn't fit other categories
     * Maps to HTTP 500 Internal Server Error
     */
    INTERNAL_SERVER_ERROR: '500_INTERNAL_SERVER_ERROR',

    /**
     * Used when request validation fails (invalid input, missing required fields, etc.)
     * Maps to HTTP 400 Bad Request
     */
    VALIDATION_ERROR: '400_VALIDATION_ERROR',

    /**
     * Used when the requested resource does not exist
     * Maps to HTTP 404 Not Found
     */
    RESOURCE_NOT_FOUND: '404_RESOURCE_NOT_FOUND',

    /**
     * Used when authentication is required but not provided or is invalid
     * Maps to HTTP 401 Unauthorized
     */
    UNAUTHORIZED_ACCESS: '401_UNAUTHORIZED_ACCESS',

    /**
     * Used when the authenticated user doesn't have sufficient permissions
     * Maps to HTTP 403 Forbidden
     */
    FORBIDDEN: '403_FORBIDDEN'
} as const;

// Type definition to ensure type safety when using error codes
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];