// react v18.x
'use client';
import React, { useState, useEffect } from 'react';

// Internal imports with relative paths
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PostList from '../components/posts/PostList';
import { calculateEngagementRate } from '../utils/analytics';
import { formatToDisplayDate } from '../utils/date';
import { store } from '../store';

// Import global styles
import '../styles/globals.css';

/**
 * Human Tasks:
 * 1. Configure analytics tracking for landing page interactions
 * 2. Review and optimize image loading strategies
 * 3. Test responsive layout across different devices
 * 4. Verify SEO meta tags implementation
 */

interface FeaturedPost {
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
  engagementMetrics: {
    views: number;
    clicks: number;
    shares: number;
  };
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements the landing page with a consistent layout, navigation, and content presentation.
 */
const LandingPage: React.FC = () => {
  // State for featured posts and loading state
  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to fetch featured posts on component mount
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulated API call - replace with actual API integration
        const response = await fetch('/api/featured-posts');
        const data = await response.json();

        // Process and format the posts
        const processedPosts = data.map((post: FeaturedPost) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          formattedDate: formatToDisplayDate(new Date(post.createdAt)),
          engagementRate: calculateEngagementRate(post.engagementMetrics)
        }));

        setFeaturedPosts(processedPosts);
      } catch (err) {
        setError('Failed to load featured posts. Please try again later.');
        console.error('Error fetching featured posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  /**
   * @requirement Content Presentation
   * Location: Technical Specification/User Interface Design/Interface Elements
   * Displays a list of featured posts and publications in a visually appealing format.
   */
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Substack Replica
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover and support independent writers and publishers. Start reading or create your own publication today.
          </p>
        </section>

        {/* Featured Posts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Featured Publications
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <PostList
              initialPosts={featuredPosts}
              pageSize={6}
            />
          )}
        </section>

        {/* Call to Action Section */}
        <section className="bg-blue-50 dark:bg-blue-900 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Start Your Own Publication
          </h2>
          <p className="text-blue-700 dark:text-blue-200 mb-6">
            Join thousands of writers and create your own subscription-based publication.
          </p>
          <button
            onClick={() => window.location.href = '/signup'}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </section>
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default LandingPage;