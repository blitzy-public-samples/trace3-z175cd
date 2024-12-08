/**
 * @fileoverview Implements the PaymentService for managing payment-related operations.
 * 
 * Requirements Addressed:
 * - Payment Processing (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of payment transactions, including processing payments,
 *   refunds, and integration with Stripe.
 * 
 * Human Tasks:
 * - Configure Stripe API keys in environment variables
 * - Set up payment webhook endpoints for real-time status updates
 * - Configure payment failure alerts and monitoring
 * - Implement proper error tracking for payment processing
 */

// stripe v10.0.0
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { SubscriptionTier } from '../models/SubscriptionTier';
import { StripeService } from './StripeService';
import { logError, logInfo } from '../../common/utils/logger';

/**
 * Service class for managing payment-related operations
 */
export class PaymentService {
  private stripeService: StripeService;

  /**
   * Initializes the PaymentService with required dependencies
   */
  constructor() {
    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeApiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    this.stripeService = new StripeService(stripeApiKey);
  }

  /**
   * Processes a payment transaction using the Stripe API
   * 
   * @param paymentData - Object containing payment details
   * @returns boolean indicating if payment was successfully processed
   */
  async processPayment(paymentData: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<boolean> {
    try {
      // Validate payment data
      if (!paymentData.amount || !paymentData.currency) {
        throw new Error('Amount and currency are required for payment processing');
      }

      // Create payment intent through Stripe
      const paymentIntent = await this.stripeService.createPaymentIntent({
        amount: paymentData.amount,
        currency: paymentData.currency,
        customerId: paymentData.customerId,
        paymentMethodId: paymentData.paymentMethodId,
        description: paymentData.description,
        metadata: paymentData.metadata
      });

      // Create payment record
      const payment = new Payment(
        paymentIntent.id,
        '', // subscriptionId will be set if this is a subscription payment
        paymentData.amount,
        paymentData.currency,
        paymentIntent.status,
        new Date()
      );

      // Process the payment
      const success = await payment.processPayment({
        paymentMethodId: paymentData.paymentMethodId || '',
        customerId: paymentData.customerId || '',
        description: paymentData.description
      });

      if (success) {
        logInfo(`Payment processed successfully: ${paymentIntent.id}`);
        return true;
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error: any) {
      logError('Payment processing failed', {
        error: error.message,
        stack: error.stack,
        paymentData
      });
      return false;
    }
  }

  /**
   * Processes a refund for a payment transaction
   * 
   * @param paymentId - ID of the payment to refund
   * @returns boolean indicating if refund was successfully processed
   */
  async refundPayment(paymentId: string): Promise<boolean> {
    try {
      // Validate payment ID
      if (!paymentId) {
        throw new Error('Payment ID is required for refund');
      }

      // Process refund through Stripe
      const refundSuccess = await this.stripeService.refundPayment(paymentId);

      if (refundSuccess) {
        // Create payment instance for updating status
        const payment = new Payment(
          paymentId,
          '', // subscriptionId not needed for refund
          0, // amount not needed for refund
          '', // currency not needed for refund
          'pending_refund',
          new Date()
        );

        // Update payment status
        const success = await payment.refundPayment({
          reason: 'customer_requested',
          metadata: {
            refundedAt: new Date().toISOString()
          }
        });

        if (success) {
          logInfo(`Payment refunded successfully: ${paymentId}`);
          return true;
        }
      }

      throw new Error('Refund processing failed');
    } catch (error: any) {
      logError('Payment refund failed', {
        error: error.message,
        stack: error.stack,
        paymentId
      });
      return false;
    }
  }

  /**
   * Creates a new subscription with associated payment
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
      if (!subscriptionData.userId || !subscriptionData.tierId || !subscriptionData.customerId) {
        throw new Error('User ID, tier ID, and customer ID are required for subscription');
      }

      // Get subscription tier details
      const tier = new SubscriptionTier(
        subscriptionData.tierId,
        '', // name not needed for price lookup
        0, // price will be fetched
        '', // currency will be fetched
        '', // description not needed
        [] // subscriptions not needed
      );

      // Create Stripe subscription
      const subscription = await this.stripeService.createSubscription({
        customerId: subscriptionData.customerId,
        priceId: subscriptionData.tierId, // Assuming tierId matches Stripe priceId
        paymentMethodId: subscriptionData.paymentMethodId,
        metadata: {
          ...subscriptionData.metadata,
          userId: subscriptionData.userId
        }
      });

      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Create subscription record
        const newSubscription = new Subscription(
          subscription.id,
          subscriptionData.userId,
          subscriptionData.tierId,
          new Date(subscription.current_period_start * 1000),
          new Date(subscription.current_period_end * 1000),
          subscription.status
        );

        logInfo(`Subscription created successfully: ${subscription.id}`);
        return true;
      }

      throw new Error('Subscription creation failed');
    } catch (error: any) {
      logError('Subscription creation failed', {
        error: error.message,
        stack: error.stack,
        subscriptionData
      });
      return false;
    }
  }
}