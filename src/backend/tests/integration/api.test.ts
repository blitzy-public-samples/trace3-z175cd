/**
 * @fileoverview Integration tests for the API layer, validating the interaction between routes,
 * controllers, middleware, and services.
 * 
 * Requirements Addressed:
 * - API Integration Testing (Technical Specification/Development & Deployment/Testing):
 *   Ensures that API endpoints function correctly by testing the interaction between
 *   routes, controllers, and middleware.
 * 
 * Human Tasks:
 * - Configure test database with appropriate test data
 * - Set up test environment variables
 * - Configure test coverage reporting
 * - Set up CI/CD pipeline for running integration tests
 */

// supertest v6.3.3
import request from 'supertest';
// jest v29.0.0
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

// Import application and routes
import { initializeApp } from '../../src/app';
import { analyticsRouter } from '../../src/analytics/routes/analytics.routes';
import { authRoutes } from '../../src/auth/routes/auth.routes';
import contentRoutes from '../../src/content/routes/content.routes';
import paymentRoutes from '../../src/payment/routes/payment.routes';

// Import test helpers
import testHelpers from '../utils/testHelpers';

// Initialize Express app for testing
const app = initializeApp();

describe('API Integration Tests', () => {
  // Test data
  let testUser: any;
  let testToken: string;
  let testPost: any;
  let testComment: any;

  beforeAll(async () => {
    // Generate test data
    testUser = testHelpers.generateMockData('user');
    testPost = testHelpers.generateMockData('article');
    testComment = testHelpers.generateMockData('comment');
  });

  afterAll(async () => {
    // Clean up test data if needed
  });

  describe('Authentication Routes', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          role: testUser.role
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      testToken = response.body.token;
    });

    test('POST /api/auth/login - should authenticate user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('GET /api/auth/validate - should validate JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payload).toHaveProperty('userId');
    });
  });

  describe('Content Routes', () => {
    test('POST /api/content/posts - should create a new post', async () => {
      const response = await request(app)
        .post('/api/content/posts')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: testPost.title,
          content: testPost.content,
          authorId: testUser.id
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      testPost.id = response.body.data.id;
    });

    test('GET /api/content/posts/:id - should retrieve a post', async () => {
      const response = await request(app)
        .get(`/api/content/posts/${testPost.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('title', testPost.title);
    });

    test('POST /api/content/posts/:postId/comments - should add comment to post', async () => {
      const response = await request(app)
        .post(`/api/content/posts/${testPost.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          content: testComment.content,
          userId: testUser.id
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Comment created successfully');
    });
  });

  describe('Analytics Routes', () => {
    test('GET /api/analytics/engagement - should retrieve engagement metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/engagement')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          granularity: 'daily'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
    });

    test('GET /api/analytics/revenue - should retrieve revenue metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue')
        .set('Authorization', `Bearer ${testToken}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          granularity: 'monthly'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('metrics');
    });
  });

  describe('Payment Routes', () => {
    test('POST /api/payment/process - should process a payment', async () => {
      const response = await request(app)
        .post('/api/payment/process')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          amount: 1000,
          currency: 'USD',
          customerId: testUser.id,
          description: 'Test payment'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/payment/subscription - should create a subscription', async () => {
      const response = await request(app)
        .post('/api/payment/subscription')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUser.id,
          tierId: 'test-tier-id',
          customerId: 'test-customer-id'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error.code', '404_NOT_FOUND');
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/analytics/revenue');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error.code', 'UNAUTHORIZED_ACCESS');
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error.code', 'VALIDATION_ERROR');
    });
  });
});