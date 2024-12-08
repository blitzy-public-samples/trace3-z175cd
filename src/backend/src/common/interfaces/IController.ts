/**
 * @fileoverview Defines a common interface for backend controllers to ensure consistency 
 * and standardization across the application.
 * 
 * Requirements Addressed:
 * - Standardized Controller Interfaces (Technical Specification/System Design/API Design):
 *   Ensures all controllers adhere to a common interface for consistent behavior and maintainability.
 * 
 * Human Tasks:
 * - Ensure all controller implementations properly handle request validation
 * - Review error handling patterns in controller implementations
 * - Document any controller-specific error codes or responses
 */

import { validateSchema } from '../utils/validator';
import { Request, Response } from 'express';

/**
 * Interface for backend controllers, ensuring a consistent structure and behavior.
 * All controllers in the application must implement this interface to maintain
 * standardization and predictable behavior patterns.
 */
export interface IController {
    /**
     * Handles incoming HTTP requests and returns appropriate responses.
     * Implementations should:
     * - Validate input data using the validateSchema utility
     * - Perform business logic
     * - Handle errors appropriately
     * - Send standardized responses
     * 
     * @param req - Express Request object containing the incoming request data
     * @param res - Express Response object for sending the response
     * @returns Promise that resolves when the request is handled
     */
    handleRequest(req: Request, res: Response): Promise<void>;
}