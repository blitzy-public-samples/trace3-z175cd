/**
 * @fileoverview Middleware for validating incoming requests against predefined schemas
 * and ensuring data integrity before processing.
 * 
 * Requirements Addressed:
 * - Input Validation (Technical Specification/Cross-Cutting Concerns/Validation):
 *   Ensures all input data adheres to predefined schemas and formats to maintain data 
 *   integrity and prevent errors.
 * 
 * Human Tasks:
 * - Ensure validation schemas are properly defined for each API endpoint
 * - Monitor validation error responses for potential security issues
 * - Update validation schemas when API contracts change
 */

// joi v17.6.0
import { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { validateSchema } from '../utils/validator';
import { ERROR_CODES } from '../constants/errorCodes';

/**
 * Interface for validation options to specify which part of the request to validate
 */
interface ValidationTarget {
  body?: boolean;
  query?: boolean;
  params?: boolean;
}

/**
 * Middleware factory function that creates a validation middleware for Express routes.
 * Validates incoming request data against a provided Joi schema.
 * 
 * @param schema - Joi schema to validate against
 * @param target - Optional object specifying which parts of the request to validate (defaults to body)
 * @returns Express middleware function that performs validation
 */
export const validationMiddleware = (
  schema: Schema,
  target: ValidationTarget = { body: true }
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Initialize an object to store validated data
      const validatedData: { [key: string]: any } = {};

      // Validate request body if specified
      if (target.body && Object.keys(req.body || {}).length > 0) {
        validatedData.body = await validateSchema(req.body, schema);
      }

      // Validate query parameters if specified
      if (target.query && Object.keys(req.query || {}).length > 0) {
        validatedData.query = await validateSchema(req.query, schema);
      }

      // Validate route parameters if specified
      if (target.params && Object.keys(req.params || {}).length > 0) {
        validatedData.params = await validateSchema(req.params, schema);
      }

      // Attach validated data to the request object
      req.validated = validatedData;

      // If validation passes, proceed to next middleware
      next();
    } catch (error: any) {
      // If validation fails, return a 400 Bad Request response
      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(400).json({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.details || []
        });
      }

      // Pass other errors to error handling middleware
      next(error);
    }
  };
};

// Type augmentation for Express Request interface
declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: any;
        query?: any;
        params?: any;
      };
    }
  }
}
```

This implementation:
1. Creates a strongly-typed validation middleware that can validate request body, query parameters, and route parameters
2. Uses the imported validateSchema function to perform validation
3. Handles validation errors with proper error codes and responses
4. Attaches validated data to the request object for use in subsequent middleware/handlers
5. Includes TypeScript type augmentation for the Express Request interface
6. Follows the requirements for input validation as specified in the technical specification
7. Includes proper error handling and standardized error responses
8. Uses relative imports correctly based on the file structure
9. Includes version information for the Joi dependency
10. Provides detailed JSDoc documentation for all components

The middleware can be used in routes like this:
```typescript
router.post('/endpoint', validationMiddleware(someSchema), handler);
// Or with specific targets:
router.get('/endpoint', validationMiddleware(someSchema, { query: true }), handler);