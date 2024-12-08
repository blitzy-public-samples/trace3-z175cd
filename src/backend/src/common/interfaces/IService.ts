/**
 * @fileoverview Defines a common interface for backend services to ensure consistency
 * and standardization across the application.
 * 
 * Requirements Addressed:
 * - Standardized Service Interfaces (Technical Specification/System Design/API Design):
 *   Ensures all services adhere to a common interface for consistent behavior and maintainability.
 * 
 * Human Tasks:
 * - Ensure all service implementations properly handle error codes according to their use cases
 * - Verify that role-based access control is implemented in services where required
 * - Document any service-specific input/output schemas that extend this base interface
 */

import { ERROR_CODES } from '../constants/errorCodes';
import { ROLES } from '../constants/roles';

/**
 * Common interface that all backend services must implement to ensure
 * consistent structure and behavior across the application.
 * 
 * This interface enforces a standard execute method that handles:
 * - Input validation (using ERROR_CODES.VALIDATION_ERROR)
 * - Role-based access control (using ROLES)
 * - Error handling (using ERROR_CODES.INTERNAL_SERVER_ERROR)
 */
export interface IService {
    /**
     * Executes the main logic of the service.
     * 
     * @param input - The input object containing all parameters required by the service.
     *                Each service implementation should define its specific input type.
     * 
     * @returns Promise<object> - A promise that resolves to the result of the service execution.
     *                           Each service implementation should define its specific return type.
     * 
     * @throws Error with ERROR_CODES.VALIDATION_ERROR if input validation fails
     * @throws Error with ERROR_CODES.INTERNAL_SERVER_ERROR if an unexpected error occurs
     */
    execute(input: object): Promise<object>;
}