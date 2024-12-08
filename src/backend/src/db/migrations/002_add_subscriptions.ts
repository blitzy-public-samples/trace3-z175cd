/**
 * @fileoverview Database migration to create subscription and subscription tier tables
 * 
 * Requirements Addressed:
 * - Subscription Management Schema (Technical Specification/Database Design/Schema Design)
 *   Implements the database schema for managing subscriptions and subscription tiers,
 *   including relationships with users and publications.
 * 
 * Human Tasks:
 * 1. Verify that the users and publications tables exist before running this migration
 * 2. Back up the database before running the migration
 * 3. Review the subscription tier pricing structure and update default values if needed
 * 4. Ensure proper database permissions are set for the application user
 */

// pg v8.11.0
import { Pool } from 'pg';
import { initializeDatabase } from '../../common/config/database';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Executes the database migration to create subscription-related tables
 */
export const runMigration = async (): Promise<void> => {
  let client: Pool | null = null;

  try {
    // Initialize database connection
    client = initializeDatabase();

    // Create subscription_tiers table
    await client.query(`
      CREATE TABLE subscription_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        description TEXT,
        features JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_tier_name UNIQUE (name)
      );

      -- Add trigger to update the updated_at timestamp
      CREATE TRIGGER update_subscription_tiers_timestamp
        BEFORE UPDATE ON subscription_tiers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create subscriptions table with relationships
    await client.query(`
      CREATE TABLE subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        publication_id UUID NOT NULL,
        tier_id UUID NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (
          status IN ('active', 'cancelled', 'expired', 'pending', 'suspended')
        ),
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE,
        auto_renew BOOLEAN DEFAULT true,
        cancel_at_period_end BOOLEAN DEFAULT false,
        last_payment_date TIMESTAMP WITH TIME ZONE,
        next_payment_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraints
        CONSTRAINT fk_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,
        
        CONSTRAINT fk_publication
          FOREIGN KEY (publication_id)
          REFERENCES publications(id)
          ON DELETE CASCADE,
        
        CONSTRAINT fk_subscription_tier
          FOREIGN KEY (tier_id)
          REFERENCES subscription_tiers(id)
          ON DELETE RESTRICT,
          
        -- Prevent duplicate active subscriptions
        CONSTRAINT unique_active_subscription
          UNIQUE (user_id, publication_id)
          WHERE status = 'active'
      );

      -- Add trigger to update the updated_at timestamp
      CREATE TRIGGER update_subscriptions_timestamp
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      -- Create indexes for common queries
      CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
      CREATE INDEX idx_subscriptions_publication_id ON subscriptions(publication_id);
      CREATE INDEX idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX idx_subscriptions_next_payment_date ON subscriptions(next_payment_date)
        WHERE status = 'active';
    `);

    // Create subscription audit log table for tracking changes
    await client.query(`
      CREATE TABLE subscription_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        previous_status VARCHAR(20),
        new_status VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_subscription
          FOREIGN KEY (subscription_id)
          REFERENCES subscriptions(id)
          ON DELETE CASCADE
      );

      CREATE INDEX idx_subscription_audit_logs_subscription_id 
        ON subscription_audit_logs(subscription_id);
    `);

  } catch (error) {
    const err = error as Error;
    logError('Failed to execute subscription schema migration', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack
    });
    throw error;
  } finally {
    if (client) {
      await client.end();
    }
  }
};