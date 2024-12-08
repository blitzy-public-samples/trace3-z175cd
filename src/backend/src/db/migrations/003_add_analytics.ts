/**
 * @fileoverview Database migration to create analytics-related tables for tracking
 * engagement, revenue, and subscriber metrics.
 * 
 * Requirements Addressed:
 * - Analytics Schema (Technical Specification/Database Design/Schema Design)
 *   Implements the database schema for managing analytics data, including
 *   engagement metrics, revenue metrics, and subscriber metrics.
 * 
 * Human Tasks:
 * 1. Verify that the publications table exists and has the correct schema
 * 2. Ensure proper database backup before running this migration
 * 3. Update monitoring system to track the new analytics tables
 * 4. Set up appropriate database indexes based on query patterns
 */

// pg v8.11.0
import { Pool } from 'pg';
import { initializeDatabase } from '../../common/config/database';
import { logError, logInfo } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Executes the database migration to create analytics-related tables
 */
export const runMigration = async (): Promise<void> => {
  let pool: Pool | null = null;

  try {
    // Initialize database connection
    pool = initializeDatabase();

    // Begin transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create engagement_metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS engagement_metrics (
          id SERIAL PRIMARY KEY,
          publication_id INTEGER NOT NULL,
          metric_type VARCHAR(50) NOT NULL,
          value INTEGER NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_publication
            FOREIGN KEY (publication_id)
            REFERENCES publications(id)
            ON DELETE CASCADE,
          CONSTRAINT valid_metric_type
            CHECK (metric_type IN ('views', 'likes', 'comments', 'shares'))
        );

        CREATE INDEX idx_engagement_metrics_publication_id
          ON engagement_metrics(publication_id);
        
        CREATE INDEX idx_engagement_metrics_timestamp
          ON engagement_metrics(timestamp);
      `);

      // Create revenue_metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS revenue_metrics (
          id SERIAL PRIMARY KEY,
          publication_id INTEGER NOT NULL,
          revenue DECIMAL(10,2) NOT NULL,
          transaction_type VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_publication
            FOREIGN KEY (publication_id)
            REFERENCES publications(id)
            ON DELETE CASCADE,
          CONSTRAINT valid_transaction_type
            CHECK (transaction_type IN ('subscription', 'one_time', 'refund'))
        );

        CREATE INDEX idx_revenue_metrics_publication_id
          ON revenue_metrics(publication_id);
        
        CREATE INDEX idx_revenue_metrics_timestamp
          ON revenue_metrics(timestamp);
      `);

      // Create subscriber_metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriber_metrics (
          id SERIAL PRIMARY KEY,
          publication_id INTEGER NOT NULL,
          subscriber_count INTEGER NOT NULL,
          subscription_type VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_publication
            FOREIGN KEY (publication_id)
            REFERENCES publications(id)
            ON DELETE CASCADE,
          CONSTRAINT valid_subscription_type
            CHECK (subscription_type IN ('free', 'paid', 'premium')),
          CONSTRAINT positive_subscriber_count
            CHECK (subscriber_count >= 0)
        );

        CREATE INDEX idx_subscriber_metrics_publication_id
          ON subscriber_metrics(publication_id);
        
        CREATE INDEX idx_subscriber_metrics_timestamp
          ON subscriber_metrics(timestamp);
      `);

      // Create triggers for updating timestamps
      await client.query(`
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_engagement_metrics_timestamp
          BEFORE UPDATE ON engagement_metrics
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();

        CREATE TRIGGER update_revenue_metrics_timestamp
          BEFORE UPDATE ON revenue_metrics
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();

        CREATE TRIGGER update_subscriber_metrics_timestamp
          BEFORE UPDATE ON subscriber_metrics
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
      `);

      await client.query('COMMIT');
      logInfo('Successfully created analytics tables and indexes');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as Error;
    logError('Failed to execute analytics schema migration', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack
    });
    throw error;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};