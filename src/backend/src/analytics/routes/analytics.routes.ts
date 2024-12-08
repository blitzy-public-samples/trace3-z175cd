/**
 * @fileoverview Defines the API routes for analytics-related operations, including engagement,
 * revenue, and subscriber metrics.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Implements API routes for analytics operations, enabling access to engagement,
 *   revenue, and subscriber metrics.
 * 
 * Human Tasks:
 * - Ensure proper rate limiting is configured for analytics endpoints
 * - Set up monitoring for analytics endpoint performance
 * - Configure caching policies for analytics responses if needed
 */

// express v4.18.2
import { Router } from 'express';
import { EngagementController } from '../controllers/EngagementController';
import { RevenueController } from '../controllers/RevenueController';
import { SubscriberController } from '../controllers/SubscriberController';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { roleMiddleware } from '../../auth/middleware/RoleMiddleware';
import { jwtMiddleware } from '../../auth/middleware/JwtMiddleware';
import { ROLES } from '../../common/constants/roles';

// Initialize router
const analyticsRouter = Router();

// Base path for analytics routes
const BASE_PATH = '/api/analytics';

// Analytics access roles
const ANALYTICS_ROLES = [ROLES.ADMIN, ROLES.WRITER];

/**
 * @route GET /api/analytics/engagement
 * @description Get engagement metrics for the specified time period
 * Protected by JWT authentication and role-based access control
 */
analyticsRouter.get(
    `${BASE_PATH}/engagement`,
    jwtMiddleware,
    roleMiddleware(ANALYTICS_ROLES),
    validationMiddleware(EngagementController.getValidationSchema(), { query: true }),
    EngagementController.getEngagementMetrics,
    errorHandler
);

/**
 * @route GET /api/analytics/revenue
 * @description Get revenue metrics for the specified time period
 * Protected by JWT authentication and role-based access control
 */
analyticsRouter.get(
    `${BASE_PATH}/revenue`,
    jwtMiddleware,
    roleMiddleware(ANALYTICS_ROLES),
    validationMiddleware(RevenueController.getValidationSchema(), { query: true }),
    RevenueController.getRevenueMetrics,
    errorHandler
);

/**
 * @route GET /api/analytics/subscribers
 * @description Get subscriber metrics for the specified time period
 * Protected by JWT authentication and role-based access control
 */
analyticsRouter.get(
    `${BASE_PATH}/subscribers`,
    jwtMiddleware,
    roleMiddleware(ANALYTICS_ROLES),
    validationMiddleware(SubscriberController.getValidationSchema(), { query: true }),
    getSubscriberMetrics,
    errorHandler
);

// Export the configured router
export default analyticsRouter;