/**
 * @fileoverview Redux slice for managing authentication state
 * Addresses requirement: Authentication State Management
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Purpose: Implements centralized state management for user authentication
 */

// @reduxjs/toolkit v1.9.x
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthResponse } from '../types/auth';
import { authenticateUser } from '../lib/api';

/**
 * Human Tasks:
 * 1. Configure Redux DevTools for development environment
 * 2. Set up persistence for auth state if required
 * 3. Review token storage security measures
 * 4. Configure automatic token refresh mechanism
 */

// Define the initial state type
interface AuthState {
  user: AuthResponse['user'] | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null
};

/**
 * Async thunk for handling user login
 * Addresses requirement: Authentication State Management
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authenticateUser(credentials);
    return response;
  }
);

/**
 * Authentication slice containing reducers and actions
 * Addresses requirement: Authentication State Management
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous reducer for logging out
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      // Clear stored token from localStorage
      localStorage.removeItem('auth_token');
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle the pending state of login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // Handle successful login
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      // Handle login failure
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
        state.user = null;
        state.token = null;
      });
  }
});

// Export actions
export const { logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;