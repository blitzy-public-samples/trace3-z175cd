// @ts-check

/**
 * Stripe Integration Module
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 * Purpose: Provides utility functions for Stripe payment processing and subscription management
 */

// Human Tasks:
// 1. Set up Stripe account and obtain API keys
// 2. Configure webhook endpoints for Stripe events
// 3. Set up proper error monitoring for payment failures
// 4. Ensure PCI compliance requirements are met
// 5. Configure proper logging for payment events

// stripe v10.x
import Stripe from 'stripe';

// Import types and utilities
import { Subscription } from '../types/subscription';
import { validateSubscription } from '../utils/validation';

// Initialize Stripe with environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15', // Lock API version for stability
  typescript: true,
});

/**
 * Creates a new subscription in Stripe
 * Addresses requirement: Monetization - Subscription Management
 * 
 * @param subscription - Subscription object containing tier and customer information
 * @returns Promise resolving to the created Stripe subscription object
 * @throws Error if subscription creation fails
 */
export const createStripeSubscription = async (subscription: Subscription): Promise<object> => {
  try {
    // Validate subscription data before processing
    if (!validateSubscription(subscription)) {
      throw new Error('Invalid subscription data provided');
    }

    // Create or retrieve customer in Stripe
    const customer = await stripe.customers.create({
      metadata: {
        subscriptionId: subscription.id,
      },
    });

    // Map subscription tier to Stripe price ID
    const priceId = await getPriceIdForTier(subscription.tier);

    // Create the subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        subscriptionId: subscription.id,
        tier: subscription.tier,
      },
      expand: ['latest_invoice.payment_intent'],
      // Set subscription start date
      billing_cycle_anchor: Math.floor(subscription.startDate.getTime() / 1000),
    });

    return stripeSubscription;
  } catch (error) {
    // Log error for monitoring
    console.error('Stripe subscription creation failed:', error);
    throw new Error('Failed to create subscription in Stripe');
  }
};

/**
 * Cancels an existing subscription in Stripe
 * Addresses requirement: Monetization - Subscription Management
 * 
 * @param subscriptionId - ID of the subscription to cancel
 * @returns Promise resolving to true if cancellation was successful
 * @throws Error if cancellation fails
 */
export const cancelStripeSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    // Validate subscription ID
    if (!subscriptionId || typeof subscriptionId !== 'string') {
      throw new Error('Invalid subscription ID provided');
    }

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Cancel the subscription
    await stripe.subscriptions.cancel(subscription.id, {
      prorate: true,
    });

    return true;
  } catch (error) {
    // Log error for monitoring
    console.error('Stripe subscription cancellation failed:', error);
    throw new Error('Failed to cancel subscription in Stripe');
  }
};

/**
 * Helper function to map subscription tiers to Stripe price IDs
 * @param tier - Subscription tier level
 * @returns Promise resolving to Stripe price ID
 */
const getPriceIdForTier = async (tier: string): Promise<string> => {
  // Map of subscription tiers to Stripe price IDs
  const tierPriceMap: { [key: string]: string } = {
    'free': process.env.STRIPE_FREE_PRICE_ID || '',
    'premium': process.env.STRIPE_PREMIUM_PRICE_ID || '',
    'pro': process.env.STRIPE_PRO_PRICE_ID || '',
  };

  const priceId = tierPriceMap[tier];
  if (!priceId) {
    throw new Error(`Invalid subscription tier: ${tier}`);
  }

  return priceId;
};