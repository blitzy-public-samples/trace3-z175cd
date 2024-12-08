// react v18.x
import { useEffect, useState } from 'react';

// Import internal dependencies
import { Subscription } from '../../types/subscription';
import useSubscription from '../../hooks/useSubscription';
import { analyzeSubscriberTrends } from '../../utils/analytics';

// Import common components
import Table from '../common/Table';

/**
 * SubscriberList Component
 * 
 * Addresses requirements:
 * - Monetization (Technical Specification/Core Features/Monetization)
 * - Audience Metrics (Technical Specification/Scope/Core Features/Analytics)
 * 
 * Human Tasks:
 * 1. Configure monitoring for subscriber data loading performance
 * 2. Set up error tracking for subscription data fetch failures
 * 3. Review and adjust table pagination settings based on usage patterns
 */
const SubscriberList = () => {
  // Initialize subscription hook
  const {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    handleClearError
  } = useSubscription();

  // Local state for analytics data
  const [analyticsData, setAnalyticsData] = useState<{
    growthRate: number;
    averageChurnRate: number;
    retentionRate: number;
  }>({
    growthRate: 0,
    averageChurnRate: 0,
    retentionRate: 100
  });

  // Fetch subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Process analytics data when subscriptions change
  useEffect(() => {
    if (subscriptions.length > 0) {
      // Convert subscriptions to metrics format for analysis
      const metrics = subscriptions.map((sub, index) => ({
        totalSubscribers: subscriptions.slice(0, index + 1).length,
        newSubscribers: 1,
        churnRate: sub.status === 'cancelled' ? 0.1 : 0
      }));

      const trends = analyzeSubscriberTrends(metrics);
      setAnalyticsData({
        growthRate: trends.growthRate,
        averageChurnRate: trends.averageChurnRate,
        retentionRate: trends.retentionRate
      });
    }
  }, [subscriptions]);

  // Table column configuration
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      width: '15%'
    },
    {
      header: 'Subscription Tier',
      accessor: 'tier',
      width: '20%'
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '15%',
      cell: (subscription: Subscription) => (
        <span className={`status-badge status-${subscription.status.toLowerCase()}`}>
          {subscription.status}
        </span>
      )
    },
    {
      header: 'Growth Rate',
      width: '15%',
      cell: () => `${analyticsData.growthRate}%`
    },
    {
      header: 'Retention Rate',
      width: '15%',
      cell: () => `${analyticsData.retentionRate}%`
    },
    {
      header: 'Churn Rate',
      width: '15%',
      cell: () => `${analyticsData.averageChurnRate}%`
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="subscriber-list-loading">
        <div className="loading-spinner" />
        <p>Loading subscriber data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="subscriber-list-error">
        <p>Error loading subscribers: {error}</p>
        <button 
          onClick={handleClearError}
          className="error-retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!subscriptions.length) {
    return (
      <div className="subscriber-list-empty">
        <p>No subscribers found.</p>
      </div>
    );
  }

  // Render subscriber table with analytics
  return (
    <div className="subscriber-list-container">
      {/* Analytics Summary */}
      <div className="analytics-summary">
        <div className="analytics-card">
          <h3>Growth Rate</h3>
          <p>{analyticsData.growthRate}%</p>
        </div>
        <div className="analytics-card">
          <h3>Retention Rate</h3>
          <p>{analyticsData.retentionRate}%</p>
        </div>
        <div className="analytics-card">
          <h3>Churn Rate</h3>
          <p>{analyticsData.averageChurnRate}%</p>
        </div>
      </div>

      {/* Subscriber Table */}
      <Table
        data={subscriptions}
        columns={columns}
        className="subscriber-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        sortable={true}
        onSort={(sortKey: string, direction: 'asc' | 'desc') => {
          // Handle sorting logic here
          console.log('Sorting by:', sortKey, direction);
        }}
      />
    </div>
  );
};

export default SubscriberList;