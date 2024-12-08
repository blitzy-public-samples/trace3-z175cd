/**
 * @fileoverview Defines the PaymentController for handling HTTP requests related to payment operations.
 * 
 * Requirements Addressed:
 * - Payment Processing (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of payment transactions, including processing payments,
 *   refunds, and integration with Stripe.
 * 
 * Human Tasks:
 * - Configure payment webhook endpoints in the API gateway/router
 * - Set up monitoring alerts for payment failures
 * - Configure rate limiting for payment endpoints
 * - Implement proper error tracking for payment processing
 */

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { Payment } from '../models/Payment';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { logError } from '../../common/utils/logger';
import Joi from 'joi';

// Validation schemas for payment requests
const processPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().required(),
  customerId: Joi.string().optional(),
  paymentMethodId: Joi.string().optional(),
  description: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

const refundPaymentSchema = Joi.object({
  paymentId: Joi.string().required(),
  reason: Joi.string().max(200).optional()
});

const createSubscriptionSchema = Joi.object({
  userId: Joi.string().required(),
  tierId: Joi.string().required(),
  customerId: Joi.string().required(),
  paymentMethodId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

// Initialize PaymentService
const paymentService = new PaymentService();

/**
 * Handles HTTP POST requests to process a payment transaction
 */
const processPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const paymentData = req.validated.body;

    const success = await paymentService.processPayment({
      amount: paymentData.amount,
      currency: paymentData.currency,
      customerId: paymentData.customerId,
      paymentMethodId: paymentData.paymentMethodId,
      description: paymentData.description,
      metadata: paymentData.metadata
    });

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else {
      throw new Error('Payment processing failed');
    }
  } catch (error: any) {
    logError('Payment processing failed in controller', {
      error: error.message,
      stack: error.stack,
      requestData: req.body
    });
    next(error);
  }
};

/**
 * Handles HTTP POST requests to process a refund for a payment transaction
 */
const refundPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentId } = req.validated.body;

    const success = await paymentService.refundPayment(paymentId);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully'
      });
    } else {
      throw new Error('Refund processing failed');
    }
  } catch (error: any) {
    logError('Payment refund failed in controller', {
      error: error.message,
      stack: error.stack,
      requestData: req.body
    });
    next(error);
  }
};

/**
 * Handles HTTP POST requests to create a new subscription for a user
 */
const createSubscriptionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscriptionData = req.validated.body;

    const success = await paymentService.createSubscription({
      userId: subscriptionData.userId,
      tierId: subscriptionData.tierId,
      customerId: subscriptionData.customerId,
      paymentMethodId: subscriptionData.paymentMethodId,
      metadata: subscriptionData.metadata
    });

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Subscription created successfully'
      });
    } else {
      throw new Error('Subscription creation failed');
    }
  } catch (error: any) {
    logError('Subscription creation failed in controller', {
      error: error.message,
      stack: error.stack,
      requestData: req.body
    });
    next(error);
  }
};

// Export controller methods with validation middleware applied
export const PaymentController = {
  processPaymentHandler: [
    validationMiddleware(processPaymentSchema),
    processPaymentHandler
  ],
  refundPaymentHandler: [
    validationMiddleware(refundPaymentSchema),
    refundPaymentHandler
  ],
  createSubscriptionHandler: [
    validationMiddleware(createSubscriptionSchema),
    createSubscriptionHandler
  ]
};