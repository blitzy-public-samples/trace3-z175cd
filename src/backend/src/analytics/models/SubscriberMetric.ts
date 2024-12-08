/**
 * @fileoverview Defines the SubscriberMetric model for tracking and analyzing subscriber-related metrics.
 * 
 * Requirements Addressed:
 * - Analytics - Subscriber Metrics (Technical Specification/Analytics Platform/Audience Metrics):
 *   Provides a data model for tracking subscriber growth, retention, and engagement metrics.
 * 
 * Human Tasks:
 * - Ensure database schema matches the model's validation schema
 * - Set up monitoring alerts for abnormal churn rate values
 * - Configure data retention policies for subscriber metrics
 */

// joi v17.6.0
import Joi from 'joi';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { ROLES } from '../../common/constants/roles';
import { validateSchema } from '../../common/utils/validator';
import { logError } from '../../common/utils/logger';

/**
 * Represents a model for subscriber-related metrics, including growth, retention, and engagement.
 */
export class SubscriberMetric {
    /**
     * Unique identifier for the metric record
     */
    public readonly id: string;

    /**
     * Total number of active subscribers at the time of measurement
     */
    public readonly totalSubscribers: number;

    /**
     * Number of new subscribers gained during the measurement period
     */
    public readonly newSubscribers: number;

    /**
     * Rate of subscriber cancellations/unsubscribes (percentage as decimal)
     */
    public readonly churnRate: number;

    /**
     * Timestamp when the metrics were recorded
     */
    public readonly timestamp: Date;

    /**
     * Initializes a new instance of the SubscriberMetric model.
     * 
     * @param id - Unique identifier for the metric record
     * @param totalSubscribers - Total number of active subscribers
     * @param newSubscribers - Number of new subscribers
     * @param churnRate - Rate of subscriber churn
     * @param timestamp - Time of measurement
     */
    constructor(
        id: string,
        totalSubscribers: number,
        newSubscribers: number,
        churnRate: number,
        timestamp: Date
    ) {
        this.id = id;
        this.totalSubscribers = totalSubscribers;
        this.newSubscribers = newSubscribers;
        this.churnRate = churnRate;
        this.timestamp = timestamp;
    }

    /**
     * Validates the SubscriberMetric instance against a predefined schema.
     * 
     * @returns true if the instance is valid, otherwise throws a validation error
     * @throws Error with VALIDATION_ERROR code if validation fails
     */
    public validate(): boolean {
        // Define validation schema using Joi
        const schema = Joi.object({
            id: Joi.string()
                .required()
                .min(1)
                .max(255)
                .description('Unique identifier for the metric record'),

            totalSubscribers: Joi.number()
                .required()
                .min(0)
                .integer()
                .description('Total number of active subscribers'),

            newSubscribers: Joi.number()
                .required()
                .min(0)
                .integer()
                .max(Joi.ref('totalSubscribers'))
                .description('Number of new subscribers gained'),

            churnRate: Joi.number()
                .required()
                .min(0)
                .max(1)
                .precision(4)
                .description('Subscriber churn rate as decimal percentage'),

            timestamp: Joi.date()
                .required()
                .max('now')
                .description('Time when metrics were recorded')
        });

        try {
            // Validate the instance against the schema
            validateSchema(this, schema);
            return true;
        } catch (error) {
            // Log validation error with details
            logError('SubscriberMetric validation failed', {
                code: ERROR_CODES.VALIDATION_ERROR,
                metricId: this.id,
                validationErrors: (error as any).details,
                role: ROLES.SUBSCRIBER
            });
            throw error;
        }
    }
}