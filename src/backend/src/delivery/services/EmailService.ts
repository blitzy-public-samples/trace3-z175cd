/**
 * @fileoverview Provides functionality for sending emails, including template rendering, validation,
 * and integration with the email configuration and SMTP services.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the email delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Ensure SMTP server is properly configured and accessible
 * - Set up email bounce handling and monitoring
 * - Configure email sending rate limits according to SMTP provider requirements
 * - Set up email template testing and preview system
 */

// nodemailer v6.9.1
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../../common/config/email';
import { logInfo, logError } from '../../common/utils/logger';
import { EmailTemplate } from '../models/EmailTemplate';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Sends an email using the provided template and recipient details.
 * 
 * @param template - The email template containing subject, body, and placeholders
 * @param recipient - The recipient's email address
 * @returns boolean indicating whether the email was sent successfully
 */
export const sendEmail = async (
  template: EmailTemplate,
  recipient: string
): Promise<boolean> => {
  try {
    // Log the start of email sending process
    logInfo(`Starting email delivery to ${recipient}`);

    // Validate the email template
    if (!template || !template.subject || !template.body) {
      throw new Error('Invalid email template provided');
    }

    // Create nodemailer transport with SMTP configuration
    const transport = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.port === 465, // true for port 465, false for other ports
      auth: emailConfig.auth
    });

    // Render email template by replacing placeholders
    let renderedBody = template.body;
    let renderedSubject = template.subject;

    if (template.placeholders) {
      Object.entries(template.placeholders).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        renderedBody = renderedBody.replace(placeholder, String(value));
        renderedSubject = renderedSubject.replace(placeholder, String(value));
      });
    }

    // Prepare email options
    const mailOptions = {
      from: emailConfig.defaultOptions.from,
      to: recipient,
      subject: renderedSubject,
      html: renderedBody,
      // Add default headers for tracking and authentication
      headers: {
        'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        'List-Unsubscribe': template.placeholders?.unsubscribeLink || ''
      }
    };

    // Send the email
    const result = await transport.sendMail(mailOptions);

    // Log successful delivery
    logInfo(`Email sent successfully to ${recipient}. Message ID: ${result.messageId}`);

    return true;
  } catch (error) {
    // Prepare error details for logging
    const errorDetails = {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      recipient,
      templateSubject: template?.subject,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };

    // Log the error
    logError('Failed to send email', errorDetails);

    return false;
  }
};