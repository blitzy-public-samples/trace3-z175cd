// React v18.x
import React, { useState, useEffect } from 'react';

// Import internal dependencies with relative paths
import { 
  EngagementMetric, 
  RevenueMetric, 
  SubscriberMetric 
} from '../../types/analytics';
import { calculateEngagementRate, formatRevenueData } from '../../utils/analytics';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

/**
 * Human Tasks:
 * 1. Verify analytics data collection endpoints are properly configured
 * 2. Review metric display formats with stakeholders
 * 3. Configure alert thresholds for abnormal metrics
 * 4. Test loading states and error handling scenarios
 */

interface MetricsCardProps {
  /** Engagement metrics data */
  engagementMetrics?: EngagementMetric;
  /** Revenue metrics data */
  revenueMetrics?: RevenueMetric;
  /** Subscriber metrics data */
  subscriberMetrics?: SubscriberMetric;
  /** Optional title for the metrics card */
  title?: string;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional error state */
  error?: string;
}

/**
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * A reusable component for displaying analytics metrics in a card format
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({
  engagementMetrics,
  revenueMetrics,
  subscriberMetrics,
  title = 'Analytics',
  isLoading = false,
  error
}) => {
  const [formattedRevenue, setFormattedRevenue] = useState<ReturnType<typeof formatRevenueData>>();

  // Format revenue data when metrics change
  useEffect(() => {
    if (revenueMetrics) {
      setFormattedRevenue(formatRevenueData(revenueMetrics));
    }
  }, [revenueMetrics]);

  // Handle loading state
  if (isLoading) {
    return (
      <Card title={title}>
        <div className="flex justify-center items-center min-h-[200px]">
          <Spinner isLoading={true} message="Loading metrics..." />
        </div>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card title={title}>
        <div className="text-red-600 dark:text-red-400 p-4 text-center">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="space-y-6 p-4">
        {/* Engagement Metrics Section */}
        {engagementMetrics && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Engagement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* @requirement Content Performance */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                <p className="text-xl font-bold">{engagementMetrics.views.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Clicks</p>
                <p className="text-xl font-bold">{engagementMetrics.clicks.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Shares</p>
                <p className="text-xl font-bold">{engagementMetrics.shares.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg col-span-full">
                <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                <p className="text-xl font-bold">
                  {calculateEngagementRate(engagementMetrics)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Metrics Section */}
        {revenueMetrics && formattedRevenue && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue
            </h4>
            {/* @requirement Revenue Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-xl font-bold">{formattedRevenue.totalFormatted}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-xl font-bold">{formattedRevenue.monthlyFormatted}</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Revenue by Tier</p>
              <div className="space-y-2">
                {formattedRevenue.tierBreakdown.map(({ tier, amount }) => (
                  <div key={tier} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{tier}</span>
                    <span className="font-medium">{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subscriber Metrics Section */}
        {subscriberMetrics && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Subscribers
            </h4>
            {/* @requirement Audience Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subscribers</p>
                <p className="text-xl font-bold">
                  {subscriberMetrics.totalSubscribers.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">New Subscribers</p>
                <p className="text-xl font-bold">
                  {subscriberMetrics.newSubscribers.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-xl font-bold">
                  {(subscriberMetrics.churnRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};