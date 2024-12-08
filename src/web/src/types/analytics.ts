/**
 * Analytics Types and Interfaces
 * 
 * Human Tasks:
 * 1. Ensure analytics data collection is properly configured in the application
 * 2. Verify that the analytics service can handle these data structures
 * 3. Set up appropriate monitoring for analytics data collection
 * 4. Configure data retention policies for analytics data
 */

/**
 * @requirement Audience Metrics
 * Interface defining engagement metrics for content performance tracking
 * Includes views, clicks, and shares to measure content reach and interaction
 */
export interface EngagementMetric {
  /** Total number of content views */
  views: number;
  /** Total number of user clicks/interactions */
  clicks: number;
  /** Total number of content shares */
  shares: number;
}

/**
 * @requirement Revenue Tracking
 * Interface defining revenue metrics for financial performance tracking
 * Includes total revenue, monthly revenue, and tier-based revenue breakdown
 */
export interface RevenueMetric {
  /** Total cumulative revenue */
  totalRevenue: number;
  /** Revenue generated in the current month */
  monthlyRevenue: number;
  /** Revenue breakdown by subscription tier
   * Key: tier name (e.g., 'basic', 'premium', 'enterprise')
   * Value: revenue amount for that tier
   */
  tierRevenue: Record<string, number>;
}

/**
 * @requirement Audience Metrics
 * Interface defining subscriber metrics for audience growth tracking
 * Includes total subscribers, new subscribers, and churn rate
 */
export interface SubscriberMetric {
  /** Total number of active subscribers */
  totalSubscribers: number;
  /** Number of new subscribers in the current period */
  newSubscribers: number;
  /** Subscriber churn rate as a decimal (e.g., 0.05 for 5% churn) */
  churnRate: number;
}