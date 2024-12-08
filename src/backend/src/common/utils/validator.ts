/**
 * @fileoverview Provides utility functions for validating input data across the backend application.
 * 
 * Requirements Addressed:
 * - Input Validation (Technical Specification/Cross-Cutting Concerns/Validation):
 *   Ensures all input data adheres to predefined schemas and formats to maintain data integrity 
 *   and prevent errors.
 * 
 * Human Tasks:
 * - Ensure Joi validation schemas are kept in sync with database models
 * - Review and update validation rules when new fields or requirements are added
 * - Monitor validation error rates for potential system issues or attack patterns
 */

// joi v17.6.0
import Joi from 'joi';
import { ERROR_CODES } from '../constants/errorCodes';
import { ROLES } from '../constants/roles';

/**
 * Validates input data against a predefined Joi schema.
 * Throws a validation error with standardized error code if validation fails.
 * 
 * @param data - The input data to validate
 * @param schema - The Joi schema to validate against
 * @returns The validated data object if validation succeeds
 * @throws Error with VALIDATION_ERROR code if validation fails
 */
export const validateSchema = (data: any, schema: Joi.Schema): any => {
  const validationOptions = {
    abortEarly: false, // Returns all errors instead of stopping at first error
    stripUnknown: true, // Removes unknown keys from the validated data
    presence: 'required' as const // Ensures all required fields are present
  };

  const { error, value } = schema.validate(data, validationOptions);

  if (error) {
    // Format validation error details into a more readable structure
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    // Throw error with standardized format
    const validationError = new Error('Validation failed');
    (validationError as any).code = ERROR_CODES.VALIDATION_ERROR;
    (validationError as any).details = errorDetails;
    throw validationError;
  }

  return value;
};

/**
 * Validates if a given role is valid based on predefined roles.
 * Used for role-based access control validation.
 * 
 * @param role - The role string to validate
 * @returns boolean indicating if the role is valid
 */
export const validateRole = (role: string): boolean => {
  // Convert role to lowercase for case-insensitive comparison
  const normalizedRole = role.toLowerCase();
  
  // Check if the normalized role exists in the predefined ROLES object
  return Object.values(ROLES).some(
    validRole => validRole.toLowerCase() === normalizedRole
  );
};