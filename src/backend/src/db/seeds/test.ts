/**
 * @fileoverview Populates the database with test data for development and testing purposes
 * 
 * Requirements Addressed:
 * - Test Data Seeding (Technical Specification/Development Environment/Data Management Strategy)
 *   Implements the seeding of test data for development and testing environments to ensure 
 *   consistent and reliable testing.
 * 
 * Human Tasks:
 * 1. Ensure PostgreSQL database is running and accessible
 * 2. Verify DATABASE_URL environment variable is set correctly
 * 3. Review and adjust test data volume based on testing needs
 * 4. Ensure sufficient disk space for test data
 */

// faker v5.5.3
import faker from 'faker';
import { initializeDatabase } from '../common/config/database';
import { runMigration as runInitialMigration } from '../migrations/001_initial_schema';
import { runMigration as runSubscriptionMigration } from '../migrations/002_add_subscriptions';
import { runMigration as runAnalyticsMigration } from '../migrations/003_add_analytics';
import { logError, logInfo } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Generates and seeds test data into the database
 */
export const seedTestData = async (): Promise<void> => {
  const pool = initializeDatabase();

  try {
    // Run migrations to ensure schema is up to date
    await runInitialMigration();
    await runSubscriptionMigration();
    await runAnalyticsMigration();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Generate test users
      const userIds = [];
      for (let i = 0; i < 50; i++) {
        const { rows } = await client.query(`
          INSERT INTO users (email, password, role, is_verified, full_name, bio, avatar_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          faker.internet.email(),
          '$2b$10$' + faker.random.alphaNumeric(53), // Simulated bcrypt hash
          faker.random.arrayElement(['user', 'admin', 'editor']),
          faker.datatype.boolean(),
          faker.name.findName(),
          faker.lorem.paragraph(),
          faker.image.avatar()
        ]);
        userIds.push(rows[0].id);
      }

      // Generate test publications
      const publicationIds = [];
      for (let i = 0; i < 20; i++) {
        const { rows } = await client.query(`
          INSERT INTO publications (user_id, name, slug, description, logo_url, settings)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          faker.random.arrayElement(userIds),
          faker.company.companyName(),
          faker.helpers.slugify(faker.company.companyName()).toLowerCase(),
          faker.company.catchPhrase(),
          faker.image.business(),
          JSON.stringify({
            allowComments: faker.datatype.boolean(),
            requireSubscription: faker.datatype.boolean(),
            theme: faker.random.arrayElement(['light', 'dark', 'custom'])
          })
        ]);
        publicationIds.push(rows[0].id);
      }

      // Generate test posts
      const postIds = [];
      for (let i = 0; i < 100; i++) {
        const { rows } = await client.query(`
          INSERT INTO posts (publication_id, title, slug, content, excerpt, cover_image_url, metadata, status, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          faker.random.arrayElement(publicationIds),
          faker.lorem.sentence(),
          faker.helpers.slugify(faker.lorem.sentence()).toLowerCase(),
          faker.lorem.paragraphs(5),
          faker.lorem.paragraph(),
          faker.image.nature(),
          JSON.stringify({
            readTime: faker.datatype.number({ min: 3, max: 20 }),
            tags: faker.random.words(3).split(' '),
            featured: faker.datatype.boolean()
          }),
          faker.random.arrayElement(['draft', 'published', 'archived']),
          faker.date.past()
        ]);
        postIds.push(rows[0].id);
      }

      // Generate test comments
      for (let i = 0; i < 200; i++) {
        await client.query(`
          INSERT INTO comments (post_id, user_id, parent_id, content, is_edited)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          faker.random.arrayElement(postIds),
          faker.random.arrayElement(userIds),
          faker.datatype.boolean() ? faker.random.arrayElement(postIds) : null,
          faker.lorem.paragraph(),
          faker.datatype.boolean()
        ]);
      }

      // Generate subscription tiers
      const tierIds = [];
      const tiers = [
        { name: 'Basic', price: 5.99 },
        { name: 'Premium', price: 9.99 },
        { name: 'Enterprise', price: 19.99 }
      ];

      for (const tier of tiers) {
        const { rows } = await client.query(`
          INSERT INTO subscription_tiers (name, price, description, features)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `, [
          tier.name,
          tier.price,
          faker.lorem.sentence(),
          JSON.stringify({
            articleAccess: faker.random.arrayElement(['limited', 'unlimited']),
            commentAccess: faker.datatype.boolean(),
            exclusiveContent: faker.datatype.boolean()
          })
        ]);
        tierIds.push(rows[0].id);
      }

      // Generate subscriptions
      for (let i = 0; i < 150; i++) {
        const startDate = faker.date.past();
        const endDate = faker.date.future();
        
        await client.query(`
          INSERT INTO subscriptions (
            user_id, publication_id, tier_id, status, start_date, end_date,
            auto_renew, cancel_at_period_end, last_payment_date, next_payment_date
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          faker.random.arrayElement(userIds),
          faker.random.arrayElement(publicationIds),
          faker.random.arrayElement(tierIds),
          faker.random.arrayElement(['active', 'cancelled', 'expired', 'pending', 'suspended']),
          startDate,
          endDate,
          faker.datatype.boolean(),
          faker.datatype.boolean(),
          startDate,
          faker.date.between(startDate, endDate)
        ]);
      }

      // Generate analytics data
      for (const publicationId of publicationIds) {
        // Engagement metrics
        for (let i = 0; i < 30; i++) {
          await client.query(`
            INSERT INTO engagement_metrics (
              publication_id, metric_type, value, timestamp
            )
            VALUES ($1, $2, $3, $4)
          `, [
            publicationId,
            faker.random.arrayElement(['views', 'likes', 'comments', 'shares']),
            faker.datatype.number({ min: 10, max: 1000 }),
            faker.date.recent(30)
          ]);
        }

        // Revenue metrics
        for (let i = 0; i < 20; i++) {
          await client.query(`
            INSERT INTO revenue_metrics (
              publication_id, revenue, transaction_type, timestamp
            )
            VALUES ($1, $2, $3, $4)
          `, [
            publicationId,
            faker.datatype.float({ min: 5, max: 100, precision: 0.01 }),
            faker.random.arrayElement(['subscription', 'one_time', 'refund']),
            faker.date.recent(30)
          ]);
        }

        // Subscriber metrics
        for (let i = 0; i < 15; i++) {
          await client.query(`
            INSERT INTO subscriber_metrics (
              publication_id, subscriber_count, subscription_type, timestamp
            )
            VALUES ($1, $2, $3, $4)
          `, [
            publicationId,
            faker.datatype.number({ min: 0, max: 1000 }),
            faker.random.arrayElement(['free', 'paid', 'premium']),
            faker.date.recent(30)
          ]);
        }
      }

      await client.query('COMMIT');
      logInfo('Successfully seeded test data');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    const err = error as Error;
    logError('Failed to seed test data', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: err.message,
      stack: err.stack
    });
    throw error;
  } finally {
    await pool.end();
  }
};