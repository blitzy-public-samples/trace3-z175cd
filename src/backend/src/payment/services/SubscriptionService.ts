/**
 * @fileoverview Implements the SubscriptionService for managing subscription-related operations.
 * 
 * Requirements Addressed:
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of user subscriptions, including creation, updates, and validation.
 * 
 * Human Tasks:
 * - Ensure database schema matches the Subscription model properties
 * - Configure proper indexing for subscription queries
 * - Set up monitoring for subscription status changes
 * - Configure payment gateway webhooks for subscription status updates
 */

// pg v8.11.0
import { Client } from 'pg';
import { Subscription } from '../models/Subscription';
import { SubscriptionTier } from '../models/SubscriptionTier';
import { PaymentService } from './PaymentService';
import { logInfo } from '../../common/utils/logger';
import { validateSchema } from '../../common/utils/validator';
import { initializeDatabase } from '../../common/config/database';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Service class for managing subscription-related operations
 */
export class SubscriptionService {
  private dbClient: Client;
  private paymentService: PaymentService;

  /**
   * Initializes the SubscriptionService with required dependencies
   */
  constructor() {
    this.dbClient = initializeDatabase();
    this.paymentService = new PaymentService();
  }

  /**
   * Creates a new subscription for a user
   * 
   * @param subscriptionData - Object containing subscription details
   * @returns boolean indicating if subscription was successfully created
   */
  async createSubscription(subscriptionData: {
    userId: string;
    tierId: string;
    customerId: string;
    paymentMethodId?: string;
    metadata?: Record<string, string>;
  }): Promise<boolean> {
    try {
      // Validate subscription data
      this.validateSubscription(subscriptionData);

      // Retrieve subscription tier details
      const tierResult = await this.dbClient.query(
        'SELECT price, currency FROM subscription_tiers WHERE id = $1',
        [subscriptionData.tierId]
      );

      if (!tierResult.rows.length) {
        throw new Error('Invalid subscription tier');
      }

      const tier = tierResult.rows[0];

      // Process payment for subscription
      const paymentSuccess = await this.paymentService.processPayment({
        amount: tier.price,
        currency: tier.currency,
        customerId: subscriptionData.customerId,
        paymentMethodId: subscriptionData.paymentMethodId,
        description: `Subscription payment for tier ${subscriptionData.tierId}`,
        metadata: {
          ...subscriptionData.metadata,
          userId: subscriptionData.userId,
          tierId: subscriptionData.tierId
        }
      });

      if (!paymentSuccess) {
        throw new Error('Payment processing failed');
      }

      // Create subscription record
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Default to 1-month subscription

      const subscription = new Subscription(
        crypto.randomUUID(),
        subscriptionData.userId,
        subscriptionData.tierId,
        startDate,
        endDate,
        'active'
      );

      // Save subscription to database
      await this.dbClient.query(
        'INSERT INTO subscriptions (id, user_id, tier_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          subscription.id,
          subscription.userId,
          subscription.tierId,
          subscription.startDate,
          subscription.endDate,
          subscription.status
        ]
      );

      logInfo(`Subscription created successfully: ${subscription.id}`);
      return true;
    } catch (error: any) {
      logInfo(`Failed to create subscription: ${error.message}`);
      return false;
    }
  }

  /**
   * Updates an existing subscription's details
   * 
   * @param subscriptionId - ID of the subscription to update
   * @param updateData - Object containing update details
   * @returns boolean indicating if subscription was successfully updated
   */
  async updateSubscription(
    subscriptionId: string,
    updateData: {
      status?: string;
      endDate?: Date;
      metadata?: Record<string, string>;
    }
  ): Promise<boolean> {
    try {
      // Validate update data
      this.validateSubscription(updateData);

      // Retrieve existing subscription
      const subscriptionResult = await this.dbClient.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [subscriptionId]
      );

      if (!subscriptionResult.rows.length) {
        throw new Error('Subscription not found');
      }

      const subscription = subscriptionResult.rows[0];

      // Update subscription properties
      const updatedStatus = updateData.status || subscription.status;
      const updatedEndDate = updateData.endDate || subscription.end_date;

      // Save updated subscription to database
      await this.dbClient.query(
        'UPDATE subscriptions SET status = $1, end_date = $2, updated_at = NOW() WHERE id = $3',
        [updatedStatus, updatedEndDate, subscriptionId]
      );

      logInfo(`Subscription updated successfully: ${subscriptionId}`);
      return true;
    } catch (error: any) {
      logInfo(`Failed to update subscription: ${error.message}`);
      return false;
    }
  }

  /**
   * Validates subscription data against defined rules
   * 
   * @param subscriptionData - The subscription data to validate
   * @returns boolean indicating if data is valid
   */
  validateSubscription(subscriptionData: any): boolean {
    try {
      const subscriptionSchema = {
        userId: {
          type: 'string',
          required: true,
          format: 'uuid'
        },
        tierId: {
          type: 'string',
          required: true,
          format: 'uuid'
        },
        status: {
          type: 'string',
          enum: ['active', 'cancelled', 'expired', 'pending']
        },
        startDate: {
          type: 'date'
        },
        endDate: {
          type: 'date'
        }
      };

      validateSchema(subscriptionData, subscriptionSchema);
      return true;
    } catch (error: any) {
      const validationError = new Error('Subscription validation failed');
      (validationError as any).code = ERROR_CODES.VALIDATION_ERROR;
      (validationError as any).details = error.message;
      throw validationError;
    }
  }
}