/**
 * @fileoverview Defines the structure and validation logic for newsletters, including methods for validation 
 * and encryption of sensitive data.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the newsletter delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Ensure encryption keys are properly configured in environment variables
 * - Set up monitoring for newsletter validation failures
 * - Document newsletter template guidelines for content creators
 */

// joi v17.6.0
import Joi from 'joi';
import { 
  EmailTemplate, 
  validateEmailTemplate, 
  encryptEmailTemplate 
} from './EmailTemplate';

/**
 * Schema for validating newsletter data
 */
const newsletterSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(1)
    .max(200)
    .description('Newsletter title'),

  content: Joi.string()
    .required()
    .min(1)
    .description('Newsletter content in HTML format'),

  recipients: Joi.array()
    .items(Joi.string().email())
    .required()
    .min(1)
    .description('List of recipient email addresses'),

  template: Joi.object()
    .required()
    .description('Associated email template')
}).required();

/**
 * Represents a newsletter with fields for title, content, and recipients.
 */
export class Newsletter {
  public title: string;
  public content: string;
  public recipients: string[];

  /**
   * Creates a new Newsletter instance.
   * 
   * @param title - The newsletter title
   * @param content - The newsletter content
   * @param recipients - Array of recipient email addresses
   */
  constructor(
    title: string,
    content: string,
    recipients: string[]
  ) {
    this.title = title;
    this.content = content;
    this.recipients = recipients;
  }

  /**
   * Converts the Newsletter instance to a JSON object.
   * 
   * @returns The JSON representation of the newsletter
   */
  toJSON(): Record<string, any> {
    return {
      title: this.title,
      content: this.content,
      recipients: this.recipients
    };
  }
}

/**
 * Validates a newsletter object against the predefined schema.
 * 
 * @param newsletter - The newsletter object to validate
 * @returns The validated newsletter object
 * @throws Error if validation fails
 */
export const validate = (newsletter: Record<string, any>): Record<string, any> => {
  // First validate the newsletter structure
  const validatedNewsletter = newsletterSchema.validate(newsletter, {
    abortEarly: false,
    stripUnknown: true
  });

  if (validatedNewsletter.error) {
    throw validatedNewsletter.error;
  }

  // Then validate the associated email template if present
  if (newsletter.template) {
    validateEmailTemplate(newsletter.template);
  }

  return validatedNewsletter.value;
};

/**
 * Encrypts sensitive fields within a newsletter.
 * 
 * @param newsletter - The newsletter object to encrypt
 * @param encryptionKey - The key to use for encryption
 * @returns The newsletter with encrypted sensitive fields
 */
export const encryptData = (
  newsletter: Record<string, any>,
  encryptionKey: string
): Record<string, any> => {
  const encryptedNewsletter = { ...newsletter };

  // Encrypt the email template if present
  if (newsletter.template) {
    encryptedNewsletter.template = encryptEmailTemplate(
      newsletter.template,
      encryptionKey
    );
  }

  // Note: Recipients are encrypted at the template level within encryptEmailTemplate
  // to ensure consistent encryption across all email-related functionality

  return encryptedNewsletter;
};