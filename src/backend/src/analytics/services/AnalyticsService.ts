/**
 * @fileoverview Provides a high-level service for managing and analyzing various analytics metrics.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a service to manage and analyze metrics for performance tracking 
 *   and audience insights.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for analytics queries
 * - Configure monitoring alerts for abnormal metric patterns
 * - Review and optimize analytics query performance periodically
 */

import { EngagementMetric } from '../models/EngagementMetric';
import { RevenueMetric } from '../models/RevenueMetric';
import { SubscriberMetric } from '../models/SubscriberMetric';
import { MetricsAggregator } from './MetricsAggregator';
import { processTimeSeriesData } from './TimeSeriesService';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface for analyzed metrics result
 */
interface AnalyzedMetrics {
  engagement: {
    views: number;
    clicks: number;
    shares: number;
    totalEngagement: number;
    engagementRate: number;
  };
  revenue: {
    total: number;
    currency: string;
    transactions: number;
    averageTransactionValue: number;
  };
  subscribers: {
    total: number;
    new: number;
    churnRate: number;
    retentionRate: number;
  };
  timeSeriesData?: any;
}

/**
 * Analyzes metrics by aggregating and processing data from various sources.
 * 
 * @param metrics - Array of metrics to analyze (EngagementMetric, RevenueMetric, or SubscriberMetric instances)
 * @returns Object containing aggregated and analyzed metrics
 */
export const analyzeMetrics = async (
  metrics: (EngagementMetric | RevenueMetric | SubscriberMetric)[]
): Promise<AnalyzedMetrics> => {
  try {
    // Initialize analyzed metrics object
    const analyzedMetrics: AnalyzedMetrics = {
      engagement: {
        views: 0,
        clicks: 0,
        shares: 0,
        totalEngagement: 0,
        engagementRate: 0
      },
      revenue: {
        total: 0,
        currency: 'USD',
        transactions: 0,
        averageTransactionValue: 0
      },
      subscribers: {
        total: 0,
        new: 0,
        churnRate: 0,
        retentionRate: 0
      }
    };

    // Aggregate metrics using MetricsAggregator
    const aggregatedMetrics = await MetricsAggregator.aggregateMetrics(metrics);

    // Process engagement metrics
    analyzedMetrics.engagement = {
      ...aggregatedMetrics.engagement,
      engagementRate: aggregatedMetrics.engagement.views > 0
        ? (aggregatedMetrics.engagement.totalEngagement / aggregatedMetrics.engagement.views) * 100
        : 0
    };

    // Process revenue metrics
    analyzedMetrics.revenue = {
      ...aggregatedMetrics.revenue,
      averageTransactionValue: aggregatedMetrics.revenue.transactions > 0
        ? aggregatedMetrics.revenue.total / aggregatedMetrics.revenue.transactions
        : 0
    };

    // Process subscriber metrics
    analyzedMetrics.subscribers = {
      ...aggregatedMetrics.subscribers,
      retentionRate: aggregatedMetrics.subscribers.churnRate > 0
        ? 100 - (aggregatedMetrics.subscribers.churnRate * 100)
        : 100
    };

    // Process time series data
    try {
      const timeSeriesData = await processTimeSeriesData(metrics);
      analyzedMetrics.timeSeriesData = timeSeriesData;
    } catch (error) {
      // Log error but don't fail the entire analysis
      logError('Failed to process time series data in analysis', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Validate metrics before returning
    for (const metric of metrics) {
      if (metric instanceof EngagementMetric) {
        const engagementData = metric.toJSON();
        if (!engagementData) {
          throw new Error('Invalid engagement metric data');
        }
      } else if (metric instanceof RevenueMetric) {
        if (!RevenueMetric.validate(metric)) {
          throw new Error('Invalid revenue metric data');
        }
      } else if (metric instanceof SubscriberMetric) {
        if (!metric.validate()) {
          throw new Error('Invalid subscriber metric data');
        }
      }
    }

    return analyzedMetrics;

  } catch (error) {
    logError('Failed to analyze metrics', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      metricsCount: metrics.length
    });
    throw error;
  }
};