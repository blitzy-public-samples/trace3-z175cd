/**
 * @fileoverview Implements the StripeService for handling Stripe API interactions.
 * 
 * Requirements Addressed:
 * - Payment Processing (Technical Specification/Subscription System/Payment processing):
 *   Handles integration with Stripe for payment intents, subscriptions, and refunds.
 * 
 * Human Tasks:
 * - Configure Stripe API keys in environment variables
 * - Set up Stripe webhook endpoints for real-time payment status updates
 * - Configure Stripe test mode for development/staging environments
 * - Set up proper error monitoring for payment processing failures
 */

// stripe v10.0.0
import Stripe from 'stripe';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { SubscriptionTier } from '../models/SubscriptionTier';
import { logError } from '../../common/utils/logger';

/**
 * Service class for handling Stripe payment processing operations
 */
export class StripeService {
  private stripe: Stripe;

  /**
   * Initializes the StripeService with the Stripe API key
   * 
   * @param apiKey - The Stripe secret API key
   */
  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2022-11-15', // Lock API version for stability
      typescript: true,
      maxNetworkRetries: 3, // Enable automatic retries
    });
  }

  /**
   * Creates a payment intent using the Stripe API
   * 
   * @param paymentData - Object containing payment details
   * @returns The created payment intent object from Stripe
   */
  async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    try {
      // Validate required payment data
      if (!paymentData.amount || !paymentData.currency) {
        throw new Error('Amount and currency are required for payment intent');
      }

      // Configure payment intent options
      const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirm: false,
        metadata: {
          ...paymentData.metadata,
          environment: process.env.NODE_ENV || 'development'
        }
      };

      // Add optional parameters if provided
      if (paymentData.customerId) {
        paymentIntentOptions.customer = paymentData.customerId;
      }
      if (paymentData.paymentMethodId) {
        paymentIntentOptions.payment_method = paymentData.paymentMethodId;
      }
      if (paymentData.description) {
        paymentIntentOptions.description = paymentData.description;
      }

      // Create the payment intent
      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentOptions);

      return paymentIntent;
    } catch (error: any) {
      logError('Failed to create payment intent', {
        error: error.message,
        stack: error.stack,
        paymentData
      });
      throw error;
    }
  }

  /**
   * Creates a subscription using the Stripe API
   * 
   * @param subscriptionData - Object containing subscription details
   * @returns The created subscription object from Stripe
   */
  async createSubscription(subscriptionData: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    trialDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      // Validate required subscription data
      if (!subscriptionData.customerId || !subscriptionData.priceId) {
        throw new Error('Customer ID and price ID are required for subscription');
      }

      // Configure subscription options
      const subscriptionOptions: Stripe.SubscriptionCreateParams = {
        customer: subscriptionData.customerId,
        items: [{
          price: subscriptionData.priceId
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card']
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          ...subscriptionData.metadata,
          environment: process.env.NODE_ENV || 'development'
        }
      };

      // Add optional parameters if provided
      if (subscriptionData.paymentMethodId) {
        subscriptionOptions.default_payment_method = subscriptionData.paymentMethodId;
      }
      if (subscriptionData.trialDays) {
        subscriptionOptions.trial_period_days = subscriptionData.trialDays;
      }

      // Create the subscription
      const subscription = await this.stripe.subscriptions.create(subscriptionOptions);

      return subscription;
    } catch (error: any) {
      logError('Failed to create subscription', {
        error: error.message,
        stack: error.stack,
        subscriptionData
      });
      throw error;
    }
  }

  /**
   * Processes a refund for a payment using the Stripe API
   * 
   * @param paymentId - The ID of the payment to refund
   * @returns True if the refund was successfully processed, otherwise false
   */
  async refundPayment(paymentId: string): Promise<boolean> {
    try {
      // Validate payment ID
      if (!paymentId) {
        throw new Error('Payment ID is required for refund');
      }

      // Process the refund
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        reason: 'requested_by_customer',
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          refundedAt: new Date().toISOString()
        }
      });

      // Check refund status
      return refund.status === 'succeeded';
    } catch (error: any) {
      logError('Failed to process refund', {
        error: error.message,
        stack: error.stack,
        paymentId
      });
      return false;
    }
  }
}