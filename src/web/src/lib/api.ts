// axios v1.x
import axiosInstance from './axios';
import { validatePost } from '../utils/validation';
import { AuthResponse } from '../types/auth';
import { Post } from '../types/post';
import { Subscription } from '../types/subscription';

/**
 * Human Tasks:
 * 1. Configure error monitoring for API requests
 * 2. Set up retry policies for failed requests
 * 3. Review and adjust request timeouts based on performance requirements
 * 4. Configure rate limiting handling
 */

/**
 * @requirement API Integration
 * Location: Technical Specification/API Design/Integration Patterns
 * Fetches a list of posts from the backend API.
 * 
 * @param publicationId - The ID of the publication to fetch posts for
 * @returns Promise<Post[]> - A promise that resolves to an array of Post objects
 */
export const fetchPosts = async (publicationId: string): Promise<Post[]> => {
  try {
    const response = await axiosInstance.get('/posts', {
      params: {
        publicationId
      }
    });

    // Validate each post in the response
    const posts = response.data;
    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format: expected array of posts');
    }

    posts.forEach(post => {
      if (!validatePost(post)) {
        throw new Error(`Invalid post data structure for post ID: ${post.id}`);
      }
    });

    return posts;
  } catch (error) {
    // Let the axios interceptor handle the error
    throw error;
  }
};

/**
 * @requirement API Integration
 * Location: Technical Specification/API Design/Integration Patterns
 * Creates a new post by sending data to the backend API.
 * 
 * @param post - The post object to create
 * @returns Promise<Post> - A promise that resolves to the created Post object
 */
export const createPost = async (post: Post): Promise<Post> => {
  try {
    // Validate post data before sending
    if (!validatePost(post)) {
      throw new Error('Invalid post data structure');
    }

    const response = await axiosInstance.post('/posts', post);

    // Validate the response data
    const createdPost = response.data;
    if (!validatePost(createdPost)) {
      throw new Error('Invalid response data structure');
    }

    return createdPost;
  } catch (error) {
    // Let the axios interceptor handle the error
    throw error;
  }
};

/**
 * @requirement API Integration
 * Location: Technical Specification/API Design/Integration Patterns
 * Fetches a list of subscriptions from the backend API.
 * 
 * @returns Promise<Subscription[]> - A promise that resolves to an array of Subscription objects
 */
export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const response = await axiosInstance.get('/subscriptions');

    // Validate the response data
    const subscriptions = response.data;
    if (!Array.isArray(subscriptions)) {
      throw new Error('Invalid response format: expected array of subscriptions');
    }

    // The axios interceptor already validates subscription data
    return subscriptions;
  } catch (error) {
    // Let the axios interceptor handle the error
    throw error;
  }
};

/**
 * @requirement API Integration
 * Location: Technical Specification/API Design/Integration Patterns
 * Authenticates a user by sending credentials to the backend API.
 * 
 * @param credentials - Object containing user credentials (email and password)
 * @returns Promise<AuthResponse> - A promise that resolves to an AuthResponse object
 */
export const authenticateUser = async (credentials: { 
  email: string; 
  password: string; 
}): Promise<AuthResponse> => {
  try {
    // Validate credentials
    if (!credentials.email || !credentials.password) {
      throw new Error('Invalid credentials: email and password are required');
    }

    const response = await axiosInstance.post('/auth/login', credentials);

    // The axios interceptor already handles token storage and validation
    const authResponse = response.data as AuthResponse;

    // Additional validation of the auth response
    if (!authResponse.user || !authResponse.token) {
      throw new Error('Invalid authentication response');
    }

    return authResponse;
  } catch (error) {
    // Let the axios interceptor handle the error
    throw error;
  }
};