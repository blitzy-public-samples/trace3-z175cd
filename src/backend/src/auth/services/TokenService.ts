/**
 * @fileoverview Provides functionality for generating, validating, and decoding JSON Web Tokens (JWTs)
 * for authentication and authorization purposes.
 * 
 * Requirements Addressed:
 * - Authentication and Authorization (Technical Specification/Security Considerations/Authentication Methods):
 *   Implements JWT-based authentication for secure user sessions and role-based access control.
 * 
 * Human Tasks:
 * - Configure JWT secret key in environment variables
 * - Set up token expiration policies for different environments
 * - Implement token refresh mechanism if required
 * - Configure token blacklist/revocation mechanism if needed
 */

// jsonwebtoken v9.0.0
import jwt from 'jsonwebtoken';
import { encrypt, decrypt } from '../../common/utils/encryption';
import { ROLES } from '../../common/constants/roles';
import { logError } from '../../common/utils/logger';
import { validateSchema } from '../../common/utils/validator';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Joi schema for token payload validation
const tokenPayloadSchema = {
  userId: joi.string().required(),
  email: joi.string().email().required(),
  // Add other required payload fields here
};

/**
 * Interface for JWT payload structure
 */
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Generates a JWT for a given payload and role.
 * 
 * @param payload - The data to be included in the token
 * @param role - The user role (must be one of the predefined ROLES)
 * @returns A signed JWT string
 * @throws Error if payload validation fails or token generation fails
 */
export const generateToken = (payload: TokenPayload, role: string): string => {
  try {
    // Validate payload against schema
    validateSchema(payload, tokenPayloadSchema);

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Invalid role specified`);
    }

    // Encrypt sensitive payload data
    const encryptedEmail = encrypt(payload.email, JWT_SECRET);

    // Prepare token payload with encrypted data
    const tokenPayload = {
      ...payload,
      email: encryptedEmail,
      role,
      iat: Math.floor(Date.now() / 1000),
    };

    // Sign and return the token
    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    });
  } catch (error) {
    logError('Token generation failed', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error.message,
      role
    });
    throw error;
  }
};

/**
 * Validates a given JWT and extracts its payload.
 * 
 * @param token - The JWT to validate
 * @returns The decoded and decrypted token payload
 * @throws Error if token is invalid or verification fails
 */
export const validateToken = (token: string): TokenPayload => {
  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Decrypt sensitive payload data
    if (decoded.email) {
      decoded.email = decrypt(decoded.email, JWT_SECRET);
    }

    return decoded;
  } catch (error) {
    let errorCode = ERROR_CODES.UNAUTHORIZED_ACCESS;
    if (error instanceof jwt.TokenExpiredError) {
      errorCode = ERROR_CODES.UNAUTHORIZED_ACCESS;
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorCode = ERROR_CODES.UNAUTHORIZED_ACCESS;
    }

    logError('Token validation failed', {
      code: errorCode,
      error: error.message,
      token: token.substring(0, 10) + '...' // Log only token prefix for security
    });

    throw new Error(`${errorCode}: ${error.message}`);
  }
};

/**
 * Decodes a JWT without validating its signature.
 * Warning: This should only be used when signature validation is not required.
 * 
 * @param token - The JWT to decode
 * @returns The decoded token payload without verification
 * @throws Error if token cannot be decoded
 */
export const decodeToken = (token: string): TokenPayload => {
  try {
    // Decode token without verification
    const decoded = jwt.decode(token) as TokenPayload;
    
    if (!decoded) {
      throw new Error('Invalid token format');
    }

    return decoded;
  } catch (error) {
    logError('Token decoding failed', {
      code: ERROR_CODES.VALIDATION_ERROR,
      error: error.message,
      token: token.substring(0, 10) + '...' // Log only token prefix for security
    });

    throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Unable to decode token`);
  }
};