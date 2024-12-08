'use client';

// React v18.x
import { useState, useEffect } from 'react';

// Import internal components with relative paths
import { EngagementChart } from '../../../components/analytics/EngagementChart';
import { RevenueChart } from '../../../components/analytics/RevenueChart';
import { SubscriberChart } from '../../../components/analytics/SubscriberChart';
import { MetricsCard } from '../../../components/analytics/MetricsCard';

// Import utility functions
import { 
  calculateEngagementRate, 
  formatRevenueData, 
  analyzeSubscriberTrends 
} from '../../../utils/analytics';

// Import types
import { 
  EngagementMetric, 
  RevenueMetric, 
  SubscriberMetric 
} from '../../../types/analytics';

/**
 * Human Tasks:
 * 1. Configure analytics data refresh intervals based on business requirements
 * 2. Set up monitoring for analytics data collection endpoints
 * 3. Review error handling and fallback strategies
 * 4. Verify data visualization accessibility compliance
 */

/**
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * A React page component that serves as the analytics dashboard, displaying
 * various metrics for audience engagement, revenue, and subscriber growth.
 */
export default function AnalyticsPage() {
  // State management for different metric types
  const [engagementData, setEngagementData] = useState<EngagementMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueMetric[]>([]);
  const [subscriberData, setSubscriberData] = useState<SubscriberMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // Simulated data for demonstration
        // In production, these would be API calls to your analytics service
        const mockEngagementData: EngagementMetric[] = [
          { views: 1500, clicks: 450, shares: 75 },
          { views: 1800, clicks: 520, shares: 92 },
          { views: 2200, clicks: 680, shares: 115 }
        ];

        const mockRevenueData: RevenueMetric[] = [
          {
            totalRevenue: 25000,
            monthlyRevenue: 8500,
            tierRevenue: {
              basic: 3500,
              premium: 3000,
              enterprise: 2000
            }
          }
        ];

        const mockSubscriberData: SubscriberMetric[] = [
          {
            totalSubscribers: 1200,
            newSubscribers: 150,
            churnRate: 0.05
          },
          {
            totalSubscribers: 1300,
            newSubscribers: 180,
            churnRate: 0.04
          },
          {
            totalSubscribers: 1450,
            newSubscribers: 200,
            churnRate: 0.03
          }
        ];

        setEngagementData(mockEngagementData);
        setRevenueData(mockRevenueData);
        setSubscriberData(mockSubscriberData);
        setError(null);
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
        console.error('Error fetching analytics data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();

    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchAnalyticsData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Analytics Dashboard
      </h1>

      {/* Summary Metrics Card */}
      <div className="mb-8">
        <MetricsCard
          engagementMetrics={engagementData[engagementData.length - 1]}
          revenueMetrics={revenueData[revenueData.length - 1]}
          subscriberMetrics={subscriberData[subscriberData.length - 1]}
          isLoading={isLoading}
          error={error}
          title="Key Metrics Overview"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* @requirement Content Performance */}
        <div className="w-full">
          <EngagementChart
            data={engagementData}
            title="Content Engagement"
            className="h-[400px]"
          />
        </div>

        {/* @requirement Revenue Tracking */}
        <div className="w-full">
          <RevenueChart
            data={revenueData}
          />
        </div>

        {/* @requirement Audience Metrics */}
        <div className="w-full lg:col-span-2">
          <SubscriberChart
            initialData={subscriberData}
            refreshInterval={5 * 60 * 1000} // 5 minutes
            title="Subscriber Growth and Retention"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}