/**
 * @fileoverview Provides a service for aggregating and analyzing metrics such as engagement, revenue, and subscriber data.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a service to aggregate and analyze metrics for performance tracking and audience insights.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for metric aggregation queries
 * - Configure monitoring alerts for abnormal metric patterns
 * - Review and optimize aggregation performance periodically
 */

import { EngagementMetric } from '../models/EngagementMetric';
import { RevenueMetric } from '../models/RevenueMetric';
import { SubscriberMetric } from '../models/SubscriberMetric';
import { processTimeSeriesData } from './TimeSeriesService';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface for aggregated metrics result
 */
interface AggregatedMetrics {
  engagement: {
    views: number;
    clicks: number;
    shares: number;
    totalEngagement: number;
  };
  revenue: {
    total: number;
    currency: string;
    transactions: number;
  };
  subscribers: {
    total: number;
    new: number;
    churnRate: number;
  };
  timeSeriesData?: any;
}

/**
 * Aggregates metrics from various sources and processes them for analytics.
 * 
 * @param metrics - Array of metrics to aggregate (EngagementMetric, RevenueMetric, or SubscriberMetric instances)
 * @returns Aggregated metrics object containing processed data
 */
export const aggregateMetrics = async (metrics: (EngagementMetric | RevenueMetric | SubscriberMetric)[]): Promise<AggregatedMetrics> => {
  try {
    // Initialize aggregated metrics object
    const aggregatedMetrics: AggregatedMetrics = {
      engagement: {
        views: 0,
        clicks: 0,
        shares: 0,
        totalEngagement: 0
      },
      revenue: {
        total: 0,
        currency: 'USD', // Default currency
        transactions: 0
      },
      subscribers: {
        total: 0,
        new: 0,
        churnRate: 0
      }
    };

    // Separate metrics by type for processing
    const engagementMetrics: EngagementMetric[] = [];
    const revenueMetrics: RevenueMetric[] = [];
    const subscriberMetrics: SubscriberMetric[] = [];

    // Classify metrics by type
    for (const metric of metrics) {
      if (metric instanceof EngagementMetric) {
        engagementMetrics.push(metric);
      } else if (metric instanceof RevenueMetric) {
        if (RevenueMetric.validate(metric)) {
          revenueMetrics.push(metric);
        }
      } else if (metric instanceof SubscriberMetric) {
        if (metric.validate()) {
          subscriberMetrics.push(metric);
        }
      }
    }

    // Process engagement metrics
    for (const metric of engagementMetrics) {
      const data = metric.toJSON();
      aggregatedMetrics.engagement.views += data.views;
      aggregatedMetrics.engagement.clicks += data.clicks;
      aggregatedMetrics.engagement.shares += data.shares;
    }
    aggregatedMetrics.engagement.totalEngagement = 
      aggregatedMetrics.engagement.clicks + 
      aggregatedMetrics.engagement.shares;

    // Process revenue metrics
    for (const metric of revenueMetrics) {
      if (RevenueMetric.validate(metric)) {
        aggregatedMetrics.revenue.total += metric.amount;
        aggregatedMetrics.revenue.transactions++;
        // Assuming all metrics are in the same currency
        aggregatedMetrics.revenue.currency = metric.currency;
      }
    }

    // Process subscriber metrics
    let totalChurnRate = 0;
    for (const metric of subscriberMetrics) {
      if (metric.validate()) {
        aggregatedMetrics.subscribers.total = Math.max(
          aggregatedMetrics.subscribers.total,
          metric.totalSubscribers
        );
        aggregatedMetrics.subscribers.new += metric.newSubscribers;
        totalChurnRate += metric.churnRate;
      }
    }
    
    // Calculate average churn rate
    if (subscriberMetrics.length > 0) {
      aggregatedMetrics.subscribers.churnRate = totalChurnRate / subscriberMetrics.length;
    }

    // Process time series data
    try {
      aggregatedMetrics.timeSeriesData = await processTimeSeriesData(metrics);
    } catch (error) {
      // Log error but don't fail the entire aggregation
      logError('Failed to process time series data', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return aggregatedMetrics;

  } catch (error) {
    logError('Failed to aggregate metrics', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      metricsCount: metrics.length
    });
    throw error;
  }
};

// Export the MetricsAggregator function
export const MetricsAggregator = {
  aggregateMetrics
};