/**
 * @fileoverview Provides a service for processing and analyzing time-series data for various analytics metrics.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a service to process time-series data for performance tracking and audience insights.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for time-series queries
 * - Configure data retention policies for time-series data
 * - Set up monitoring for abnormal metric patterns
 * - Review and optimize database query performance for time-series aggregations
 */

// pg v8.11.0
import { Pool } from 'pg';
import { EngagementMetric } from '../models/EngagementMetric';
import { RevenueMetric } from '../models/RevenueMetric';
import { SubscriberMetric } from '../models/SubscriberMetric';
import { logger, logInfo, logError } from '../../common/utils/logger';
import { initializeDatabase } from '../../common/config/database';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// Database client for time-series operations
let dbClient: Pool;

/**
 * Interface for time-series data point
 */
interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metricType: string;
  metricId: string;
}

/**
 * Interface for processed time-series data
 */
interface ProcessedTimeSeriesData {
  metricId: string;
  metricType: string;
  dataPoints: TimeSeriesDataPoint[];
  aggregations: {
    min: number;
    max: number;
    avg: number;
    sum: number;
  };
}

/**
 * Processes raw metrics data into time-series format for analytics.
 * 
 * @param metrics - Array of metrics to process
 * @returns Processed time-series data object
 */
export const processTimeSeriesData = async (metrics: any[]): Promise<ProcessedTimeSeriesData> => {
  try {
    // Initialize database connection if not already initialized
    if (!dbClient) {
      dbClient = initializeDatabase();
    }

    // Initialize containers for different metric types
    const timeSeriesData: TimeSeriesDataPoint[] = [];
    const processedData: ProcessedTimeSeriesData = {
      metricId: '',
      metricType: '',
      dataPoints: [],
      aggregations: {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE,
        avg: 0,
        sum: 0
      }
    };

    // Process each metric based on its type
    for (const metric of metrics) {
      let dataPoint: TimeSeriesDataPoint | null = null;

      if (metric instanceof EngagementMetric) {
        const engagementData = metric.toJSON();
        dataPoint = {
          timestamp: new Date(),
          value: engagementData.views + engagementData.clicks + engagementData.shares,
          metricType: 'engagement',
          metricId: metric.id || 'engagement_metric'
        };
        processedData.metricType = 'engagement';
      } else if (metric instanceof RevenueMetric) {
        if (RevenueMetric.validate(metric)) {
          dataPoint = {
            timestamp: metric.timestamp,
            value: metric.amount,
            metricType: 'revenue',
            metricId: metric.id
          };
          processedData.metricType = 'revenue';
        }
      } else if (metric instanceof SubscriberMetric) {
        if (metric.validate()) {
          dataPoint = {
            timestamp: metric.timestamp,
            value: metric.totalSubscribers,
            metricType: 'subscriber',
            metricId: metric.id
          };
          processedData.metricType = 'subscriber';
        }
      }

      if (dataPoint) {
        timeSeriesData.push(dataPoint);
        processedData.metricId = dataPoint.metricId;

        // Update aggregations
        processedData.aggregations.min = Math.min(processedData.aggregations.min, dataPoint.value);
        processedData.aggregations.max = Math.max(processedData.aggregations.max, dataPoint.value);
        processedData.aggregations.sum += dataPoint.value;
      }
    }

    // Calculate average if there are data points
    if (timeSeriesData.length > 0) {
      processedData.aggregations.avg = processedData.aggregations.sum / timeSeriesData.length;
    }

    // Sort data points by timestamp
    processedData.dataPoints = timeSeriesData.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Store time-series data in database
    await storeTimeSeriesData(processedData);

    logInfo('Successfully processed time-series data');
    return processedData;

  } catch (error) {
    const err = error as Error;
    logError('Failed to process time-series data', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack
    });
    throw error;
  }
};

/**
 * Stores processed time-series data in the database
 * 
 * @param data - Processed time-series data to store
 */
async function storeTimeSeriesData(data: ProcessedTimeSeriesData): Promise<void> {
  try {
    const query = `
      INSERT INTO time_series_data 
      (metric_id, metric_type, timestamp, value, aggregation_min, aggregation_max, aggregation_avg, aggregation_sum)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const dataPoint of data.dataPoints) {
      await dbClient.query(query, [
        data.metricId,
        data.metricType,
        dataPoint.timestamp,
        dataPoint.value,
        data.aggregations.min,
        data.aggregations.max,
        data.aggregations.avg,
        data.aggregations.sum
      ]);
    }

    logInfo('Successfully stored time-series data in database');
  } catch (error) {
    const err = error as Error;
    logError('Failed to store time-series data', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack,
      metricId: data.metricId,
      metricType: data.metricType
    });
    throw error;
  }
}