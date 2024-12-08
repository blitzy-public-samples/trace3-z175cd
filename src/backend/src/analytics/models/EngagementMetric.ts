/**
 * @fileoverview Defines the EngagementMetric model for tracking content engagement analytics.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a model to represent engagement metrics for performance tracking 
 *   and audience insights.
 * 
 * Human Tasks:
 * - Ensure database schema supports storing engagement metrics with appropriate indexes
 * - Set up monitoring alerts for abnormal engagement patterns
 * - Configure data retention policies for engagement metrics
 */

import { logError, logInfo } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface defining the shape of engagement metric data
 */
interface EngagementMetricData {
  views: number;
  clicks: number;
  shares: number;
}

/**
 * Validates engagement metric data to ensure it meets required standards
 * 
 * @param metricData - The engagement metric data to validate
 * @returns true if validation passes, throws error otherwise
 */
export const validateMetric = (metricData: EngagementMetricData): boolean => {
  try {
    // Check if all required fields are present
    if (
      typeof metricData.views === 'undefined' ||
      typeof metricData.clicks === 'undefined' ||
      typeof metricData.shares === 'undefined'
    ) {
      throw new Error('Missing required engagement metric fields');
    }

    // Ensure all numeric fields are non-negative
    if (metricData.views < 0 || metricData.clicks < 0 || metricData.shares < 0) {
      throw new Error('Engagement metrics cannot be negative');
    }

    // Ensure clicks and shares don't exceed views
    if (metricData.clicks > metricData.views) {
      throw new Error('Number of clicks cannot exceed number of views');
    }

    if (metricData.shares > metricData.views) {
      throw new Error('Number of shares cannot exceed number of views');
    }

    logInfo('Engagement metric validation successful');
    return true;
  } catch (error) {
    logError('Engagement metric validation failed', {
      code: ERROR_CODES.VALIDATION_ERROR,
      metricData,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: ${error instanceof Error ? error.message : 'Invalid metric data'}`);
  }
};

/**
 * Represents engagement metrics for content analytics
 */
export class EngagementMetric {
  private readonly views: number;
  private readonly clicks: number;
  private readonly shares: number;

  /**
   * Creates a new EngagementMetric instance
   * 
   * @param views - Number of content views
   * @param clicks - Number of content clicks/interactions
   * @param shares - Number of content shares
   */
  constructor(views: number, clicks: number, shares: number) {
    // Validate metric data before instantiation
    validateMetric({ views, clicks, shares });
    
    this.views = views;
    this.clicks = clicks;
    this.shares = shares;

    logInfo('Created new EngagementMetric instance');
  }

  /**
   * Converts the EngagementMetric instance to a JSON object
   * 
   * @returns JSON representation of the engagement metrics
   */
  toJSON(): EngagementMetricData {
    return {
      views: this.views,
      clicks: this.clicks,
      shares: this.shares
    };
  }

  /**
   * Gets the click-through rate (CTR)
   * 
   * @returns The click-through rate as a percentage
   */
  getClickThroughRate(): number {
    return this.views > 0 ? (this.clicks / this.views) * 100 : 0;
  }

  /**
   * Gets the share rate
   * 
   * @returns The share rate as a percentage
   */
  getShareRate(): number {
    return this.views > 0 ? (this.shares / this.views) * 100 : 0;
  }

  /**
   * Gets the total engagement rate (clicks + shares)
   * 
   * @returns The total engagement rate as a percentage
   */
  getTotalEngagementRate(): number {
    return this.views > 0 ? ((this.clicks + this.shares) / this.views) * 100 : 0;
  }
}