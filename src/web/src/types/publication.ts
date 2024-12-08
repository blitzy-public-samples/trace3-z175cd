/**
 * @fileoverview Publication type definitions for the Substack Replica platform.
 * Addresses requirements:
 * - Content Creation (Technical Specification/Core Features/Content Creation)
 * - Monetization (Technical Specification/Core Features/Monetization)
 * Purpose: Defines types for publications, including metadata, owner details, and associated subscriptions.
 */

// Import dependencies
import { Post } from './post';

/**
 * Represents the owner of a publication
 * Contains essential identification and contact information
 */
interface PublicationOwner {
  /**
   * Unique identifier for the owner
   * Format: UUID v4
   */
  id: string;

  /**
   * Display name of the owner
   * Must be non-empty
   */
  name: string;

  /**
   * Email address of the owner
   * Must be a valid email format
   */
  email: string;
}

/**
 * Represents a subscriber's subscription to a publication
 * Addresses requirement: Monetization
 */
interface PublicationSubscription {
  /**
   * Unique identifier for the subscription
   * Format: UUID v4
   */
  id: string;

  /**
   * Subscription tier level
   * Examples: 'free', 'premium', 'pro'
   */
  tier: string;

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
   * Current status of the subscription
   * Possible values: 'active', 'cancelled', 'expired', 'pending'
   */
  status: string;

  /**
   * Information about the subscriber
   */
  user: {
    /**
     * Unique identifier for the subscriber
     * Format: UUID v4
     */
    id: string;

    /**
     * Email address of the subscriber
     * Must be a valid email format
     */
    email: string;
  };
}

/**
 * Represents a complete publication entity in the system
 * Addresses requirements:
 * - Content Creation (Technical Specification/Core Features/Content Creation)
 * - Monetization (Technical Specification/Core Features/Monetization)
 */
export interface Publication {
  /**
   * Unique identifier for the publication
   * Format: UUID v4
   */
  id: string;

  /**
   * Display name of the publication
   * Must be non-empty
   */
  name: string;

  /**
   * Detailed description of the publication
   * Can contain formatted text
   */
  description: string;

  /**
   * Owner details for the publication
   * Contains identification and contact information
   */
  owner: PublicationOwner;

  /**
   * Collection of posts associated with the publication
   * Ordered by publication date (newest first)
   */
  posts: Array<Post>;

  /**
   * Active subscriptions to the publication
   * Includes all subscription tiers
   */
  subscriptions: Array<PublicationSubscription>;
}