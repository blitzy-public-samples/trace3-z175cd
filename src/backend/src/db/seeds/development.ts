/**
 * @fileoverview Development database seeder that populates the database with initial test data.
 * 
 * Requirements Addressed:
 * - Database Seeding (Technical Specification/Database Design/Data Management Strategy)
 *   Provides initial data for development and testing environments, ensuring consistent 
 *   and predictable database states.
 * 
 * Human Tasks:
 * 1. Ensure PostgreSQL database is running and accessible
 * 2. Verify DATABASE_URL environment variable is set correctly
 * 3. Run database migrations before seeding
 * 4. Review seed data to ensure it matches testing requirements
 */

import { initializeDatabase } from '../../common/config/database';
import { User } from '../../auth/models/User';
import { Publication } from '../../content/models/Publication';
import { Post } from '../../content/models/Post';
import { Subscription } from '../../payment/models/Subscription';
import { SubscriptionTier } from '../../payment/models/SubscriptionTier';
import { encrypt } from '../../common/utils/encryption';
import { logInfo } from '../../common/utils/logger';
import { ROLES } from '../../common/constants/roles';

// Seed data for development environment
const seedData = {
  users: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: ROLES.ADMIN,
      isVerified: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'writer@example.com',
      password: 'Writer123!',
      role: ROLES.WRITER,
      isVerified: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'subscriber@example.com',
      password: 'Sub123!',
      role: ROLES.SUBSCRIBER,
      isVerified: true
    }
  ],
  publications: [
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Tech Insights',
      description: 'Latest insights in technology and software development'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: 'Business Weekly',
      description: 'Analysis of business trends and market developments'
    }
  ],
  posts: [
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'Getting Started with TypeScript',
      content: 'TypeScript is a powerful superset of JavaScript...',
      authorId: '550e8400-e29b-41d4-a716-446655440001',
      publicationId: '550e8400-e29b-41d4-a716-446655440003'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      title: 'Market Analysis 2023',
      content: 'An in-depth analysis of market trends...',
      authorId: '550e8400-e29b-41d4-a716-446655440001',
      publicationId: '550e8400-e29b-41d4-a716-446655440004'
    }
  ],
  subscriptionTiers: [
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Basic',
      price: 9.99,
      currency: 'USD',
      description: 'Access to basic content and features'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Premium',
      price: 19.99,
      currency: 'USD',
      description: 'Full access to all content and premium features'
    }
  ],
  subscriptions: [
    {
      id: '550e8400-e29b-41d4-a716-446655440009',
      userId: '550e8400-e29b-41d4-a716-446655440002',
      tierId: '550e8400-e29b-41d4-a716-446655440007',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-01-01'),
      status: 'active'
    }
  ]
};

/**
 * Seeds the database with initial development data.
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    logInfo('Starting database seeding process...');

    // Initialize database connection
    const pool = initializeDatabase();

    // Seed users
    logInfo('Seeding users...');
    for (const userData of seedData.users) {
      const user = new User(
        userData.id,
        userData.email,
        userData.password,
        userData.role,
        userData.isVerified
      );
      await pool.query(
        `INSERT INTO users (id, email, password, role, is_verified)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, encrypt(userData.password, process.env.ENCRYPTION_KEY || '').encryptedData, user.role, user.isVerified]
      );
    }

    // Seed publications
    logInfo('Seeding publications...');
    for (const pubData of seedData.publications) {
      const publication = new Publication(
        pubData.id,
        pubData.name,
        pubData.description,
        new Date(),
        new Date()
      );
      await pool.query(
        `INSERT INTO publications (id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [publication.id, publication.name, publication.description]
      );
    }

    // Seed posts
    logInfo('Seeding posts...');
    for (const postData of seedData.posts) {
      const post = new Post(
        postData.id,
        postData.title,
        postData.content,
        postData.authorId,
        postData.publicationId,
        new Date(),
        new Date()
      );
      await pool.query(
        `INSERT INTO posts (id, title, content, author_id, publication_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [post.id, post.title, post.content, post.authorId, post.publicationId]
      );
    }

    // Seed subscription tiers
    logInfo('Seeding subscription tiers...');
    for (const tierData of seedData.subscriptionTiers) {
      const tier = new SubscriptionTier(
        tierData.id,
        tierData.name,
        tierData.price,
        tierData.currency,
        tierData.description
      );
      await pool.query(
        `INSERT INTO subscription_tiers (id, name, price, currency, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [tier.id, tier.name, tier.price, tier.currency, tier.description]
      );
    }

    // Seed subscriptions
    logInfo('Seeding subscriptions...');
    for (const subData of seedData.subscriptions) {
      const subscription = new Subscription(
        subData.id,
        subData.userId,
        subData.tierId,
        subData.startDate,
        subData.endDate,
        subData.status
      );
      await pool.query(
        `INSERT INTO subscriptions (id, user_id, tier_id, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [subscription.id, subscription.userId, subscription.tierId, subscription.startDate, subscription.endDate, subscription.status]
      );
    }

    logInfo('Database seeding completed successfully');
  } catch (error) {
    logInfo(`Database seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};