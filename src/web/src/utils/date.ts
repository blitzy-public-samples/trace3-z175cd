/**
 * Date utility functions for the frontend application
 * 
 * Human Tasks:
 * 1. Verify that the date formatting patterns match the application's regional requirements
 * 2. Ensure proper timezone handling is configured in the application
 * 3. Review accessibility requirements for date display formats
 */

import { formatDate } from './format';

/**
 * @requirement Content Formatting
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Parses a date string into a JavaScript Date object
 * 
 * @param dateString - The date string to parse
 * @returns A Date object if the input is valid, otherwise null
 */
export const parseDate = (dateString: string): Date | null => {
  // Check if the input string is non-empty
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }

  // Attempt to parse the string into a Date object
  const parsedDate = new Date(dateString);

  // Check if the parsing was successful
  if (isValidDate(parsedDate)) {
    return parsedDate;
  }

  return null;
};

/**
 * @requirement Content Formatting
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Checks if a given Date object is valid
 * 
 * @param date - The Date object to validate
 * @returns True if the Date object is valid, otherwise false
 */
export const isValidDate = (date: Date): boolean => {
  // Check if the input is an instance of Date
  if (!(date instanceof Date)) {
    return false;
  }

  // Check if the date is valid by verifying that it's not NaN
  // Invalid dates will return NaN when converted to a number
  return !isNaN(date.getTime());
};

/**
 * @requirement Content Formatting
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Formats a Date object into a human-readable string for display
 * 
 * @param date - The Date object to format
 * @returns Formatted date string
 * @throws Error if the date is invalid
 */
export const formatToDisplayDate = (date: Date): string => {
  // Validate the Date object
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to formatToDisplayDate');
  }

  // Use the imported formatDate function to ensure consistent formatting
  return formatDate(date);
};