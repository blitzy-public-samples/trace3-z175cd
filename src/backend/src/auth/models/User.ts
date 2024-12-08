/**
 * @fileoverview Defines the User model for authentication and user management,
 * implementing secure handling of user data and password verification.
 * 
 * Requirements Addressed:
 * - User Management (Technical Specification/Security Considerations/Authentication and Authorization)
 *   Provides a structured model for user data, including secure handling of sensitive information like passwords.
 * 
 * Human Tasks:
 * - Ensure encryption key management system is properly configured
 * - Set up secure storage for user data in the database
 * - Configure email verification system for new user registration
 * - Implement password policy enforcement if required
 */

import { ROLES } from '../common/constants/roles';
import { encrypt, decrypt } from '../common/utils/encryption';

/**
 * Represents a user in the system with secure password handling and role-based access control.
 */
export class User {
    /**
     * Unique identifier for the user
     */
    public readonly id: string;

    /**
     * User's email address used for authentication and communication
     */
    public readonly email: string;

    /**
     * Encrypted password stored as hex string with encryption metadata
     */
    private password: {
        encryptedData: string;
        iv: string;
        authTag: string;
    };

    /**
     * User's role for access control, must be one of the predefined ROLES
     */
    public readonly role: string;

    /**
     * Indicates whether the user's email has been verified
     */
    public readonly isVerified: boolean;

    /**
     * Creates a new User instance with secure password encryption.
     * 
     * @param id - Unique identifier for the user
     * @param email - User's email address
     * @param password - User's plain text password (will be encrypted)
     * @param role - User's role from predefined ROLES
     * @param isVerified - Email verification status
     */
    constructor(
        id: string,
        email: string,
        password: string,
        role: typeof ROLES[keyof typeof ROLES],
        isVerified: boolean
    ) {
        // Validate role
        if (!Object.values(ROLES).includes(role)) {
            throw new Error('Invalid role specified');
        }

        this.id = id;
        this.email = email.toLowerCase(); // Normalize email
        
        // Encrypt password using the encryption utility
        const encryptionResult = encrypt(password, process.env.ENCRYPTION_KEY || '');
        this.password = {
            encryptedData: encryptionResult.encryptedData,
            iv: encryptionResult.iv,
            authTag: encryptionResult.authTag
        };

        this.role = role;
        this.isVerified = isVerified;
    }

    /**
     * Verifies if the provided password matches the stored encrypted password.
     * 
     * @param password - Plain text password to verify
     * @returns boolean indicating whether the password matches
     */
    public verifyPassword(password: string): boolean {
        try {
            const decryptedPassword = decrypt(
                this.password.encryptedData,
                process.env.ENCRYPTION_KEY || '',
                this.password.iv,
                this.password.authTag
            );
            return decryptedPassword === password;
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }
}