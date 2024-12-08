/**
 * @fileoverview Provides services for managing and processing email templates, including validation,
 * encryption, and rendering.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the email delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Ensure encryption keys are properly configured in environment variables
 * - Set up monitoring for template validation and rendering errors
 * - Document template placeholder patterns for content creators
 */

// joi v17.6.0
import Joi from 'joi';
import { EmailTemplate, validateEmailTemplate as validate, encryptEmailTemplate as encryptData } from '../models/EmailTemplate';
import { logger } from '../../common/utils/logger';
import { emailConfig } from '../../common/config/email';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Schema for validating template data during rendering
 */
const templateDataSchema = Joi.object({
  recipientName: Joi.string().optional(),
  recipientEmail: Joi.string().email().optional(),
  custom: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.string(), Joi.number())
  ).optional()
}).required();

/**
 * Validates an email template object against a predefined schema.
 * 
 * @param template - The template object to validate
 * @returns The validated email template object
 * @throws Error if validation fails
 */
export const validateTemplate = (template: Record<string, any>): Record<string, any> => {
  try {
    logger.logInfo('Validating email template');
    const validatedTemplate = validate(template);
    logger.logInfo('Email template validation successful');
    return validatedTemplate;
  } catch (error) {
    logger.logError('Email template validation failed', {
      code: ERROR_CODES.VALIDATION_ERROR,
      template: template,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Encrypts sensitive fields within an email template.
 * 
 * @param template - The template object to encrypt
 * @param encryptionKey - The key to use for encryption
 * @returns The email template with encrypted sensitive fields
 */
export const encryptTemplate = (
  template: Record<string, any>,
  encryptionKey: string
): Record<string, any> => {
  try {
    logger.logInfo('Encrypting sensitive template fields');
    const encryptedTemplate = encryptData(template, encryptionKey);
    logger.logInfo('Template encryption successful');
    return encryptedTemplate;
  } catch (error) {
    logger.logError('Template encryption failed', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Renders an email template with provided data.
 * 
 * @param template - The template object to render
 * @param data - The data to use for rendering placeholders
 * @returns The rendered email content as a string
 */
export const renderTemplate = (
  template: Record<string, any>,
  data: Record<string, any>
): string => {
  try {
    // Validate the input data against schema
    const validatedData = Joi.attempt(data, templateDataSchema);

    // Merge default options with provided data
    const renderData = {
      ...emailConfig.defaultOptions,
      ...validatedData
    };

    logger.logInfo('Rendering email template');

    let renderedContent = template.body;

    // Replace placeholders in the template body
    Object.entries(renderData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      renderedContent = renderedContent.replace(placeholder, String(value));
    });

    // Handle custom placeholders if present
    if (renderData.custom) {
      Object.entries(renderData.custom).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{custom.${key}}}`, 'g');
        renderedContent = renderedContent.replace(placeholder, String(value));
      });
    }

    logger.logInfo('Template rendering successful');
    return renderedContent;
  } catch (error) {
    logger.logError('Template rendering failed', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      template: template,
      data: data,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};