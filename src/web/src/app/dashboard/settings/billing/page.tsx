'use client';

/**
 * Billing Page Component
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 * Purpose: Provides a user interface for managing billing information and subscription updates
 */

// react v18.x
import { useState, useEffect } from 'react';

// Internal imports
import BillingForm from '../../../../components/settings/BillingForm';
import { validateSubscription } from '../../../../utils/validation';
import { formatDate } from '../../../../utils/format';
import { fetchSubscriptions } from '../../../../lib/api';
import { useForm } from '../../../../hooks/useForm';
import { useToast } from '../../../../hooks/useToast';
import { actions } from '../../../../store/subscriptionSlice';

/**
 * Human Tasks:
 * 1. Configure Stripe API keys in environment variables
 * 2. Set up error monitoring for billing operations
 * 3. Configure analytics tracking for subscription events
 * 4. Review and test subscription cancellation flow
 */

const BillingPage = () => {
  // Initialize state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Initialize hooks
  const { addToast } = useToast();
  const { handleSubmit, values, errors } = useForm({
    initialValues: {},
    onSubmit: async (formValues) => {
      try {
        // Validate subscription data
        if (!validateSubscription(formValues)) {
          throw new Error('Invalid subscription data');
        }
        // Form submission is handled by BillingForm component
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : 'Failed to process subscription',
          'error'
        );
      }
    },
    validationType: 'auth'
  });

  // Fetch subscription data on component mount
  useEffect(() => {
    const loadSubscriptionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubscriptions();
        setSubscriptionData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load subscription data');
        addToast('Failed to load subscription data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, [addToast]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Billing Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your subscription and payment information
        </p>
      </div>

      {/* Display current subscription info if available */}
      {subscriptionData && subscriptionData.length > 0 && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Current Subscription
          </h2>
          {subscriptionData.map((subscription: any) => (
            <div key={subscription.id} className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Plan:</span> {subscription.tier}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> {subscription.status}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Next billing date:</span>{' '}
                {formatDate(new Date(subscription.endDate))}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Billing form component */}
      <BillingForm />

      {/* Display form errors if any */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <ul className="list-disc list-inside text-red-600">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BillingPage;