// axios v1.x
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Import internal types and utilities
import { validatePost } from '../utils/validation';
import { AuthResponse } from '../types/auth';
import { Subscription } from '../types/subscription';

/**
 * Human Tasks:
 * 1. Configure environment variables for API base URL
 * 2. Set up error monitoring integration
 * 3. Configure request retry policies
 * 4. Review and adjust timeout settings based on performance requirements
 */

/**
 * @requirement API Integration
 * Creates and configures a centralized Axios instance for consistent API communication
 * Location: Technical Specification/API Design/Integration Patterns
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000, // 10 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Request interceptor for authentication and request transformation
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Get auth token from local storage if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Validate post data if present
      if (config.method === 'post' && config.data) {
        const isValid = validatePost(config.data);
        if (!isValid) {
          throw new Error('Invalid post data structure');
        }
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and response transformation
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      // Transform auth response data if present
      if (response.config.url?.includes('/auth') && response.data) {
        const authResponse = response.data as AuthResponse;
        if (authResponse.token) {
          localStorage.setItem('auth_token', authResponse.token);
        }
      }

      // Transform subscription response data if present
      if (response.config.url?.includes('/subscription') && response.data) {
        const subscription = response.data as Subscription;
        // Ensure subscription data is valid
        if (subscription.id && subscription.tier && subscription.status) {
          // Additional subscription data processing if needed
        }
      }

      return response;
    },
    (error: AxiosError): Promise<AxiosError> => {
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Clear invalid auth token
            localStorage.removeItem('auth_token');
            // Redirect to login if needed
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            break;
          case 403:
            // Handle forbidden access
            console.error('Access forbidden:', error.response.data);
            break;
          case 429:
            // Handle rate limiting
            console.error('Rate limit exceeded:', error.response.data);
            break;
          default:
            // Log other errors
            console.error('API Error:', error.response.data);
        }
      } else if (error.request) {
        // Handle network errors
        console.error('Network Error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export the configured Axios instance
const axiosInstance = createAxiosInstance();

export default axiosInstance;