/**
 * @fileoverview Defines the structure and validation logic for email templates used in the email delivery system.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the email delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Ensure email template placeholders are documented for content creators
 * - Configure encryption keys in secure environment variables
 * - Set up monitoring for email template validation failures
 */

// joi v17.6.0
import Joi from 'joi';
import { encrypt } from '../../common/utils/encryption';
import { validateSchema } from '../../common/utils/validator';
import { emailConfig } from '../../common/config/email';

/**
 * Schema for validating email template placeholders
 */
const placeholderSchema = Joi.object({
  // Common placeholders for personalization
  recipientName: Joi.string().optional(),
  recipientEmail: Joi.string().email().optional(),
  unsubscribeLink: Joi.string().uri().optional(),
  // Content placeholders
  title: Joi.string().optional(),
  previewText: Joi.string().max(150).optional(),
  // Custom placeholders as key-value pairs
  custom: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(Joi.string(), Joi.number())
  ).optional()
}).required();

/**
 * Schema for validating email templates
 */
const emailTemplateSchema = Joi.object({
  subject: Joi.string()
    .required()
    .min(1)
    .max(150)
    .description('Email subject line'),
  
  body: Joi.string()
    .required()
    .min(1)
    .description('Email body content in HTML format'),
  
  placeholders: placeholderSchema
    .description('Dynamic placeholders for template personalization')
}).required();

/**
 * Represents an email template with fields for subject, body, and placeholders.
 */
export class EmailTemplate {
  public subject: string;
  public body: string;
  public placeholders: Record<string, any>;

  /**
   * Creates a new EmailTemplate instance.
   * 
   * @param subject - The email subject line
   * @param body - The email body content in HTML format
   * @param placeholders - Dynamic placeholders for template personalization
   */
  constructor(
    subject: string,
    body: string,
    placeholders: Record<string, any>
  ) {
    this.subject = subject;
    this.body = body;
    this.placeholders = placeholders;

    // Apply default options from email config
    if (emailConfig.defaultOptions) {
      this.placeholders = {
        ...emailConfig.defaultOptions,
        ...this.placeholders
      };
    }
  }

  /**
   * Converts the EmailTemplate instance to a JSON object.
   * 
   * @returns The JSON representation of the email template
   */
  toJSON(): Record<string, any> {
    return {
      subject: this.subject,
      body: this.body,
      placeholders: this.placeholders
    };
  }
}

/**
 * Validates an email template object against the predefined schema.
 * 
 * @param template - The template object to validate
 * @returns The validated template object
 * @throws Error if validation fails
 */
export const validateEmailTemplate = (template: Record<string, any>): Record<string, any> => {
  return validateSchema(template, emailTemplateSchema);
};

/**
 * Encrypts sensitive fields within an email template.
 * 
 * @param template - The template object to encrypt
 * @param encryptionKey - The key to use for encryption
 * @returns The template with encrypted sensitive fields
 */
export const encryptEmailTemplate = (
  template: Record<string, any>,
  encryptionKey: string
): Record<string, any> => {
  const encryptedTemplate = { ...template };

  // Encrypt sensitive placeholder data if present
  if (template.placeholders) {
    if (template.placeholders.recipientEmail) {
      const encrypted = encrypt(template.placeholders.recipientEmail, encryptionKey);
      encryptedTemplate.placeholders.recipientEmail = encrypted.encryptedData;
      encryptedTemplate.placeholders.emailIv = encrypted.iv;
      encryptedTemplate.placeholders.emailAuthTag = encrypted.authTag;
    }

    if (template.placeholders.custom) {
      const encryptedCustom = {};
      for (const [key, value] of Object.entries(template.placeholders.custom)) {
        if (typeof value === 'string' && value.length > 0) {
          const encrypted = encrypt(value as string, encryptionKey);
          encryptedCustom[key] = {
            data: encrypted.encryptedData,
            iv: encrypted.iv,
            authTag: encrypted.authTag
          };
        } else {
          encryptedCustom[key] = value;
        }
      }
      encryptedTemplate.placeholders.custom = encryptedCustom;
    }
  }

  return encryptedTemplate;
};