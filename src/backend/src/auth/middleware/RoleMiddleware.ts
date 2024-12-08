/**
 * @fileoverview Role-based access control (RBAC) middleware implementation
 * 
 * Requirements Addressed:
 * - Role-Based Access Control (Technical Specification/Security Considerations/Authorization Model)
 *   Implements middleware to enforce role-based access control by validating user roles against required permissions.
 * 
 * Human Tasks:
 * - Ensure proper role configuration in the authentication system
 * - Document role hierarchy and permissions in system documentation
 * - Set up monitoring alerts for unauthorized access attempts
 */

import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { logError } from '../../common/utils/logger';

/**
 * Express middleware function that enforces role-based access control
 * by validating the user's role against the required roles for the resource.
 * 
 * @param requiredRoles - Array of role names that are authorized to access the resource
 * @returns Express middleware function that validates user roles
 */
export const roleMiddleware = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate input
            if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
                throw new Error('Required roles must be a non-empty array');
            }

            // Get the user from the request object (set by authentication middleware)
            const user = req.user as User;
            
            if (!user || !user.role) {
                // Log unauthorized access attempt
                logError('Unauthorized access attempt - no user or role', {
                    path: req.path,
                    method: req.method,
                    requiredRoles,
                    code: ERROR_CODES.FORBIDDEN,
                    timestamp: new Date().toISOString()
                });

                return res.status(403).json({
                    error: ERROR_CODES.FORBIDDEN,
                    message: 'Access denied - insufficient permissions'
                });
            }

            // Check if the user's role is included in the required roles
            const hasRequiredRole = requiredRoles.includes(user.role);

            if (!hasRequiredRole) {
                // Log unauthorized access attempt with user context
                logError('Unauthorized access attempt - insufficient role', {
                    userId: user.id,
                    userRole: user.role,
                    path: req.path,
                    method: req.method,
                    requiredRoles,
                    code: ERROR_CODES.FORBIDDEN,
                    timestamp: new Date().toISOString()
                });

                return res.status(403).json({
                    error: ERROR_CODES.FORBIDDEN,
                    message: 'Access denied - insufficient permissions'
                });
            }

            // Create a Role instance to check specific permissions if needed
            const userRole = new Role(user.role, []);
            
            // Attach the role instance to the request for use in route handlers
            req.userRole = userRole;

            // User has required role, proceed to next middleware
            next();
        } catch (error) {
            // Log any unexpected errors
            logError('Role middleware error', {
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.path,
                method: req.method,
                requiredRoles,
                code: ERROR_CODES.FORBIDDEN,
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            });

            return res.status(403).json({
                error: ERROR_CODES.FORBIDDEN,
                message: 'Access denied - role validation failed'
            });
        }
    };
};

// Extend Express Request type to include userRole
declare global {
    namespace Express {
        interface Request {
            userRole?: Role;
        }
    }
}