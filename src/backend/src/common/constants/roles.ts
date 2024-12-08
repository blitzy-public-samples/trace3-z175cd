/**
 * @fileoverview Constants defining user roles for Role-Based Access Control (RBAC)
 * 
 * Requirements Addressed:
 * - Role-Based Access Control (Technical Specification/Security Considerations/Authorization Model)
 *   Provides predefined roles for enforcing role-based access control across the system.
 * 
 * Human Tasks:
 * - Ensure these role definitions match the roles configured in the authentication/authorization provider
 * - Update role-based access policies in the security configuration to align with these role definitions
 * - Document the permissions and capabilities associated with each role in the system documentation
 */

/**
 * Predefined user roles used for role-based access control across the backend application.
 * These roles form a hierarchical structure with increasing levels of access:
 * GUEST -> SUBSCRIBER -> WRITER -> ADMIN
 */
export const ROLES = {
    /**
     * Administrator role with full system access and management capabilities
     */
    ADMIN: 'admin',

    /**
     * Writer role for content creation and management
     */
    WRITER: 'writer',

    /**
     * Subscriber role for authenticated users with basic access
     */
    SUBSCRIBER: 'subscriber',

    /**
     * Guest role for unauthenticated or public access
     */
    GUEST: 'guest'
} as const;

// Type definition to ensure type safety when using role values
export type UserRole = typeof ROLES[keyof typeof ROLES];