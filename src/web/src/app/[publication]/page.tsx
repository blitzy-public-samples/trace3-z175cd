'use client';

// React v18.x
import { useState, useEffect } from 'react';

// Internal imports with relative paths
import { Publication } from '../../types/publication';
import { calculateEngagementRate } from '../../utils/analytics';
import PostList from '../../components/posts/PostList';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

/**
 * Human Tasks:
 * 1. Configure analytics tracking for publication page views
 * 2. Set up error monitoring for API requests
 * 3. Review accessibility of publication content layout
 * 4. Verify responsive design breakpoints
 */

interface PublicationPageProps {
  params: {
    publication: string;
  };
}

/**
 * @requirement Content Presentation
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements the publication page component displaying publication details,
 * posts, and analytics data.
 */
const PublicationPage: React.FC<PublicationPageProps> = ({ params }) => {
  // State management
  const [publication, setPublication] = useState<Publication | null>(null);
  const [engagementRate, setEngagementRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch publication data and calculate analytics
  useEffect(() => {
    const fetchPublicationData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulated API call - replace with actual API integration
        const response = await fetch(`/api/publications/${params.publication}`);
        if (!response.ok) {
          throw new Error('Failed to fetch publication data');
        }

        const data: Publication = await response.json();
        setPublication(data);

        // Calculate engagement metrics
        const metrics = {
          views: data.posts.reduce((total, post) => total + (post.views || 0), 0),
          clicks: data.posts.reduce((total, post) => total + (post.clicks || 0), 0),
          shares: data.posts.reduce((total, post) => total + (post.shares || 0), 0)
        };

        const rate = calculateEngagementRate(metrics);
        setEngagementRate(rate);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicationData();
  }, [params.publication]);

  /**
   * @requirement User Interface Design
   * Location: Technical Specification/User Interface Design/Interface Elements
   * Renders the publication page layout with consistent header and footer.
   */
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        ) : publication ? (
          <div className="space-y-8">
            {/* Publication Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {publication.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {publication.description}
              </p>

              {/* Analytics Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{engagementRate}%</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-blue-600">{publication.posts.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {publication.subscriptions.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Latest Posts
              </h2>
              <PostList
                initialPosts={publication.posts}
                filter={{ publication: publication.id }}
                pageSize={10}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            No publication found
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PublicationPage;