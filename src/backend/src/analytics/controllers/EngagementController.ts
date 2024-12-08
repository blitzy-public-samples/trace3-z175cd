/**
 * @fileoverview Controller for handling engagement-related analytics requests.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a controller to handle engagement-related analytics requests and 
 *   provide insights into audience engagement.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for analytics queries
 * - Configure monitoring alerts for abnormal engagement patterns
 * - Review and optimize analytics query performance periodically
 */

import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { EngagementMetric } from '../models/EngagementMetric';
import { IController } from '../../common/interfaces/IController';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// joi v17.6.0
import Joi from 'joi';

/**
 * Schema for validating engagement metrics request query parameters
 */
const engagementMetricsSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  granularity: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly').default('daily'),
  metrics: Joi.array().items(
    Joi.string().valid('views', 'clicks', 'shares', 'totalEngagement', 'engagementRate')
  ).default(['views', 'clicks', 'shares'])
});

/**
 * Handles requests to fetch and process engagement metrics.
 * Implements the IController interface for standardized request handling.
 * 
 * @param req - Express request object containing query parameters
 * @param res - Express response object for sending the response
 */
export const getEngagementMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationMiddlewareInstance = validationMiddleware(engagementMetricsSchema, { query: true });
    await new Promise((resolve, reject) => {
      validationMiddlewareInstance(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    // Extract validated query parameters
    const { startDate, endDate, granularity, metrics } = req.validated.query;

    // Create engagement metrics instances for the requested period
    const engagementMetrics = await Promise.all(
      metrics.map(async (metricType: string) => {
        try {
          // Fetch raw metric data from database (implementation would be in AnalyticsService)
          const metricData = {
            views: 0,
            clicks: 0,
            shares: 0
          };

          return new EngagementMetric(
            metricData.views,
            metricData.clicks,
            metricData.shares
          );
        } catch (error) {
          logError('Failed to create engagement metric', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            metricType,
            startDate,
            endDate
          });
          throw error;
        }
      })
    );

    // Process metrics using AnalyticsService
    const analyzedMetrics = await AnalyticsService.analyzeMetrics(engagementMetrics);

    // Convert metrics to JSON format
    const response = engagementMetrics.map(metric => metric.toJSON());

    // Add analyzed metrics to response
    const finalResponse = {
      metrics: response,
      analysis: analyzedMetrics,
      period: {
        startDate,
        endDate,
        granularity
      }
    };

    // Send successful response
    res.status(200).json(finalResponse);

  } catch (error) {
    // Handle any errors using the error handler middleware
    errorHandler(error, req, res, () => {
      logError('Failed to process engagement metrics request', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query
      });
    });
  }
};