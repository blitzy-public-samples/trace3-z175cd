// React v18.x
'use client';
import React, { useState, useEffect } from 'react';

// Import relative paths for internal components
import { MetricsCard } from '../../../components/analytics/MetricsCard';
import { EngagementChart } from '../../../components/analytics/EngagementChart';
import { RevenueChart } from '../../../components/analytics/RevenueChart';
import { SubscriberChart } from '../../../components/analytics/SubscriberChart';
import PostList from '../../../components/posts/PostList';
import SubscriberList from '../../../components/subscribers/SubscriberList';
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';

/**
 * Human Tasks:
 * 1. Configure analytics data refresh intervals with product team
 * 2. Review dashboard layout responsiveness across devices
 * 3. Verify data loading states and error handling with UX team
 * 4. Set up monitoring for dashboard performance metrics
 */

/**
 * @requirement Dashboard Overview
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Main dashboard page component providing an overview of analytics, posts,
 * subscribers, and settings for content creators.
 */
const DashboardPage = () => {
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState({
    engagement: {
      views: 0,
      clicks: 0,
      shares: 0
    },
    revenue: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      tierRevenue: {}
    },
    subscribers: {
      totalSubscribers: 0,
      newSubscribers: 0,
      churnRate: 0
    }
  });

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Simulated API calls - replace with actual API endpoints
        const [engagementData, revenueData, subscriberData] = await Promise.all([
          // fetchEngagementMetrics(),
          // fetchRevenueMetrics(),
          // fetchSubscriberMetrics()
        ]);

        setAnalyticsData({
          engagement: engagementData || analyticsData.engagement,
          revenue: revenueData || analyticsData.revenue,
          subscribers: subscriberData || analyticsData.subscribers
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header component for top navigation */}
      <Header />

      {/* Main layout with sidebar */}
      <div className="flex">
        {/* Sidebar for navigation */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard title */}
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
              Dashboard Overview
            </h1>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <MetricsCard
                engagementMetrics={analyticsData.engagement}
                revenueMetrics={analyticsData.revenue}
                subscriberMetrics={analyticsData.subscribers}
                isLoading={isLoading}
                error={error}
              />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <EngagementChart
                  data={[analyticsData.engagement]}
                  title="Engagement Trends"
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <RevenueChart
                  data={[analyticsData.revenue]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <SubscriberChart
                  initialData={[analyticsData.subscribers]}
                  refreshInterval={300000} // 5 minutes
                />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Posts
                </h2>
                <PostList
                  pageSize={5}
                  filter={{
                    dateRange: {
                      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                      end: new Date()
                    }
                  }}
                />
              </div>
            </div>

            {/* Subscriber list section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Subscriber Overview
              </h2>
              <SubscriberList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;