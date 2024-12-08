'use client';

// react v18.x
import { useEffect, useState } from 'react';

// Import internal components with relative paths
import SubscriberList from '../../../components/subscribers/SubscriberList';
import SubscriberStats from '../../../components/subscribers/SubscriberStats';

// Import utilities and types with relative paths
import { fetchSubscriptions } from '../../../lib/api';
import { analyzeSubscriberTrends } from '../../../utils/analytics';
import { formatDate } from '../../../utils/format';
import { Subscription } from '../../../types/subscription';

/**
 * Human Tasks:
 * 1. Configure monitoring for subscriber data loading performance
 * 2. Set up error tracking for subscription data fetch failures
 * 3. Review and adjust data refresh intervals based on usage patterns
 * 4. Verify analytics tracking implementation for subscriber metrics
 */

/**
 * SubscribersPage Component
 * 
 * Addresses requirements:
 * - Audience Metrics (Technical Specification/Scope/Core Features/Analytics)
 *   Provides insights into audience engagement by displaying subscriber data and analytics.
 * - Monetization (Technical Specification/Core Features/Monetization)
 *   Supports subscription management by displaying subscriber details and their statuses.
 */
export default function SubscribersPage() {
  // State management for subscriptions data and loading states
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch subscription data on component mount
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subscription data from the API
        const data = await fetchSubscriptions();
        setSubscriptions(data);
        setLastUpdated(new Date());

        // Process subscription data for analytics
        const metrics = data.map((sub, index) => ({
          totalSubscribers: data.slice(0, index + 1).length,
          newSubscribers: 1,
          churnRate: sub.status === 'cancelled' ? 0.1 : 0
        }));

        // Analyze subscriber trends
        analyzeSubscriberTrends(metrics);

      } catch (err) {
        setError('Failed to load subscriber data. Please try again later.');
        console.error('Error loading subscriber data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();

    // Set up periodic refresh interval (every 5 minutes)
    const refreshInterval = setInterval(loadSubscriptionData, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Subscribers
        </h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {formatDate(lastUpdated)}
          </p>
        )}
      </div>

      {/* Subscriber Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Subscriber Overview
        </h2>
        <SubscriberStats />
      </div>

      {/* Subscriber List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Subscriber Details
        </h2>
        <SubscriberList />
      </div>

      {/* Error Display */}
      {error && (
        <div 
          className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 my-4"
          role="alert"
        >
          <p className="text-red-700 dark:text-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      )}
    </div>
  );
}