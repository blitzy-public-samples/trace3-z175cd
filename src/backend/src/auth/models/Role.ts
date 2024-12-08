/**
 * @fileoverview Role model implementation for Role-Based Access Control (RBAC)
 * 
 * Requirements Addressed:
 * - Role-Based Access Control (Technical Specification/Security Considerations/Authorization Model)
 *   Implements a structured model for managing roles and permissions to enforce role-based access control.
 * 
 * Human Tasks:
 * - Ensure proper permission strings are used when creating Role instances
 * - Document all valid permission strings in the system documentation
 * - Consider implementing permission hierarchy or grouping if needed in future
 */

import { ROLES } from '../../common/constants/roles';

/**
 * Represents a role in the authentication system with associated permissions.
 * Each role has a name (from predefined ROLES) and an array of permission strings.
 */
export class Role {
    /**
     * The name of the role (e.g., 'admin', 'writer', etc.)
     */
    public readonly name: string;

    /**
     * Array of permission strings associated with this role
     */
    public readonly permissions: string[];

    /**
     * Creates a new Role instance
     * @param name The name of the role (should match one of the predefined ROLES)
     * @param permissions Array of permission strings granted to this role
     * @throws Error if the role name is invalid or permissions array is invalid
     */
    constructor(name: string, permissions: string[]) {
        // Validate role name against predefined ROLES
        if (!Object.values(ROLES).includes(name)) {
            throw new Error(`Invalid role name: ${name}. Must be one of: ${Object.values(ROLES).join(', ')}`);
        }

        // Validate permissions array
        if (!Array.isArray(permissions)) {
            throw new Error('Permissions must be an array of strings');
        }

        if (!permissions.every(permission => typeof permission === 'string')) {
            throw new Error('All permissions must be strings');
        }

        this.name = name;
        this.permissions = [...permissions]; // Create a copy to prevent external modification
    }

    /**
     * Checks if the role has a specific permission
     * @param permission The permission string to check
     * @returns true if the role has the permission, false otherwise
     * @throws Error if the permission parameter is invalid
     */
    public hasPermission(permission: string): boolean {
        // Validate input permission
        if (typeof permission !== 'string' || permission.trim().length === 0) {
            throw new Error('Permission must be a non-empty string');
        }

        // Check if the permission exists in the role's permissions array
        return this.permissions.includes(permission.trim());
    }
}