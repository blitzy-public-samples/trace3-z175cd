// React v18.x
import React, { useState, useEffect } from 'react';
import { PostCard } from './PostCard';
import { formatPostSummary } from '../../utils/format';
import useAuth from '../../hooks/useAuth';
import useMedia from '../../hooks/useMedia';

/**
 * Human Tasks:
 * 1. Review pagination configuration for optimal performance
 * 2. Test post filtering with large datasets
 * 3. Verify accessibility of post list navigation
 * 4. Configure media optimization settings
 */

interface Post {
  id: string;
  title: string;
  content: any;
  author: {
    id: string;
    email: string;
    avatarUrl?: string;
  };
  publication: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PostListProps {
  /** Optional initial posts to display */
  initialPosts?: Post[];
  /** Optional filter criteria */
  filter?: {
    publication?: string;
    author?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  /** Optional page size for pagination */
  pageSize?: number;
}

/**
 * @requirement Content Presentation
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A component that displays a paginated and filterable list of posts.
 */
const PostList: React.FC<PostListProps> = ({
  initialPosts = [],
  filter,
  pageSize = 10
}) => {
  // State management
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom hooks
  const { isAuthenticated, user } = useAuth();
  const { mediaList, uploadMedia, removeMedia } = useMedia();

  /**
   * @requirement Content Creation
   * Location: Technical Specification/Core Features/Content Creation
   * Handles post deletion with media cleanup
   */
  const handleDelete = async (postId: string) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required to delete posts');
      }

      setIsLoading(true);
      
      // Remove associated media first
      const postMedia = mediaList.filter(media => 
        media.id.startsWith(`post-${postId}`)
      );
      
      await Promise.all(postMedia.map(media => removeMedia(media.id)));

      // Update posts list
      setPosts(currentPosts => 
        currentPosts.filter(post => post.id !== postId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * @requirement Authentication State Management
   * Location: Technical Specification/System Design/Cross-Cutting Concerns
   * Checks if user has permission to edit a post
   */
  const canEditPost = (post: Post): boolean => {
    if (!isAuthenticated || !user) return false;
    return post.author.id === user.id;
  };

  // Filter posts based on criteria
  const filteredPosts = posts.filter(post => {
    if (!filter) return true;

    const matchesPublication = !filter.publication || 
      post.publication.id === filter.publication;

    const matchesAuthor = !filter.author || 
      post.author.id === filter.author;

    const matchesDateRange = !filter.dateRange ||
      (post.createdAt >= filter.dateRange.start && 
       post.createdAt <= filter.dateRange.end);

    return matchesPublication && matchesAuthor && matchesDateRange;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Load posts on mount and when filter changes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Reset to first page when filter changes
        setCurrentPage(1);

        // Format post summaries
        const formattedPosts = posts.map(post => ({
          ...post,
          summary: formatPostSummary(post)
        }));

        setPosts(formattedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [filter]);

  if (error) {
    return (
      <div className="text-red-600 p-4 rounded-md bg-red-50">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={canEditPost(post) ? () => {
              // Handle edit action
            } : undefined}
            onDelete={canEditPost(post) ? () => handleDelete(post.id) : undefined}
          />
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;