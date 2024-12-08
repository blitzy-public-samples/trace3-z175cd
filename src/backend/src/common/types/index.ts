/**
 * @fileoverview Aggregates and exports shared TypeScript types and interfaces used across the backend application.
 * 
 * Requirements Addressed:
 * - Shared Type Definitions (Technical Specification/System Design/Data Flow Architecture):
 *   Provides a centralized location for shared TypeScript types and interfaces to ensure 
 *   consistency across backend services.
 * 
 * Human Tasks:
 * - Ensure all imported types and interfaces are kept in sync with their source files
 * - Review and update exports when new shared types are added to the system
 * - Verify that all exported types are properly documented in the API documentation
 */

// Import interfaces and types from their respective modules
import { IController } from '../interfaces/IController';
import { IService } from '../interfaces/IService';
import { EnvironmentVariables } from '../../types/environment';
import { CustomRequest } from '../../types/express';
import { ERROR_CODES } from '../constants/errorCodes';
import { ROLES } from '../constants/roles';

// Re-export interfaces and types for use across the backend application
export {
    /**
     * Standard interface for all backend controllers
     * Ensures consistent request handling patterns
     */
    IController,

    /**
     * Standard interface for all backend services
     * Ensures consistent service execution patterns
     */
    IService,

    /**
     * Type definitions for environment variables
     * Used for type-safe access to configuration
     */
    EnvironmentVariables,

    /**
     * Extended Express Request interface with custom properties
     * Used for type-safe request handling in controllers and middleware
     */
    CustomRequest,

    /**
     * Standardized error codes for consistent error handling
     * Used across all backend services and controllers
     */
    ERROR_CODES,

    /**
     * Predefined roles for role-based access control
     * Used for authorization and permission checks
     */
    ROLES
};

// Type aliases for commonly used types from the exports
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Common response structure for API endpoints
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Base interface for all service inputs
 * Ensures consistent input structure across services
 */
export interface ServiceInput {
    userId?: string;
    role?: UserRole;
    [key: string]: unknown;
}

/**
 * Base interface for all service responses
 * Ensures consistent output structure across services
 */
export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
    };
}

/**
 * Utility type for making all properties in an object required
 */
export type Required<T> = {
    [P in keyof T]-?: T[P];
};

/**
 * Utility type for making all properties in an object optional
 */
export type Optional<T> = {
    [P in keyof T]+?: T[P];
};

/**
 * Utility type for extracting the return type of a Promise
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T;