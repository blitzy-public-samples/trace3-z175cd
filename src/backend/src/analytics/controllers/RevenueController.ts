/**
 * @fileoverview Controller for handling revenue-related analytics requests, including data validation, 
 * processing, and response generation.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements a controller to manage revenue analytics, enabling performance tracking and revenue insights.
 * 
 * Human Tasks:
 * - Ensure proper database indexes are set up for revenue analytics queries
 * - Configure monitoring alerts for abnormal revenue patterns
 * - Review and optimize query performance for revenue analytics endpoints
 */

import { Request, Response } from 'express';
import { analyzeMetrics } from '../services/AnalyticsService';
import { RevenueMetric } from '../models/RevenueMetric';
import { IController } from '../../common/interfaces/IController';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Controller class for managing revenue analytics endpoints.
 * Implements the IController interface for standardized request handling.
 */
export class RevenueController implements IController {
    /**
     * Handles requests to retrieve and analyze revenue metrics.
     * 
     * @param req - Express request object containing query parameters
     * @param res - Express response object for sending the response
     */
    public async getRevenueMetrics(req: Request, res: Response): Promise<void> {
        try {
            // Extract query parameters
            const { startDate, endDate, currency } = req.query;

            // Create revenue metric instance for validation
            const revenueMetric = new RevenueMetric(
                req.query.id as string || Date.now().toString(),
                parseFloat(req.query.amount as string) || 0,
                currency as string || 'USD',
                new Date(startDate as string) || new Date()
            );

            // Validate the revenue metric
            if (!RevenueMetric.validate(revenueMetric)) {
                throw new Error('Invalid revenue metric parameters');
            }

            // Process and analyze the revenue metrics
            const analyzedMetrics = await analyzeMetrics([revenueMetric]);

            // Send the analyzed metrics as response
            res.status(200).json({
                success: true,
                data: {
                    revenue: analyzedMetrics.revenue,
                    timeSeriesData: analyzedMetrics.timeSeriesData
                }
            });

        } catch (error) {
            // Log the error
            logError('Failed to process revenue metrics', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                query: req.query
            });

            // Handle the error using the error middleware
            errorHandler(error as Error, req, res, () => {});
        }
    }

    /**
     * Implements the IController interface's handleRequest method.
     * Routes the request to the appropriate handler method.
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    public async handleRequest(req: Request, res: Response): Promise<void> {
        // Apply validation middleware for revenue metrics
        await validationMiddleware(RevenueMetric.getValidationSchema(), {
            query: true
        })(req, res, async () => {
            await this.getRevenueMetrics(req, res);
        });
    }
}