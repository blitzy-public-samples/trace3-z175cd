/**
 * @fileoverview Controller for handling email-related operations, such as sending emails using predefined templates
 * and managing email-related requests.
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

// express v4.18.2
import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../services/EmailService';
import { EmailTemplate, validateEmailTemplate } from '../models/EmailTemplate';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { logInfo, logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// Joi schema for email request validation
import Joi from 'joi';

/**
 * Schema for validating email sending requests
 */
const emailRequestSchema = Joi.object({
  subject: Joi.string()
    .required()
    .min(1)
    .max(150)
    .description('Email subject line'),
  
  body: Joi.string()
    .required()
    .min(1)
    .description('Email body content in HTML format'),
  
  recipient: Joi.string()
    .required()
    .email()
    .description('Recipient email address'),
  
  placeholders: Joi.object()
    .optional()
    .description('Dynamic placeholders for template personalization')
}).required();

/**
 * Handles the HTTP request for sending an email using a predefined template.
 * 
 * @param req - Express request object containing email template and recipient details
 * @param res - Express response object
 * @param next - Express next function
 */
export const sendEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log the start of email sending process
    logInfo(`Starting email sending process for request: ${req.id}`);

    // Validate request body using the validation middleware
    const validatedData = await validateEmailTemplate(req.body);

    // Create email template instance
    const emailTemplate = new EmailTemplate(
      validatedData.subject,
      validatedData.body,
      validatedData.placeholders || {}
    );

    // Send email using the email service
    const emailSent = await sendEmail(
      emailTemplate,
      req.body.recipient
    );

    if (emailSent) {
      // Log successful email sending
      logInfo(`Email sent successfully to ${req.body.recipient}`);

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        details: {
          recipient: req.body.recipient,
          subject: emailTemplate.subject,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Log email sending failure
      const errorDetails = {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        recipient: req.body.recipient,
        subject: emailTemplate.subject,
        timestamp: new Date().toISOString()
      };

      logError('Failed to send email', errorDetails);

      // Pass error to error handler middleware
      next(new Error('Failed to send email'));
    }
  } catch (error) {
    // Prepare error details for logging
    const errorDetails = {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.id,
      recipient: req.body?.recipient
    };

    // Log the error
    logError('Error in email sending handler', errorDetails);

    // Pass error to error handler middleware
    next(error);
  }
};

// Apply validation middleware to the email sending handler
export const validateEmailRequest = validationMiddleware(emailRequestSchema);