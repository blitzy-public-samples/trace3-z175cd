/**
 * Analytics Utility Functions
 * 
 * Human Tasks:
 * 1. Verify that analytics data collection endpoints are properly configured
 * 2. Ensure monitoring is set up for analytics processing functions
 * 3. Configure alerting thresholds for abnormal metrics
 * 4. Review and adjust engagement rate calculation parameters if needed
 */

import {
  EngagementMetric,
  RevenueMetric,
  SubscriberMetric
} from '../types/analytics';

/**
 * @requirement Audience Metrics
 * Calculates the engagement rate based on views and clicks
 * Formula: (clicks / views) * 100
 */
export const calculateEngagementRate = (metric: EngagementMetric): number => {
  if (metric.views === 0) {
    return 0;
  }

  // Calculate engagement as percentage of clicks per view
  const engagementRate = (metric.clicks / metric.views) * 100;

  // Round to 2 decimal places for cleaner display
  return Number(engagementRate.toFixed(2));
};

/**
 * @requirement Revenue Tracking
 * Formats revenue data for visualization in charts and dashboards
 * Includes total revenue, monthly revenue, and tier-based breakdown
 */
export const formatRevenueData = (revenue: RevenueMetric): {
  totalFormatted: string;
  monthlyFormatted: string;
  tierBreakdown: { tier: string; amount: string }[];
  percentages: { tier: string; percentage: number }[];
} => {
  // Format currency values
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

  // Calculate tier percentages of total revenue
  const tierPercentages = Object.entries(revenue.tierRevenue).map(([tier, amount]) => ({
    tier,
    percentage: Number(((amount / revenue.totalRevenue) * 100).toFixed(1))
  }));

  // Format tier breakdown
  const tierBreakdown = Object.entries(revenue.tierRevenue).map(([tier, amount]) => ({
    tier,
    amount: formatter.format(amount)
  }));

  return {
    totalFormatted: formatter.format(revenue.totalRevenue),
    monthlyFormatted: formatter.format(revenue.monthlyRevenue),
    tierBreakdown,
    percentages: tierPercentages
  };
};

/**
 * @requirement Audience Metrics
 * Analyzes subscriber trends to provide insights into growth and churn
 * Processes an array of metrics to calculate growth rates and trends
 */
export const analyzeSubscriberTrends = (metrics: SubscriberMetric[]): {
  growthRate: number;
  averageChurnRate: number;
  retentionRate: number;
  trends: {
    subscribers: { period: number; count: number }[];
    churn: { period: number; rate: number }[];
  };
} => {
  if (!metrics.length) {
    return {
      growthRate: 0,
      averageChurnRate: 0,
      retentionRate: 100,
      trends: {
        subscribers: [],
        churn: []
      }
    };
  }

  // Calculate overall growth rate
  const firstPeriod = metrics[0];
  const lastPeriod = metrics[metrics.length - 1];
  const growthRate = ((lastPeriod.totalSubscribers - firstPeriod.totalSubscribers) / 
    firstPeriod.totalSubscribers) * 100;

  // Calculate average churn rate
  const averageChurnRate = metrics.reduce((acc, curr) => 
    acc + curr.churnRate, 0) / metrics.length;

  // Calculate retention rate (inverse of churn)
  const retentionRate = 100 - (averageChurnRate * 100);

  // Generate trend data for visualization
  const trends = {
    subscribers: metrics.map((metric, index) => ({
      period: index,
      count: metric.totalSubscribers
    })),
    churn: metrics.map((metric, index) => ({
      period: index,
      rate: metric.churnRate * 100
    }))
  };

  return {
    growthRate: Number(growthRate.toFixed(2)),
    averageChurnRate: Number((averageChurnRate * 100).toFixed(2)),
    retentionRate: Number(retentionRate.toFixed(2)),
    trends
  };
};