// jest v29.x
// @reduxjs/toolkit v1.9.x

import { actions, reducer } from '../../src/store/authSlice';
import { setupTestingEnvironment } from '../setup';

/**
 * Human Tasks:
 * 1. Ensure Redux DevTools is configured for development environment
 * 2. Verify that authentication error messages are properly localized
 * 3. Review token storage security measures in production environment
 */

/**
 * @requirement Authentication State Management Testing
 * Location: Technical Specification/Development & Deployment/Testing
 * Tests the Redux authSlice to ensure proper state management for authentication
 */

describe('authSlice', () => {
  // Set up test environment before running tests
  beforeAll(() => {
    setupTestingEnvironment();
  });

  describe('login action', () => {
    it('should handle pending login state', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'idle',
        error: null
      };

      const nextState = reducer(initialState, actions.login.pending);

      expect(nextState).toEqual({
        user: null,
        token: null,
        status: 'loading',
        error: null
      });
    });

    it('should handle successful login', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'loading',
        error: null
      };

      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'subscriber'
      };

      const mockToken = 'mock-jwt-token';

      const nextState = reducer(
        initialState,
        actions.login.fulfilled({
          user: mockUser,
          token: mockToken
        })
      );

      expect(nextState).toEqual({
        user: mockUser,
        token: mockToken,
        status: 'idle',
        error: null
      });
    });

    it('should handle login failure', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'loading',
        error: null
      };

      const mockError = 'Invalid credentials';

      const nextState = reducer(
        initialState,
        actions.login.rejected(new Error(mockError))
      );

      expect(nextState).toEqual({
        user: null,
        token: null,
        status: 'failed',
        error: mockError
      });
    });
  });

  describe('logout action', () => {
    it('should clear auth state on logout', () => {
      const initialState = {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'subscriber'
        },
        token: 'existing-token',
        status: 'idle',
        error: null
      };

      const nextState = reducer(initialState, actions.logout());

      expect(nextState).toEqual({
        user: null,
        token: null,
        status: 'idle',
        error: null
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors during login', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'loading',
        error: null
      };

      const mockError = 'Network Error';

      const nextState = reducer(
        initialState,
        actions.login.rejected(new Error(mockError))
      );

      expect(nextState).toEqual({
        user: null,
        token: null,
        status: 'failed',
        error: mockError
      });
    });

    it('should clear error state on new login attempt', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'failed',
        error: 'Previous error'
      };

      const nextState = reducer(initialState, actions.login.pending);

      expect(nextState).toEqual({
        user: null,
        token: null,
        status: 'loading',
        error: null
      });
    });
  });

  describe('state persistence', () => {
    it('should maintain state immutability', () => {
      const initialState = {
        user: null,
        token: null,
        status: 'idle',
        error: null
      };

      const intermediateState = reducer(initialState, actions.login.pending);
      const finalState = reducer(intermediateState, actions.login.rejected(new Error('Test error')));

      // Verify original state wasn't mutated
      expect(initialState).toEqual({
        user: null,
        token: null,
        status: 'idle',
        error: null
      });

      // Verify intermediate state wasn't mutated
      expect(intermediateState).toEqual({
        user: null,
        token: null,
        status: 'loading',
        error: null
      });

      // Verify final state is correct
      expect(finalState).toEqual({
        user: null,
        token: null,
        status: 'failed',
        error: 'Test error'
      });
    });
  });
});