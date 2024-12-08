/**
 * @fileoverview Defines the SubscriptionTier model and validation functions for subscription tiers.
 * 
 * Requirements Addressed:
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization):
 *   Supports the management of subscription tiers, including their properties and 
 *   relationships with subscriptions and payments.
 * 
 * Human Tasks:
 * - Ensure database schema matches the SubscriptionTier model properties
 * - Configure currency codes supported by the payment processor
 * - Set up proper indexing for subscription tier queries in the database
 * - Verify price precision and currency handling in the payment processing system
 */

// pg v8.11.0
import { Client } from 'pg';
import { validateSchema } from '../../common/utils/validator';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import Joi from 'joi';

/**
 * Interface representing a subscription associated with a tier
 */
interface Subscription {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

/**
 * Class representing a subscription tier in the system
 */
export class SubscriptionTier {
  public id: string;
  public name: string;
  public price: number;
  public currency: string;
  public description: string;
  public subscriptions: Subscription[];

  /**
   * Creates a new SubscriptionTier instance
   */
  constructor(
    id: string,
    name: string,
    price: number,
    currency: string,
    description: string,
    subscriptions: Subscription[] = []
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.currency = currency;
    this.description = description;
    this.subscriptions = subscriptions;
  }

  /**
   * Converts the SubscriptionTier instance to a JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      currency: this.currency,
      description: this.description,
      subscriptions: this.subscriptions
    };
  }
}

/**
 * Validation schema for subscription tier data
 */
const subscriptionTierSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .description('Unique identifier for the subscription tier'),
  
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .description('Name of the subscription tier'),
  
  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .description('Price of the subscription tier'),
  
  currency: Joi.string()
    .length(3)
    .uppercase()
    .required()
    .description('Three-letter ISO currency code'),
  
  description: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .description('Detailed description of the subscription tier'),
  
  subscriptions: Joi.array()
    .items(Joi.object({
      id: Joi.string().uuid().required(),
      userId: Joi.string().uuid().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
      status: Joi.string().valid('active', 'cancelled', 'expired').required()
    }))
    .default([])
    .description('Array of subscriptions associated with this tier')
});

/**
 * Validates subscription tier data against the defined schema
 * 
 * @param tierData - The subscription tier data to validate
 * @returns true if validation succeeds, throws error if validation fails
 */
export const validateSubscriptionTier = (tierData: any): boolean => {
  try {
    validateSchema(tierData, subscriptionTierSchema);
    return true;
  } catch (error: any) {
    if (error.code === ERROR_CODES.VALIDATION_ERROR) {
      throw error;
    }
    // Wrap any other errors in a validation error
    const validationError = new Error('Subscription tier validation failed');
    (validationError as any).code = ERROR_CODES.VALIDATION_ERROR;
    (validationError as any).details = error.message;
    throw validationError;
  }
};