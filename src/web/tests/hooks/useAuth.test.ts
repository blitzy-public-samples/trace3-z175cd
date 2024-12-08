// @testing-library/react-hooks v7.x
import { renderHook, act } from '@testing-library/react-hooks';
// jest v29.x
import { jest } from '@jest/globals';

// Internal imports
import useAuth from '../../src/hooks/useAuth';
import { initializeMockServer, mockServer } from '../mocks/server';
import { setupMockHandlers } from '../mocks/handlers';
import { setupTestingEnvironment } from '../setup';

/**
 * Human Tasks:
 * 1. Ensure Redux store is properly configured in test environment
 * 2. Verify mock server responses match authentication API contract
 * 3. Add additional test cases for error scenarios
 * 4. Configure test cleanup for local storage between tests
 */

/**
 * @requirement Authentication State Management
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Test suite for the useAuth hook, verifying authentication state management and operations
 */
describe('useAuth Hook', () => {
  // Set up test environment before running tests
  beforeAll(() => {
    setupTestingEnvironment();
    initializeMockServer();
  });

  // Clean up after each test
  afterEach(() => {
    localStorage.clear();
    mockServer.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    mockServer.close();
  });

  /**
   * @requirement Authentication State Management
   * Tests the initial state of the useAuth hook
   */
  it('should initialize with default authentication state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  /**
   * @requirement Authentication State Management
   * Tests successful login functionality
   */
  it('should handle successful login', async () => {
    const { result } = renderHook(() => useAuth());

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(expect.objectContaining({
      id: 'user1',
      email: credentials.email,
      role: 'subscriber'
    }));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
  });

  /**
   * @requirement Authentication State Management
   * Tests login failure handling
   */
  it('should handle login failure', async () => {
    const { result } = renderHook(() => useAuth());

    // Set up mock server to return error
    mockServer.use(
      ...setupMockHandlers().map(handler => 
        handler.path === '/auth/login' 
          ? handler.respond((req, res, ctx) => {
              return res(
                ctx.status(401),
                ctx.json({ error: 'Invalid credentials' })
              );
            })
          : handler
      )
    );

    const credentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    await act(async () => {
      try {
        await result.current.login(credentials);
      } catch (error) {
        // Error is expected
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  /**
   * @requirement Authentication State Management
   * Tests logout functionality
   */
  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());

    // First login
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await act(async () => {
      await result.current.login(credentials);
    });

    // Then logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  /**
   * @requirement Authentication State Management
   * Tests authentication check functionality
   */
  it('should correctly check authentication status', async () => {
    const { result } = renderHook(() => useAuth());

    // Initially not authenticated
    expect(result.current.checkAuth()).toBe(false);

    // Set up mock token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiI5OTk5OTk5OTk5In0.signature';
    localStorage.setItem('auth_token', mockToken);

    // Should now be authenticated
    expect(result.current.checkAuth()).toBe(true);

    // Test with expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNjAwMDAwMDAwIn0.signature';
    localStorage.setItem('auth_token', expiredToken);

    expect(result.current.checkAuth()).toBe(false);
  });

  /**
   * @requirement Authentication State Management
   * Tests loading state during authentication operations
   */
  it('should manage loading state during authentication', async () => {
    const { result } = renderHook(() => useAuth());

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    let loadingState = false;
    await act(async () => {
      const loginPromise = result.current.login(credentials);
      loadingState = result.current.loading;
      await loginPromise;
    });

    expect(loadingState).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});