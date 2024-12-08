/**
 * @fileoverview Provides the configuration setup for email delivery, including SMTP settings,
 * authentication, and default options for sending emails.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the email delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Configure SMTP server settings in environment variables for production deployment
 * - Set up email authentication credentials securely in production environment
 * - Verify SMTP server whitelist/security settings for the application's sending domain
 * - Set up email monitoring and delivery status tracking
 */

// nodemailer v6.9.1
import * as nodemailer from 'nodemailer';
import { ERROR_CODES } from '../constants/errorCodes';
import { logError, logInfo } from '../utils/logger';

/**
 * Email configuration object containing SMTP settings and default options
 */
export const emailConfig = {
  // SMTP server host configuration
  host: process.env.SMTP_HOST || 'smtp.example.com',
  
  // SMTP server port (587 for TLS, 465 for SSL)
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  
  // Whether to use SSL/TLS (true for port 465, false for other ports)
  secure: process.env.SMTP_SECURE === 'true' ? true : false,
  
  // Authentication credentials
  auth: {
    user: process.env.SMTP_USER || 'example@example.com',
    pass: process.env.SMTP_PASSWORD || 'password'
  },
  
  // Default options for all emails
  defaultOptions: {
    from: process.env.EMAIL_FROM || 'no-reply@example.com'
  }
};

/**
 * Initializes and validates the email configuration settings.
 * Verifies that all required SMTP settings are present and attempts
 * to establish a connection with the SMTP server.
 * 
 * @throws {Error} If email configuration validation fails or SMTP connection cannot be established
 */
export const initializeEmailConfig = async (): Promise<void> => {
  try {
    // Validate required configuration fields
    if (!emailConfig.host) {
      throw new Error('SMTP host is required');
    }
    
    if (!emailConfig.port || isNaN(emailConfig.port)) {
      throw new Error('Valid SMTP port is required');
    }
    
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error('SMTP authentication credentials are required');
    }
    
    if (!emailConfig.defaultOptions.from) {
      throw new Error('Default sender email address is required');
    }

    // Create a test transporter to verify configuration
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });

    // Verify SMTP connection configuration
    await transporter.verify();

    logInfo('Email configuration initialized successfully');
  } catch (error) {
    const errorDetails = {
      code: ERROR_CODES.EMAIL_DELIVERY_FAILED,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user,
        // Exclude password from logs for security
      }
    };

    logError('Failed to initialize email configuration', errorDetails);
    throw new Error(`Email configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};