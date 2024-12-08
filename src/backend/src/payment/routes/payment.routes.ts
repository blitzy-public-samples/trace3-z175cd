/**
 * @fileoverview Defines the API routes for payment-related operations.
 * 
 * Requirements Addressed:
 * - Payment Processing (Technical Specification/Scope/Core Features/Monetization):
 *   Implements routes for managing payment transactions, including processing payments,
 *   refunds, and integration with Stripe.
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization):
 *   Implements routes for managing user subscriptions, including creation and updates.
 * 
 * Human Tasks:
 * - Configure rate limiting for payment endpoints
 * - Set up monitoring alerts for payment failures
 * - Configure webhook endpoints for payment status updates
 * - Implement proper error tracking for payment processing
 */

// express v4.18.x
import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { jwtMiddleware } from '../../auth/middleware/JwtMiddleware';
import { roleMiddleware } from '../../auth/middleware/RoleMiddleware';

// Initialize router
const router = Router();

// Initialize controllers
const subscriptionController = new SubscriptionController();

/**
 * Payment Routes
 * All routes require authentication and appropriate role permissions
 */

// Process a new payment
router.post(
  '/process',
  jwtMiddleware,
  roleMiddleware(['subscriber', 'writer', 'admin']),
  PaymentController.processPaymentHandler,
  errorHandler
);

// Process a payment refund
router.post(
  '/refund',
  jwtMiddleware,
  roleMiddleware(['writer', 'admin']),
  PaymentController.refundPaymentHandler,
  errorHandler
);

// Create a new subscription
router.post(
  '/subscription',
  jwtMiddleware,
  roleMiddleware(['subscriber', 'writer', 'admin']),
  PaymentController.createSubscriptionHandler,
  errorHandler
);

// Update an existing subscription
router.put(
  '/subscription/:subscriptionId',
  jwtMiddleware,
  roleMiddleware(['writer', 'admin']),
  subscriptionController.updateSubscription.bind(subscriptionController),
  errorHandler
);

// Export configured router
export default router;