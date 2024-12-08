/**
 * @fileoverview Defines the Subscription model and validation functions for user subscriptions.
 * 
 * Requirements Addressed:
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of user subscriptions, including their properties,
 *   relationships, and validation logic.
 * 
 * Human Tasks:
 * - Ensure database schema matches the Subscription model properties
 * - Configure proper indexing for subscription queries in the database
 * - Set up monitoring for subscription status changes
 * - Implement backup procedures for subscription data
 */

// pg v8.11.0
import { Client } from 'pg';
import { SubscriptionTier } from './SubscriptionTier';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { validateSchema } from '../../common/utils/validator';
import { initializeDatabase } from '../../common/config/database';
import Joi from 'joi';

/**
 * Represents a user subscription in the system
 */
export class Subscription {
  public id: string;
  public userId: string;
  public tierId: string;
  public startDate: Date;
  public endDate: Date;
  public status: string;

  /**
   * Creates a new Subscription instance
   */
  constructor(
    id: string,
    userId: string,
    tierId: string,
    startDate: Date,
    endDate: Date,
    status: string
  ) {
    this.id = id;
    this.userId = userId;
    this.tierId = tierId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  /**
   * Converts the Subscription instance to a JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      tierId: this.tierId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status
    };
  }
}

/**
 * Validation schema for subscription data
 */
const subscriptionSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .description('Unique identifier for the subscription'),
  
  userId: Joi.string()
    .uuid()
    .required()
    .description('ID of the user who owns the subscription'),
  
  tierId: Joi.string()
    .uuid()
    .required()
    .description('ID of the subscription tier'),
  
  startDate: Joi.date()
    .iso()
    .required()
    .description('Start date of the subscription'),
  
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .description('End date of the subscription'),
  
  status: Joi.string()
    .valid('active', 'cancelled', 'expired', 'pending')
    .required()
    .description('Current status of the subscription')
});

/**
 * Validates subscription data against the defined schema
 * 
 * @param subscriptionData - The subscription data to validate
 * @returns true if validation succeeds, throws error if validation fails
 */
export const validateSubscription = (subscriptionData: any): boolean => {
  try {
    validateSchema(subscriptionData, subscriptionSchema);
    return true;
  } catch (error: any) {
    if (error.code === ERROR_CODES.VALIDATION_ERROR) {
      throw error;
    }
    // Wrap any other errors in a validation error
    const validationError = new Error('Subscription validation failed');
    (validationError as any).code = ERROR_CODES.VALIDATION_ERROR;
    (validationError as any).details = error.message;
    throw validationError;
  }
};