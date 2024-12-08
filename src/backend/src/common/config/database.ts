/**
 * @fileoverview Database configuration and connection management for the backend application
 * 
 * Requirements Addressed:
 * - Database Configuration (Technical Specification/Data Storage/Primary Databases)
 *   Implements the configuration for connecting to the PostgreSQL database, including 
 *   connection pooling and environment-based settings.
 * 
 * Human Tasks:
 * 1. Ensure PostgreSQL server is installed and running
 * 2. Configure DATABASE_URL in the .env file with proper credentials
 * 3. Set up database backup and recovery procedures
 * 4. Configure database monitoring and alerting
 * 5. Review and adjust connection pool settings based on load testing results
 */

// pg v8.11.0
import { Pool, PoolConfig } from 'pg';
import { EnvironmentVariables } from '../../types/environment';
import { ERROR_CODES } from '../constants/errorCodes';
import { logError } from '../utils/logger';

/**
 * Default pool configuration settings optimized for production use
 */
const DEFAULT_POOL_CONFIG: Partial<PoolConfig> = {
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
  maxUses: 7500, // Number of times a client can be used before being recycled
  allowExitOnIdle: true // Allow the pool to exit when all clients are idle
};

/**
 * Initializes and configures the database connection pool with error handling
 * and optimal performance settings.
 * 
 * @returns Configured PostgreSQL connection pool
 */
export const initializeDatabase = (): Pool => {
  try {
    // Get the database URL from environment variables
    const databaseUrl = process.env.DATABASE_URL as EnvironmentVariables['DATABASE_URL'];

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create a new connection pool with merged configuration
    const pool = new Pool({
      connectionString: databaseUrl,
      ...DEFAULT_POOL_CONFIG
    });

    // Handle pool errors
    pool.on('error', (err, client) => {
      logError('Unexpected error on idle database client', {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        error: err.message,
        stack: err.stack,
        clientId: client?.processID
      });
    });

    // Handle pool connect events
    pool.on('connect', (client) => {
      client.on('error', (err) => {
        logError('Database client error', {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          error: err.message,
          stack: err.stack,
          clientId: client.processID
        });
      });
    });

    // Test the connection
    pool.query('SELECT NOW()')
      .catch((err) => {
        logError('Failed to connect to database', {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          error: err.message,
          stack: err.stack
        });
        throw err;
      });

    return pool;
  } catch (error) {
    const err = error as Error;
    logError('Database initialization failed', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack
    });
    throw error;
  }
};