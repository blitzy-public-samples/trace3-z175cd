// msw v1.x
import { setupServer } from 'msw/node';
import { setupMockHandlers } from './handlers';

/**
 * Human Tasks:
 * 1. Configure environment variables for test environment
 * 2. Set up test cleanup to reset mock server state between tests
 * 3. Verify mock server responses match API contracts
 * 4. Add error scenarios for comprehensive testing coverage
 */

/**
 * @requirement Testing Framework
 * Location: Technical Specification/Development & Deployment/Testing
 * Creates and configures the MSW mock server instance for intercepting API requests during tests
 */
const server = setupServer(...setupMockHandlers());

/**
 * @requirement Testing Framework
 * Location: Technical Specification/Development & Deployment/Testing
 * Initializes the mock server and starts intercepting API requests
 */
export const initializeMockServer = (): void => {
  // Start intercepting requests
  server.listen({
    onUnhandledRequest: 'warn' // Warn about unhandled requests during tests
  });

  // Log when requests are intercepted (helpful for debugging)
  server.events.on('request:start', ({ request }) => {
    console.log('Intercepted:', request.method, request.url);
  });

  // Log when responses are sent (helpful for debugging)
  server.events.on('response:mocked', ({ request, response }) => {
    console.log('Mocked Response:', request.method, request.url, response.status);
  });

  // Log any request handler errors
  server.events.on('request:unhandled', ({ request }) => {
    console.warn(
      'Found an unhandled %s request to %s',
      request.method,
      request.url
    );
  });
};

// Export the server instance for use in test setup/teardown
export const mockServer = server;