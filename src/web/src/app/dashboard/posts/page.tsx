'use client';

// React v18.x
import React, { useState, useEffect } from 'react';

// Import internal dependencies with relative paths
import PostList from '../../../components/posts/PostList';
import { fetchPosts } from '../../../lib/api';
import useAuth from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Post } from '../../../types/post';

/**
 * Human Tasks:
 * 1. Configure error monitoring for post fetching failures
 * 2. Review pagination settings for optimal performance
 * 3. Set up analytics tracking for post management actions
 * 4. Verify accessibility of post management interface
 */

/**
 * @requirement Content Management
 * Location: Technical Specification/Core Features/Content Creation
 * A dashboard page component for managing posts, providing functionality for
 * listing, creating, editing, and deleting posts.
 */
const DashboardPostsPage: React.FC = () => {
  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  /**
   * @requirement Content Management
   * Location: Technical Specification/Core Features/Content Creation
   * Fetches posts from the API when the component mounts
   */
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Only fetch posts if user is authenticated
        if (!isAuthenticated || !user) {
          throw new Error('Authentication required to view posts');
        }

        const fetchedPosts = await fetchPosts(user.id);
        setPosts(fetchedPosts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load posts';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [isAuthenticated, user, addToast]);

  /**
   * @requirement User Interface Design
   * Location: Technical Specification/User Interface Design/Interface Elements
   * Renders the dashboard interface with appropriate loading and error states
   */
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800">
            Authentication Required
          </h2>
          <p className="mt-2 text-red-600">
            Please log in to access the posts dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-800">Error</h2>
        <p className="mt-2 text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Posts Dashboard
        </h1>
        <button
          onClick={() => {
            // Navigation to create post page will be handled by the parent router
            window.location.href = '/dashboard/posts/create';
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
            transition-colors duration-200 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2"
        >
          Create New Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
        </div>
      ) : (
        <PostList
          initialPosts={posts}
          pageSize={10}
          filter={{
            author: user?.id
          }}
        />
      )}
    </div>
  );
};

export default DashboardPostsPage;