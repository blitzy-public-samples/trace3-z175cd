/**
 * Utility functions for formatting data structures
 * 
 * Human Tasks:
 * 1. Verify locale settings for number formatting are configured correctly in the application
 * 2. Ensure date formatting matches the application's regional requirements
 * 3. Review accessibility requirements for formatted content display
 */

// date-fns v2.30.0
import { format, isValid } from 'date-fns';
import { EngagementMetric } from '../types/analytics';
import { AuthUser } from '../types/auth';
import { Post } from '../types/post';

/**
 * @requirement Content Presentation
 * Formats a Date object into a human-readable string
 * Location: Technical Specification/User Interface Design/Interface Elements
 * 
 * @param date - The Date object to format
 * @returns A formatted date string in 'MMM dd, yyyy' format
 * @throws Error if the date is invalid
 */
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || !isValid(date)) {
    throw new Error('Invalid date provided to formatDate');
  }
  
  return format(date, 'MMM dd, yyyy');
};

/**
 * @requirement Content Presentation
 * Formats engagement metrics into a readable string
 * Location: Technical Specification/User Interface Design/Interface Elements
 * 
 * @param metric - The engagement metric object containing views and clicks
 * @returns A formatted string representing the engagement metrics
 */
export const formatEngagementMetric = (metric: EngagementMetric): string => {
  const { views, clicks } = metric;
  
  // Use locale-specific number formatting
  const formattedViews = new Intl.NumberFormat().format(views);
  const formattedClicks = new Intl.NumberFormat().format(clicks);
  
  return `Views: ${formattedViews}, Clicks: ${formattedClicks}`;
};

/**
 * @requirement Content Presentation
 * Formats a post's metadata into a summary string
 * Location: Technical Specification/User Interface Design/Interface Elements
 * 
 * @param post - The post object containing title and creation date
 * @returns A formatted string summarizing the post metadata
 * @throws Error if the post date is invalid
 */
export const formatPostSummary = (post: Post): string => {
  const { title, createdAt } = post;
  
  if (!title || typeof title !== 'string') {
    throw new Error('Invalid post title');
  }
  
  const formattedDate = formatDate(createdAt);
  return `${title} (Published on: ${formattedDate})`;
};

/**
 * @requirement Content Presentation
 * Formats a user's email address for display
 * Location: Technical Specification/User Interface Design/Interface Elements
 * 
 * @param user - The user object containing email
 * @returns A formatted string containing the user's email
 * @throws Error if the email is invalid
 */
export const formatUserEmail = (user: AuthUser): string => {
  const { email } = user;
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid email address');
  }
  
  return email.toLowerCase();
};