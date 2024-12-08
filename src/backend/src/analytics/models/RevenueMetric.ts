/**
 * @fileoverview Defines the RevenueMetric class for representing and validating revenue-related analytics data.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a model for revenue metrics to enable performance tracking and revenue analytics.
 * 
 * Human Tasks:
 * 1. Ensure proper database schema exists for revenue metrics
 * 2. Configure appropriate currency conversion rates if multi-currency support is needed
 * 3. Set up appropriate database indexes for timestamp-based queries
 */

// pg v8.11.0
import { Pool } from 'pg';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { logError } from '../../common/utils/logger';
import { initializeDatabase } from '../../common/config/database';

/**
 * Interface defining the structure of revenue metric data
 */
interface RevenueMetricData {
  id: string;
  amount: number;
  currency: string;
  timestamp: Date;
}

/**
 * Represents a revenue metric with methods for validation and database interaction.
 */
export class RevenueMetric {
  private id: string;
  private amount: number;
  private currency: string;
  private timestamp: Date;
  private static dbPool: Pool;

  /**
   * Creates a new RevenueMetric instance.
   * 
   * @param id - Unique identifier for the revenue metric
   * @param amount - The monetary amount of the revenue
   * @param currency - The currency code (e.g., USD, EUR)
   * @param timestamp - The timestamp when the revenue was recorded
   */
  constructor(id: string, amount: number, currency: string, timestamp: Date) {
    this.id = id;
    this.amount = amount;
    this.currency = currency;
    this.timestamp = timestamp;
  }

  /**
   * Validates the revenue metric data to ensure it meets the required schema and constraints.
   * 
   * @param metricData - The revenue metric data to validate
   * @returns true if the data is valid, throws an error otherwise
   */
  public static validate(metricData: RevenueMetricData): boolean {
    try {
      // Check for required fields
      if (!metricData.id || !metricData.amount || !metricData.currency || !metricData.timestamp) {
        throw new Error('Missing required fields');
      }

      // Validate id format (assuming UUID or similar string format)
      if (typeof metricData.id !== 'string' || metricData.id.trim().length === 0) {
        throw new Error('Invalid id format');
      }

      // Validate amount
      if (typeof metricData.amount !== 'number' || isNaN(metricData.amount) || metricData.amount < 0) {
        throw new Error('Invalid amount');
      }

      // Validate currency (assuming ISO 4217 currency codes)
      const currencyRegex = /^[A-Z]{3}$/;
      if (!currencyRegex.test(metricData.currency)) {
        throw new Error('Invalid currency code');
      }

      // Validate timestamp
      const timestamp = new Date(metricData.timestamp);
      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid timestamp');
      }

      return true;
    } catch (error) {
      const err = error as Error;
      logError('Revenue metric validation failed', {
        code: ERROR_CODES.VALIDATION_ERROR,
        error: err.message,
        metricData
      });
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: ${err.message}`);
    }
  }

  /**
   * Saves the revenue metric to the database.
   */
  public async saveToDatabase(): Promise<void> {
    try {
      // Initialize database connection if not already initialized
      if (!RevenueMetric.dbPool) {
        RevenueMetric.dbPool = initializeDatabase();
      }

      // Validate the current instance data
      RevenueMetric.validate({
        id: this.id,
        amount: this.amount,
        currency: this.currency,
        timestamp: this.timestamp
      });

      // Insert the revenue metric into the database
      const query = `
        INSERT INTO revenue_metrics (id, amount, currency, timestamp)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
        SET amount = EXCLUDED.amount,
            currency = EXCLUDED.currency,
            timestamp = EXCLUDED.timestamp
      `;

      const values = [this.id, this.amount, this.currency, this.timestamp];
      await RevenueMetric.dbPool.query(query, values);

      // Process time series data for analytics
      await this.processTimeSeriesData();

    } catch (error) {
      const err = error as Error;
      logError('Failed to save revenue metric to database', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: err.message,
        metricData: {
          id: this.id,
          amount: this.amount,
          currency: this.currency,
          timestamp: this.timestamp
        }
      });
      throw error;
    }
  }

  /**
   * Processes time-series data for revenue metrics.
   * This is a private method that handles the aggregation and analysis of revenue data.
   */
  private async processTimeSeriesData(): Promise<void> {
    try {
      // Implementation would be provided by the global processTimeSeriesData function
      // This is just a placeholder to show how it would be called
      const timeSeriesData = {
        metricId: this.id,
        amount: this.amount,
        currency: this.currency,
        timestamp: this.timestamp
      };
      
      // @ts-ignore - processTimeSeriesData is defined globally
      await processTimeSeriesData(timeSeriesData);
    } catch (error) {
      const err = error as Error;
      logError('Failed to process time series data', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: err.message,
        metricId: this.id
      });
      // Don't throw here to prevent blocking the main save operation
    }
  }
}