// react-redux v8.x
import { useDispatch, useSelector } from 'react-redux';

// Internal imports
import { authenticateUser } from '../lib/api';
import { validateAuthUser } from '../utils/validation';
import axiosInstance from '../lib/axios';

/**
 * Human Tasks:
 * 1. Configure Redux store with authentication state slice
 * 2. Set up secure token storage mechanism
 * 3. Implement token refresh logic
 * 4. Configure authentication error monitoring
 */

// Types for the authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Types for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * @requirement Authentication State Management
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Custom hook for managing user authentication state and operations
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: { auth: AuthState }) => state.auth);

  /**
   * Handles user login by authenticating credentials and updating state
   * @param credentials - Object containing user email and password
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'auth/loginStart' });

      const response = await authenticateUser(credentials);

      // Validate the authenticated user data
      if (!validateAuthUser(response.user)) {
        throw new Error('Invalid user data received from server');
      }

      // Update axios instance with new token
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

      // Store token securely
      localStorage.setItem('auth_token', response.token);

      dispatch({
        type: 'auth/loginSuccess',
        payload: {
          user: response.user,
          token: response.token
        }
      });
    } catch (error) {
      dispatch({
        type: 'auth/loginFailure',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  };

  /**
   * Handles user logout by clearing authentication state
   */
  const logout = () => {
    try {
      // Remove token from axios instance
      delete axiosInstance.defaults.headers.common['Authorization'];

      // Clear stored token
      localStorage.removeItem('auth_token');

      dispatch({ type: 'auth/logout' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  /**
   * Checks if the current session is authenticated
   */
  const checkAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return false;
      }

      // Verify token is still valid
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds

      if (Date.now() >= expirationTime) {
        logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;