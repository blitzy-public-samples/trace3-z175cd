// React v18.x
import React, { useState, useEffect } from 'react';

// Internal imports with relative paths
import { Subscription } from '../../types/subscription';
import { analyzeSubscriberTrends } from '../../utils/analytics';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

/**
 * Human Tasks:
 * 1. Verify analytics data collection endpoints are properly configured
 * 2. Review subscriber metrics calculation formulas with product team
 * 3. Ensure error states are properly handled and displayed
 * 4. Validate accessibility of statistics display with screen readers
 */

interface SubscriberMetrics {
  totalSubscribers: number;
  newSubscribers: number;
  churnRate: number;
  retentionRate: number;
  growthRate: number;
}

/**
 * SubscriberStats Component
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * Description: Displays subscriber metrics such as total subscribers, new subscribers,
 * and churn rate to provide insights into audience engagement.
 */
const SubscriberStats: React.FC = () => {
  // State management for subscriber metrics and loading states
  const [metrics, setMetrics] = useState<SubscriberMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and process subscriber data on component mount
  useEffect(() => {
    const fetchSubscriberData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulated API call to fetch subscription data
        // In a real implementation, this would be an actual API call
        const response = await fetch('/api/subscriptions');
        const subscriptions: Subscription[] = await response.json();

        // Process subscription data using analytics utility
        const trends = analyzeSubscriberTrends(subscriptions.map(sub => ({
          totalSubscribers: subscriptions.filter(s => s.status === 'active').length,
          newSubscribers: subscriptions.filter(s => 
            s.status === 'active' && 
            new Date(s.startDate).getMonth() === new Date().getMonth()
          ).length,
          churnRate: 0.05, // This would be calculated based on historical data
        })));

        // Set processed metrics
        setMetrics({
          totalSubscribers: subscriptions.filter(s => s.status === 'active').length,
          newSubscribers: subscriptions.filter(s => 
            s.status === 'active' && 
            new Date(s.startDate).getMonth() === new Date().getMonth()
          ).length,
          churnRate: trends.averageChurnRate,
          retentionRate: trends.retentionRate,
          growthRate: trends.growthRate
        });
      } catch (err) {
        setError('Failed to load subscriber statistics. Please try again later.');
        console.error('Error fetching subscriber data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriberData();
  }, []);

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner isLoading={true} message="Loading subscriber statistics..." />
      </div>
    );
  }

  // Display error message if data fetch failed
  if (error) {
    return (
      <Card>
        <div className="text-red-600 dark:text-red-400 p-4 text-center">
          <p role="alert">{error}</p>
        </div>
      </Card>
    );
  }

  // Display subscriber statistics
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Subscribers Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Total Subscribers
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {metrics?.totalSubscribers.toLocaleString()}
          </p>
        </div>
      </Card>

      {/* New Subscribers Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            New This Month
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {metrics?.newSubscribers.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Growth Rate: {metrics?.growthRate}%
          </p>
        </div>
      </Card>

      {/* Retention Metrics Card */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Retention Metrics
          </h3>
          <div className="mt-2">
            <p className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Retention Rate:</span>
              <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {metrics?.retentionRate}%
              </span>
            </p>
            <p className="flex justify-between items-center mt-2">
              <span className="text-gray-600 dark:text-gray-400">Churn Rate:</span>
              <span className="text-xl font-semibold text-red-600 dark:text-red-400">
                {metrics?.churnRate}%
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriberStats;