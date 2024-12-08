/**
 * @fileoverview Subscription type definitions for the Substack Replica platform.
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 * Purpose: Defines types for subscription tiers, statuses, and associated metadata.
 */

// Import dependencies
import { Publication } from './publication';

/**
 * Represents a subscription to a publication
 * Addresses requirement: Monetization
 */
export interface Subscription {
  /**
   * Unique identifier for the subscription
   * Format: UUID v4
   */
  id: string;

  /**
   * Subscription tier level
   * Examples: 'free', 'premium', 'pro'
   * Must be non-empty
   */
  tier: string;

  /**
   * Current status of the subscription
   * Possible values: 'active', 'inactive', 'cancelled'
   */
  status: string;

  /**
   * Date when the subscription begins
   * Format: ISO 8601
   */
  startDate: Date;

  /**
   * Date when the subscription ends
   * Format: ISO 8601
   */
  endDate: Date;

  /**
   * Publication associated with the subscription
   * Contains essential publication information
   */
  publication: Publication;
}

/**
 * Validates subscription data to ensure integrity and compliance with expected formats
 * Addresses requirement: Monetization
 * @param subscription - Subscription object to validate
 * @returns boolean indicating if the subscription is valid
 */
export const validateSubscription = (subscription: Subscription): boolean => {
  // Check if subscription object exists and has all required fields
  if (!subscription || 
      !subscription.id ||
      !subscription.tier ||
      !subscription.status ||
      !subscription.startDate ||
      !subscription.endDate ||
      !subscription.publication) {
    return false;
  }

  // Validate id is a non-empty string
  if (typeof subscription.id !== 'string' || subscription.id.trim() === '') {
    return false;
  }

  // Validate tier is a non-empty string
  if (typeof subscription.tier !== 'string' || subscription.tier.trim() === '') {
    return false;
  }

  // Validate status is one of the allowed values
  const validStatuses = ['active', 'inactive', 'cancelled'];
  if (!validStatuses.includes(subscription.status)) {
    return false;
  }

  // Validate dates are valid Date objects
  if (!(subscription.startDate instanceof Date) || 
      !(subscription.endDate instanceof Date)) {
    return false;
  }

  // Validate startDate is before endDate
  if (subscription.startDate >= subscription.endDate) {
    return false;
  }

  // Validate publication object has required fields
  if (!subscription.publication.id ||
      typeof subscription.publication.id !== 'string' ||
      !subscription.publication.name ||
      typeof subscription.publication.name !== 'string') {
    return false;
  }

  return true;
};