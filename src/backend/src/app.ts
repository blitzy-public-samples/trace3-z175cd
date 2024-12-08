/**
 * @fileoverview The main entry point for the backend application. Initializes Express,
 * sets up middleware, configures routes, and starts the server.
 * 
 * Requirements Addressed:
 * - Application Initialization (Technical Specification/System Design/API Design):
 *   Sets up the Express application, middleware, and routes for the backend.
 * - Middleware Integration (Technical Specification/Cross-Cutting Concerns):
 *   Integrates middleware for logging, validation, error handling, and other cross-cutting concerns.
 * - Route Configuration (Technical Specification/System Design/API Design):
 *   Configures API routes for different modules such as analytics, authentication, content, and payment.
 * 
 * Human Tasks:
 * - Configure environment variables in .env file
 * - Set up SSL certificates for HTTPS in production
 * - Configure CORS settings for allowed origins
 * - Set up monitoring and health check endpoints
 */

// express v4.18.2
import express from 'express';

// Import middleware
import LoggerMiddleware from './common/middleware/LoggerMiddleware';
import { validationMiddleware } from './common/middleware/ValidationMiddleware';
import { errorHandler } from './common/middleware/ErrorMiddleware';

// Import routes
import analyticsRouter from './analytics/routes/analytics.routes';
import authRoutes from './auth/routes/auth.routes';
import contentRoutes from './content/routes/content.routes';
import paymentRoutes from './payment/routes/payment.routes';

// Import logger
import { logInfo, logError } from './common/utils/logger';

/**
 * Initializes and configures the Express application with middleware and routes.
 * 
 * @returns The configured Express application instance
 */
export const initializeApp = (): express.Application => {
  try {
    // Create Express application instance
    const app = express();

    // Configure basic Express settings
    app.set('trust proxy', true);
    app.disable('x-powered-by');

    // Parse JSON and URL-encoded bodies
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Apply global middleware
    app.use(LoggerMiddleware);
    app.use(validationMiddleware);

    // Configure CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Configure API routes
    app.use('/api/analytics', analyticsRouter);
    app.use('/api/auth', authRoutes);
    app.use('/api/content', contentRoutes);
    app.use('/api/payment', paymentRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Handle 404 errors
    app.use((req, res) => {
      res.status(404).json({
        error: {
          code: '404_NOT_FOUND',
          message: 'Requested resource not found'
        }
      });
    });

    // Global error handler
    app.use(errorHandler);

    // Log successful initialization
    logInfo('Express application initialized successfully');

    return app;

  } catch (error) {
    // Log initialization error
    logError('Failed to initialize Express application', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};