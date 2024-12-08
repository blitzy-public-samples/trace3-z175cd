/**
 * @fileoverview Configures the Redis client for caching and session management in the backend application.
 * 
 * Requirements Addressed:
 * - Caching and Session Management (Technical Specification/System Architecture/Data Storage)
 *   Implements the configuration for Redis to handle caching and session storage for improved application performance.
 * 
 * Human Tasks:
 * 1. Deploy a Redis instance and ensure it's accessible from the application environment
 * 2. Set up Redis persistence configuration based on data durability requirements
 * 3. Configure Redis password authentication if required
 * 4. Set up Redis monitoring and alerting in production
 * 5. Ensure proper network security rules are in place for Redis access
 */

// ioredis v5.3.2
import Redis from 'ioredis';
import { EnvironmentVariables } from '../../types/environment';
import { logError, logInfo } from '../utils/logger';

/**
 * Initializes and configures the Redis client with error handling and logging.
 * The client is configured with automatic reconnection and appropriate timeouts.
 * 
 * @returns {Redis} Configured Redis client instance
 */
export const initializeRedis = (): Redis => {
  try {
    // Create Redis client with connection options
    const client = new Redis(process.env.REDIS_URL as string, {
      // Reconnect strategy with exponential backoff
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Maximum number of retry attempts
      maxRetriesPerRequest: 3,
      // Connection timeout in ms
      connectTimeout: 10000,
      // Enable keep-alive
      keepAlive: 10000,
      // Enable auto-reconnect
      autoReconnect: true,
      // Enable read-only mode if connection fails
      enableReadyCheck: true,
      // Reconnect on error
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    // Handle successful connection
    client.on('connect', () => {
      logInfo('Successfully connected to Redis server');
    });

    // Handle connection errors
    client.on('error', (error: Error) => {
      logError('Redis connection error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Handle reconnection attempts
    client.on('reconnecting', (timeToReconnect: number) => {
      logInfo(`Attempting to reconnect to Redis in ${timeToReconnect}ms`);
    });

    // Handle ready state
    client.on('ready', () => {
      logInfo('Redis client is ready to handle requests');
    });

    // Handle end of connection
    client.on('end', () => {
      logInfo('Redis connection has been closed');
    });

    return client;
  } catch (error) {
    // Log any initialization errors
    logError('Failed to initialize Redis client', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Re-throw the error for handling by the application
    throw error;
  }
};