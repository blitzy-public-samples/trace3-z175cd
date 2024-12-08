/**
 * @fileoverview Provides utility functions for encryption and decryption using AES-256-GCM
 * to ensure secure handling of sensitive data across the backend application.
 * 
 * Requirements Addressed:
 * - Data Security (Technical Specification/Security Considerations/Data Protection Measures):
 *   Implements encryption and decryption mechanisms to protect sensitive data at rest and in transit.
 * 
 * Human Tasks:
 * - Ensure secure key management system is in place for encryption keys
 * - Implement key rotation policy according to security requirements
 * - Configure secure storage for initialization vectors if needed for long-term storage
 */

// crypto: built-in
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { INTERNAL_SERVER_ERROR } from '../constants/errorCodes';

// Constants for encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM mode
const AUTH_TAG_LENGTH = 16; // 128 bits
const ENCODING = 'hex' as const;

/**
 * Interface for encryption result containing encrypted data and initialization vector
 */
interface EncryptionResult {
  encryptedData: string;  // Encrypted data in hex format
  iv: string;            // Initialization vector in hex format
  authTag: string;       // Authentication tag in hex format
}

/**
 * Encrypts a given plaintext using AES-256-GCM encryption.
 * 
 * @param plaintext - The text to be encrypted
 * @param key - The encryption key (must be 32 bytes for AES-256)
 * @returns Object containing the encrypted data, initialization vector (IV), and authentication tag
 * @throws Error if encryption fails
 */
export const encrypt = (plaintext: string, key: string): EncryptionResult => {
  try {
    // Generate a random initialization vector
    const iv = randomBytes(IV_LENGTH);

    // Create cipher instance
    const cipher = createCipheriv(ALGORITHM, Buffer.from(key), iv);

    // Encrypt the plaintext
    let encryptedData = cipher.update(plaintext, 'utf8', ENCODING);
    encryptedData += cipher.final(ENCODING);

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    return {
      encryptedData,
      iv: iv.toString(ENCODING),
      authTag: authTag.toString(ENCODING)
    };
  } catch (error) {
    // Log error and throw with standardized error code
    console.error('Encryption failed:', error);
    throw new Error(`${INTERNAL_SERVER_ERROR}: Encryption failed`);
  }
};

/**
 * Decrypts a given ciphertext using AES-256-GCM encryption.
 * 
 * @param ciphertext - The encrypted data in hex format
 * @param key - The encryption key (must be 32 bytes for AES-256)
 * @param iv - The initialization vector used for encryption in hex format
 * @param authTag - The authentication tag from encryption in hex format
 * @returns The decrypted plaintext
 * @throws Error if decryption fails or authentication fails
 */
export const decrypt = (
  ciphertext: string,
  key: string,
  iv: string,
  authTag: string
): string => {
  try {
    // Create decipher instance
    const decipher = createDecipheriv(
      ALGORITHM,
      Buffer.from(key),
      Buffer.from(iv, ENCODING)
    );

    // Set authentication tag
    decipher.setAuthTag(Buffer.from(authTag, ENCODING));

    // Decrypt the ciphertext
    let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Log error and throw with standardized error code
    console.error('Decryption failed:', error);
    throw new Error(`${INTERNAL_SERVER_ERROR}: Decryption failed - data may be corrupted or tampered`);
  }
};