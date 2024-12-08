// @ts-check

/**
 * BillingForm Component
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 * Purpose: Provides a user interface for managing billing information and subscription updates
 */

// react v18.x
import React, { useState, useEffect } from 'react';
// stripe v10.x
import { Stripe } from 'stripe';

// Import internal dependencies
import { Subscription } from '../../types/subscription';
import { createStripeSubscription, cancelStripeSubscription } from '../../lib/stripe';
import { validateSubscription } from '../../utils/validation';
import useSubscription from '../../hooks/useSubscription';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Configure Stripe public key in environment variables
 * 2. Set up webhook endpoints for subscription events
 * 3. Configure error monitoring for payment failures
 * 4. Review subscription cancellation policy with business team
 */

interface BillingFormState {
  paymentMethod: string;
  selectedTier: string;
  processing: boolean;
  error: string | null;
  success: string | null;
}

const BillingForm: React.FC = () => {
  // Initialize subscription hook
  const {
    subscriptions,
    loading: subscriptionLoading,
    error: subscriptionError,
    fetchSubscriptions,
    getSubscriptionsByStatus
  } = useSubscription();

  // Local state management
  const [formState, setFormState] = useState<BillingFormState>({
    paymentMethod: '',
    selectedTier: '',
    processing: false,
    error: null,
    success: null
  });

  // Get active subscription on component mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      await fetchSubscriptions();
    };
    loadSubscriptions();
  }, [fetchSubscriptions]);

  // Get current active subscription
  const activeSubscription = getSubscriptionsByStatus('active')[0];

  /**
   * Handles changes to the payment method input
   * Addresses requirement: Monetization - Payment Method Management
   */
  const handlePaymentMethodChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      paymentMethod: value,
      error: null
    }));
  };

  /**
   * Handles changes to the subscription tier selection
   * Addresses requirement: Monetization - Subscription Tier Management
   */
  const handleTierChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      selectedTier: value,
      error: null
    }));
  };

  /**
   * Handles subscription creation or update
   * Addresses requirement: Monetization - Subscription Processing
   */
  const handleSubscriptionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormState(prev => ({ ...prev, processing: true, error: null }));

    try {
      const subscriptionData: Subscription = {
        id: crypto.randomUUID(),
        tier: formState.selectedTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      };

      // Validate subscription data
      if (!validateSubscription(subscriptionData)) {
        throw new Error('Invalid subscription data');
      }

      // Create new subscription
      await createStripeSubscription(subscriptionData);

      setFormState(prev => ({
        ...prev,
        processing: false,
        success: 'Subscription updated successfully',
        error: null
      }));

      // Refresh subscriptions list
      await fetchSubscriptions();
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Failed to update subscription',
        success: null
      }));
    }
  };

  /**
   * Handles subscription cancellation
   * Addresses requirement: Monetization - Subscription Management
   */
  const handleSubscriptionCancel = async () => {
    if (!activeSubscription?.id) return;

    setFormState(prev => ({ ...prev, processing: true, error: null }));

    try {
      await cancelStripeSubscription(activeSubscription.id);

      setFormState(prev => ({
        ...prev,
        processing: false,
        success: 'Subscription cancelled successfully',
        error: null
      }));

      // Refresh subscriptions list
      await fetchSubscriptions();
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        processing: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        success: null
      }));
    }
  };

  if (subscriptionLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
        Billing Settings
      </h2>

      {/* Error and Success Messages */}
      {(formState.error || subscriptionError) && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md" role="alert">
          {formState.error || subscriptionError}
        </div>
      )}
      
      {formState.success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md" role="alert">
          {formState.success}
        </div>
      )}

      {/* Current Subscription Info */}
      {activeSubscription && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
            Current Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Tier: {activeSubscription.tier}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Status: {activeSubscription.status}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Expires: {activeSubscription.endDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Subscription Form */}
      <form onSubmit={handleSubscriptionSubmit} className="space-y-6">
        <Input
          type="text"
          label="Payment Method"
          placeholder="Card number"
          required
          value={formState.paymentMethod}
          onChange={handlePaymentMethodChange}
          error={formState.error}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subscription Tier
          </label>
          <select
            value={formState.selectedTier}
            onChange={(e) => handleTierChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            required
          >
            <option value="">Select a tier</option>
            <option value="basic">Basic ($5/month)</option>
            <option value="premium">Premium ($10/month)</option>
            <option value="pro">Pro ($20/month)</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <Button
            label={activeSubscription ? 'Update Subscription' : 'Start Subscription'}
            onClick={() => {}}
            disabled={formState.processing}
            variant="primary"
          />

          {activeSubscription && (
            <Button
              label="Cancel Subscription"
              onClick={handleSubscriptionCancel}
              disabled={formState.processing}
              variant="danger"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default BillingForm;