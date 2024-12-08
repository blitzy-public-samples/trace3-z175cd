/**
 * @fileoverview Controller for handling subscription-related API endpoints.
 * 
 * Requirements Addressed:
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of user subscriptions, including creation, updates, and extensions.
 * 
 * Human Tasks:
 * - Ensure proper error monitoring is configured for subscription operations
 * - Set up alerts for failed subscription creations and updates
 * - Configure rate limiting for subscription endpoints
 * - Verify proper logging and auditing of subscription changes
 */

// express v4.18.x
import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Controller class for handling subscription-related API endpoints
 */
export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  /**
   * Initializes the SubscriptionController with required dependencies
   */
  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  /**
   * Handles the creation of a new subscription for a user
   * 
   * @param req - Express request object containing subscription data
   * @param res - Express response object
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      // Extract subscription data from request body
      const subscriptionData = {
        userId: req.body.userId,
        tierId: req.body.tierId,
        customerId: req.body.customerId,
        paymentMethodId: req.body.paymentMethodId,
        metadata: req.body.metadata
      };

      // Create the subscription
      const success = await this.subscriptionService.createSubscription(subscriptionData);

      if (success) {
        res.status(201).json({
          message: 'Subscription created successfully',
          data: {
            userId: subscriptionData.userId,
            tierId: subscriptionData.tierId,
            status: 'active'
          }
        });
      } else {
        const error = new Error('Failed to create subscription');
        (error as any).code = ERROR_CODES.VALIDATION_ERROR;
        throw error;
      }
    } catch (error: any) {
      // Pass error to error handling middleware
      errorHandler(error, req, res, () => {});
    }
  }

  /**
   * Handles updates to an existing subscription
   * 
   * @param req - Express request object containing update data
   * @param res - Express response object
   */
  async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      // Extract update data from request
      const subscriptionId = req.params.subscriptionId;
      const updateData = {
        status: req.body.status,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        metadata: req.body.metadata
      };

      // Update the subscription
      const success = await this.subscriptionService.updateSubscription(
        subscriptionId,
        updateData
      );

      if (success) {
        res.status(200).json({
          message: 'Subscription updated successfully',
          data: {
            subscriptionId,
            ...updateData
          }
        });
      } else {
        const error = new Error('Failed to update subscription');
        (error as any).code = ERROR_CODES.VALIDATION_ERROR;
        throw error;
      }
    } catch (error: any) {
      // Pass error to error handling middleware
      errorHandler(error, req, res, () => {});
    }
  }
}