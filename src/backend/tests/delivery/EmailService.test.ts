/**
 * @fileoverview Unit tests for the EmailService module, ensuring its functionality for sending emails,
 * template validation, and error handling.
 * 
 * Requirements Addressed:
 * - Testing Email Delivery (Technical Specification/Development & Deployment/Testing):
 *   Validates the functionality of the EmailService, including email sending, template validation,
 *   and error handling.
 * 
 * Human Tasks:
 * - Ensure SMTP server is accessible in test environment
 * - Configure test email credentials in environment variables
 * - Set up test email templates for validation
 */

// jest v29.0.0
import { jest } from '@jest/globals';
// faker v5.5.3
import faker from 'faker';
import { sendEmail } from '../../src/delivery/services/EmailService';
import { EmailTemplate } from '../../src/delivery/models/EmailTemplate';
import { generateMockData } from '../utils/testHelpers';
import { initializeTestEnvironment } from '../setup';
import { logError } from '../../src/common/utils/logger';

// Mock the logger to prevent actual logging during tests
jest.mock('../../src/common/utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn()
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    })
  })
}));

describe('EmailService Tests', () => {
  beforeAll(async () => {
    await initializeTestEnvironment();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testSendEmail', () => {
    it('should successfully send an email with valid template and recipient', async () => {
      // Generate mock data for email template
      const mockRecipient = faker.internet.email();
      const mockTemplate = new EmailTemplate(
        faker.lorem.sentence(),
        faker.lorem.paragraphs(2),
        {
          recipientName: faker.name.findName(),
          unsubscribeLink: faker.internet.url()
        }
      );

      // Send email using the service
      const result = await sendEmail(mockTemplate, mockRecipient);

      // Assert successful email sending
      expect(result).toBe(true);
      expect(logError).not.toHaveBeenCalled();
    });

    it('should handle email sending with placeholders correctly', async () => {
      // Generate mock data with placeholders
      const mockRecipient = faker.internet.email();
      const recipientName = faker.name.findName();
      const mockTemplate = new EmailTemplate(
        'Hello {{recipientName}}',
        'Dear {{recipientName}}, {{content}}',
        {
          recipientName,
          content: faker.lorem.paragraph()
        }
      );

      // Send email using the service
      const result = await sendEmail(mockTemplate, mockRecipient);

      // Assert successful email sending with placeholder replacement
      expect(result).toBe(true);
      expect(logError).not.toHaveBeenCalled();
    });
  });

  describe('testEmailTemplateValidation', () => {
    it('should validate a valid email template successfully', () => {
      // Create a valid template
      const validTemplate = new EmailTemplate(
        faker.lorem.sentence(),
        faker.lorem.paragraphs(2),
        {
          recipientName: faker.name.findName(),
          unsubscribeLink: faker.internet.url()
        }
      );

      // Assert no errors are thrown during validation
      expect(() => {
        sendEmail(validTemplate, faker.internet.email());
      }).not.toThrow();
    });

    it('should reject an invalid email template', async () => {
      // Create an invalid template with missing required fields
      const invalidTemplate = new EmailTemplate(
        '', // Invalid empty subject
        faker.lorem.paragraphs(2),
        {}
      );

      // Send email using the service
      const result = await sendEmail(invalidTemplate, faker.internet.email());

      // Assert email sending failed and error was logged
      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        'Failed to send email',
        expect.objectContaining({
          error: 'Invalid email template provided'
        })
      );
    });
  });

  describe('testErrorHandling', () => {
    it('should handle SMTP connection errors gracefully', async () => {
      // Mock nodemailer to simulate SMTP error
      const mockError = new Error('SMTP connection failed');
      jest.mock('nodemailer', () => ({
        createTransport: jest.fn().mockReturnValue({
          sendMail: jest.fn().mockRejectedValue(mockError)
        })
      }));

      // Generate mock data
      const mockTemplate = new EmailTemplate(
        faker.lorem.sentence(),
        faker.lorem.paragraphs(2),
        {
          recipientName: faker.name.findName()
        }
      );

      // Attempt to send email
      const result = await sendEmail(mockTemplate, faker.internet.email());

      // Assert error handling
      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        'Failed to send email',
        expect.objectContaining({
          error: mockError.message
        })
      );
    });

    it('should handle invalid recipient email addresses', async () => {
      // Generate mock data with invalid email
      const mockTemplate = new EmailTemplate(
        faker.lorem.sentence(),
        faker.lorem.paragraphs(2),
        {
          recipientName: faker.name.findName()
        }
      );

      // Attempt to send email with invalid recipient
      const result = await sendEmail(mockTemplate, 'invalid-email');

      // Assert error handling
      expect(result).toBe(false);
      expect(logError).toHaveBeenCalled();
    });
  });
});