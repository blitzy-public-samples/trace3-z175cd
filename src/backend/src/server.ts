/**
 * @fileoverview The main server entry point for the backend application. It initializes the Express
 * application, sets up middleware, configures routes, and starts the server.
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
 * 1. Configure environment variables in .env file
 * 2. Set up SSL certificates for HTTPS in production
 * 3. Configure monitoring and alerting for server health
 * 4. Review and adjust server timeouts and limits based on load testing
 */

// dotenv v16.0.3
import dotenv from 'dotenv';

// Internal imports
import { initializeApp } from './app';
import { logger } from './common/utils/logger';

/**
 * Starts the Express server and listens for incoming requests.
 * Handles server initialization, error handling, and graceful shutdown.
 */
export const startServer = async (): Promise<void> => {
  try {
    // Load environment variables from .env file
    dotenv.config();

    // Log server startup attempt
    logger.logInfo('Starting server initialization...');

    // Get port from environment variables or use default
    const port = process.env.PORT || 3000;

    // Initialize Express application with middleware and routes
    const app = initializeApp();

    // Start the server
    const server = app.listen(port, () => {
      logger.logInfo(`Server started successfully on port ${port}`);
      logger.logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      logger.logError('Server error occurred', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.logInfo('SIGTERM received. Starting graceful shutdown...');
      server.close(() => {
        logger.logInfo('Server closed successfully');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        logger.logError('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    });

  } catch (error) {
    // Log startup error
    logger.logError('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
};

// Start the server if this is the main module
if (require.main === module) {
  startServer().catch((error) => {
    logger.logError('Unhandled error during server startup', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  });
}