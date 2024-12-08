/**
 * @fileoverview Controller for handling subscriber-related analytics requests.
 * 
 * Requirements Addressed:
 * - Analytics - Subscriber Metrics (Technical Specification/Analytics Platform/Audience Metrics):
 *   Implements a controller to handle API requests related to subscriber metrics,
 *   including validation and response formatting.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for subscriber metrics queries
 * - Configure monitoring alerts for abnormal subscriber churn patterns
 * - Review and optimize query performance for subscriber analytics
 */

// joi v17.6.0
import Joi from 'joi';
import { Request, Response } from 'express';
import { SubscriberMetric } from '../models/SubscriberMetric';
import { analyzeMetrics } from '../services/AnalyticsService';
import { IController } from '../../common/interfaces/IController';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';

/**
 * Validation schema for subscriber metrics request query parameters
 */
const subscriberMetricsQuerySchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .required()
        .description('Start date for metrics analysis'),
    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .description('End date for metrics analysis'),
    interval: Joi.string()
        .valid('daily', 'weekly', 'monthly')
        .default('daily')
        .description('Time interval for metrics aggregation')
});

/**
 * Controller for handling subscriber-related analytics requests
 */
class SubscriberController implements IController {
    /**
     * Handles requests to retrieve and analyze subscriber metrics.
     * Implements the IController interface.
     * 
     * @param req - Express request object containing query parameters
     * @param res - Express response object for sending the response
     */
    public async handleRequest(req: Request, res: Response): Promise<void> {
        try {
            // Apply validation middleware to query parameters
            await validationMiddleware(subscriberMetricsQuerySchema, { query: true })(req, res, () => {});

            // Extract validated query parameters
            const { startDate, endDate, interval } = req.validated.query;

            // Create and validate subscriber metric instance
            const subscriberMetric = new SubscriberMetric(
                'current',
                req.query.totalSubscribers as number || 0,
                req.query.newSubscribers as number || 0,
                req.query.churnRate as number || 0,
                new Date()
            );

            // Validate the subscriber metric
            subscriberMetric.validate();

            // Analyze the metrics using the analytics service
            const analyzedMetrics = await analyzeMetrics([subscriberMetric]);

            // Send the analyzed metrics as response
            res.status(200).json({
                success: true,
                data: {
                    metrics: analyzedMetrics,
                    period: {
                        start: startDate,
                        end: endDate,
                        interval
                    }
                }
            });

        } catch (error) {
            // Handle any errors using the error handler middleware
            errorHandler(error, req, res, () => {});
        }
    }
}

// Export the getSubscriberMetrics function
export const getSubscriberMetrics = new SubscriberController().handleRequest;