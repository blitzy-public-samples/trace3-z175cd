/**
 * @fileoverview Provides utility functions for generating mock data, validating test scenarios,
 * and handling encryption for testing purposes.
 * 
 * Requirements Addressed:
 * - Testing Utilities (Technical Specification/Development & Deployment/Testing):
 *   Implements helper functions to streamline the testing process, including mock data 
 *   generation and validation.
 * 
 * Human Tasks:
 * - Ensure encryption keys used in tests are properly secured and not committed to version control
 * - Update mock data generation patterns when new data types are added to the system
 * - Maintain test data schemas in sync with production data schemas
 */

// faker v5.5.3
import faker from 'faker';
import { ERROR_CODES, VALIDATION_ERROR, INTERNAL_SERVER_ERROR } from '../../common/constants/errorCodes';
import { ROLES, ADMIN, WRITER } from '../../common/constants/roles';
import { encrypt, decrypt } from '../../common/utils/encryption';
import { validateSchema } from '../../common/utils/validator';

/**
 * Supported mock data types for generation
 */
type MockDataType = 'user' | 'article' | 'comment' | 'profile';

/**
 * Generates random mock data for testing purposes based on the specified data type.
 * 
 * @param dataType - The type of mock data to generate
 * @returns Generated mock data object
 * @throws Error if unsupported data type is provided
 */
export const generateMockData = (dataType: MockDataType): Record<string, any> => {
  switch (dataType) {
    case 'user':
      return {
        id: faker.datatype.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(12),
        role: faker.random.arrayElement([ADMIN, WRITER]),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

    case 'article':
      return {
        id: faker.datatype.uuid(),
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        authorId: faker.datatype.uuid(),
        status: faker.random.arrayElement(['draft', 'published', 'archived']),
        tags: Array.from({ length: 3 }, () => faker.lorem.word()),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

    case 'comment':
      return {
        id: faker.datatype.uuid(),
        content: faker.lorem.paragraph(),
        userId: faker.datatype.uuid(),
        articleId: faker.datatype.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

    case 'profile':
      return {
        id: faker.datatype.uuid(),
        userId: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        bio: faker.lorem.paragraph(),
        avatar: faker.image.avatar(),
        location: faker.address.city(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };

    default:
      throw new Error(`${VALIDATION_ERROR}: Unsupported mock data type: ${dataType}`);
  }
};

/**
 * Validates mock data against a provided schema.
 * 
 * @param mockData - The mock data object to validate
 * @param schema - The validation schema to check against
 * @returns true if validation succeeds
 * @throws Error with VALIDATION_ERROR code if validation fails
 */
export const validateMockData = (
  mockData: Record<string, any>,
  schema: Record<string, any>
): boolean => {
  try {
    validateSchema(mockData, schema);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${VALIDATION_ERROR}: ${error.message}`);
    }
    throw new Error(`${INTERNAL_SERVER_ERROR}: Validation failed unexpectedly`);
  }
};

/**
 * Encrypts mock data for secure testing.
 * 
 * @param mockData - The mock data to encrypt
 * @param encryptionKey - The key to use for encryption
 * @returns Object containing encrypted data and IV
 * @throws Error if encryption fails
 */
export const encryptMockData = (
  mockData: string,
  encryptionKey: string
): { encryptedData: string; iv: string; authTag: string } => {
  try {
    return encrypt(mockData, encryptionKey);
  } catch (error) {
    throw new Error(`${INTERNAL_SERVER_ERROR}: Failed to encrypt mock data`);
  }
};

/**
 * Decrypts encrypted mock data for secure testing.
 * 
 * @param encryptedData - The encrypted data to decrypt
 * @param encryptionKey - The key used for encryption
 * @param iv - The initialization vector used during encryption
 * @param authTag - The authentication tag from encryption
 * @returns Decrypted mock data
 * @throws Error if decryption fails
 */
export const decryptMockData = (
  encryptedData: string,
  encryptionKey: string,
  iv: string,
  authTag: string
): string => {
  try {
    return decrypt(encryptedData, encryptionKey, iv, authTag);
  } catch (error) {
    throw new Error(`${INTERNAL_SERVER_ERROR}: Failed to decrypt mock data`);
  }
};