'use client';

// React v18.x
import React, { useState, useEffect } from 'react';

// Internal imports
import { Post } from '../../../../types/post';
import { fetchPosts } from '../../../../lib/api';
import { PostPreview } from '../../../../components/posts/PostPreview';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';

/**
 * Human Tasks:
 * 1. Configure error monitoring for API request failures
 * 2. Review accessibility requirements for post content display
 * 3. Test loading states across different network conditions
 * 4. Verify SEO meta tags implementation
 */

interface PostPageProps {
  params: {
    publication: string;
    slug: string;
  };
}

/**
 * @requirement Content Presentation
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A dynamic page component that displays a single post based on its slug.
 */
const PostPage: React.FC<PostPageProps> = ({ params }) => {
  // State for post data and loading state
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post data when component mounts
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch posts for the publication
        const posts = await fetchPosts(params.publication);
        
        // Find the post matching the slug
        const foundPost = posts.find(p => {
          const postSlug = p.title.toLowerCase().replace(/\s+/g, '-');
          return postSlug === params.slug;
        });

        if (!foundPost) {
          throw new Error('Post not found');
        }

        setPost(foundPost);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
        console.error('Error loading post:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params.publication, params.slug]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          // Loading state
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center text-red-600 p-8">
            <h2 className="text-2xl font-semibold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        ) : post ? (
          // Post content
          <article className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h1>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-4">By {post.author.email}</span>
                <time dateTime={post.createdAt.toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </header>

            {/* Post preview component */}
            <PostPreview post={post} />
          </article>
        ) : (
          // Not found state
          <div className="text-center text-gray-600 p-8">
            <h2 className="text-2xl font-semibold mb-4">Post Not Found</h2>
            <p>The requested post could not be found.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PostPage;