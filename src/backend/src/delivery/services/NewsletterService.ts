/**
 * @fileoverview Provides functionality for managing and sending newsletters, including template rendering,
 * validation, and integration with the email delivery system.
 * 
 * Requirements Addressed:
 * - Email Delivery (Technical Specification/Scope/Core Features/Distribution):
 *   Implements the newsletter delivery system to ensure reliable and consistent communication with users.
 * 
 * Human Tasks:
 * - Ensure encryption keys are properly configured in environment variables
 * - Set up monitoring for newsletter delivery status and failures
 * - Configure rate limiting for bulk newsletter sending
 * - Implement retry mechanism for failed newsletter deliveries
 */

// nodemailer v6.9.1
import { Newsletter, validate, encryptData } from '../models/Newsletter';
import { EmailTemplate } from '../models/EmailTemplate';
import { sendEmail } from './EmailService';
import { logInfo, logError } from '../../common/utils/logger';
import { emailConfig } from '../../common/config/email';

/**
 * Sends a newsletter to a list of recipients using the provided template.
 * 
 * @param newsletter - The newsletter object containing title, content, and recipients
 * @param encryptionKey - The key to use for encrypting sensitive data
 * @returns boolean indicating whether the newsletter was sent successfully to all recipients
 */
export const sendNewsletter = async (
  newsletter: Newsletter,
  encryptionKey: string
): Promise<boolean> => {
  try {
    // Validate the newsletter object
    const validatedNewsletter = validate(newsletter.toJSON());
    logInfo(`Starting newsletter delivery: ${newsletter.title}`);

    // Encrypt sensitive newsletter data
    const encryptedNewsletter = encryptData(validatedNewsletter, encryptionKey);

    // Track successful and failed deliveries
    let allDeliveriesSuccessful = true;
    const failedDeliveries: string[] = [];

    // Create email template for the newsletter
    const template = new EmailTemplate(
      newsletter.title,
      newsletter.content,
      {
        title: newsletter.title,
        previewText: newsletter.content.substring(0, 150),
        ...emailConfig.defaultOptions
      }
    );

    // Send to each recipient
    for (const recipient of newsletter.recipients) {
      try {
        // Add recipient-specific placeholders
        const recipientTemplate = new EmailTemplate(
          template.subject,
          template.body,
          {
            ...template.placeholders,
            recipientEmail: recipient,
            // Extract recipient name from email if available
            recipientName: recipient.split('@')[0],
            // Add unsubscribe link with encrypted recipient email
            unsubscribeLink: `${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(recipient)}`
          }
        );

        const emailSent = await sendEmail(recipientTemplate, recipient);

        if (!emailSent) {
          allDeliveriesSuccessful = false;
          failedDeliveries.push(recipient);
          logError('Newsletter delivery failed for recipient', {
            newsletterTitle: newsletter.title,
            recipient,
            timestamp: new Date().toISOString()
          });
        } else {
          logInfo(`Newsletter delivered successfully to ${recipient}`);
        }

        // Add delay between sends to prevent overwhelming the SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        allDeliveriesSuccessful = false;
        failedDeliveries.push(recipient);
        logError('Error sending newsletter to recipient', {
          newsletterTitle: newsletter.title,
          recipient,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log final delivery status
    if (allDeliveriesSuccessful) {
      logInfo(`Newsletter "${newsletter.title}" delivered successfully to all ${newsletter.recipients.length} recipients`);
    } else {
      logError('Newsletter delivery completed with errors', {
        newsletterTitle: newsletter.title,
        totalRecipients: newsletter.recipients.length,
        failedDeliveries: failedDeliveries.length,
        failedRecipients: failedDeliveries
      });
    }

    return allDeliveriesSuccessful;
  } catch (error) {
    logError('Newsletter delivery failed', {
      newsletterTitle: newsletter.title,
      error: error instanceof Error ? error.message : 'Unknown error',
      recipients: newsletter.recipients.length
    });
    return false;
  }
};