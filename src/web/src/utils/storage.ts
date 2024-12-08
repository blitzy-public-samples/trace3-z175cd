/**
 * @fileoverview Utility functions for interacting with web storage (localStorage and sessionStorage)
 * Addresses requirement: Content Management
 * Location: Technical Specification/Core Features/Content Creation
 * Purpose: Provides utility functions for storing and retrieving publication-related data
 */

// Import types
import { Publication } from '../types/publication';

// Human Tasks:
// 1. Ensure that the web application has the necessary permissions to access localStorage and sessionStorage
// 2. Verify browser compatibility requirements for web storage APIs
// 3. Consider implementing storage size monitoring to prevent exceeding browser limits
// 4. Review security implications of storing sensitive publication data in client-side storage

/**
 * Saves a key-value pair to localStorage or sessionStorage.
 * @param key - The key under which to store the value
 * @param value - The value to store (will be JSON stringified)
 * @param useSession - If true, uses sessionStorage; otherwise uses localStorage
 */
export const saveToStorage = (key: string, value: string, useSession: boolean = false): void => {
  try {
    // Validate inputs
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    if (value === undefined || value === null) {
      throw new Error('Invalid value provided for storage');
    }

    // Choose storage type
    const storage = useSession ? sessionStorage : localStorage;

    // Save to storage
    storage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving to ${useSession ? 'sessionStorage' : 'localStorage'}:`, error);
    throw error;
  }
};

/**
 * Retrieves a value from localStorage or sessionStorage by key.
 * @param key - The key to retrieve
 * @param useSession - If true, retrieves from sessionStorage; otherwise from localStorage
 * @returns The stored value as a string, or null if not found
 */
export const getFromStorage = (key: string, useSession: boolean = false): string | null => {
  try {
    // Validate input
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    // Choose storage type
    const storage = useSession ? sessionStorage : localStorage;

    // Retrieve from storage
    return storage.getItem(key);
  } catch (error) {
    console.error(`Error retrieving from ${useSession ? 'sessionStorage' : 'localStorage'}:`, error);
    throw error;
  }
};

/**
 * Removes a key-value pair from localStorage or sessionStorage.
 * @param key - The key to remove
 * @param useSession - If true, removes from sessionStorage; otherwise from localStorage
 */
export const removeFromStorage = (key: string, useSession: boolean = false): void => {
  try {
    // Validate input
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key provided');
    }

    // Choose storage type
    const storage = useSession ? sessionStorage : localStorage;

    // Remove from storage
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from ${useSession ? 'sessionStorage' : 'localStorage'}:`, error);
    throw error;
  }
};

/**
 * Storage keys used throughout the application
 * Centralizes storage key management to prevent duplication and typos
 */
export const STORAGE_KEYS = {
  CURRENT_PUBLICATION: 'current_publication',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_CONTENT: 'draft_content',
  LAST_VIEWED: 'last_viewed'
} as const;

/**
 * Type guard to check if a stored value can be parsed as a Publication
 * @param value - The value to check
 * @returns boolean indicating if the value matches Publication interface
 */
export const isPublication = (value: any): value is Publication => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.owner === 'object' &&
    typeof value.owner.id === 'string' &&
    typeof value.owner.name === 'string' &&
    typeof value.owner.email === 'string' &&
    Array.isArray(value.posts) &&
    Array.isArray(value.subscriptions)
  );
};

/**
 * Helper function to safely parse stored JSON data
 * @param value - The string value to parse
 * @returns The parsed object or null if parsing fails
 */
export const safeJSONParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};