// msw v1.x
import { rest } from 'msw';
import { 
  fetchPosts, 
  createPost, 
  fetchSubscriptions, 
  authenticateUser 
} from '../../src/lib/api';

/**
 * Human Tasks:
 * 1. Configure MSW to use these handlers in test environment
 * 2. Update mock response data based on test requirements
 * 3. Add error scenarios for comprehensive testing
 * 4. Verify response formats match API contracts
 */

/**
 * @requirement Testing Framework
 * Location: Technical Specification/Development & Deployment/Testing
 * Sets up mock handlers for API endpoints to simulate backend responses during testing
 */
export const setupMockHandlers = () => {
  return [
    // Mock handler for fetching posts
    rest.get('/posts', (req, res, ctx) => {
      const publicationId = req.url.searchParams.get('publicationId');
      
      if (!publicationId) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Publication ID is required' })
        );
      }

      return res(
        ctx.status(200),
        ctx.json([
          {
            id: '1',
            title: 'Test Post 1',
            content: {
              doc: { nodeSize: 10 },
              selection: { from: 0, to: 0 }
            },
            author: {
              id: 'author1',
              email: 'author1@test.com',
              role: 'writer'
            },
            publication: {
              id: publicationId,
              name: 'Test Publication'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      );
    }),

    // Mock handler for creating posts
    rest.post('/posts', async (req, res, ctx) => {
      const post = await req.json();

      if (!post.title || !post.content) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Invalid post data' })
        );
      }

      return res(
        ctx.status(201),
        ctx.json({
          ...post,
          id: 'new-post-id',
          author: {
            id: 'author1',
            email: 'author1@test.com',
            role: 'writer'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      );
    }),

    // Mock handler for fetching subscriptions
    rest.get('/subscriptions', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: 'sub1',
            tier: 'premium',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            publication: {
              id: 'pub1',
              name: 'Test Publication'
            }
          }
        ])
      );
    }),

    // Mock handler for user authentication
    rest.post('/auth/login', async (req, res, ctx) => {
      const credentials = await req.json();

      if (!credentials.email || !credentials.password) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'Email and password are required' })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: 'user1',
            email: credentials.email,
            role: 'subscriber',
            token: 'mock-jwt-token'
          },
          token: 'mock-jwt-token'
        })
      );
    })
  ];
};