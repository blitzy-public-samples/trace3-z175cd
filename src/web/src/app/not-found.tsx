// react v18.x
import React from 'react';
// Import components relatively from their locations
import { Button } from '../components/common/Button';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
// Import global styles
import '../styles/globals.css';

/**
 * Human Tasks:
 * 1. Verify that the error tracking system captures 404 occurrences
 * 2. Review accessibility compliance for error page content
 * 3. Test page layout across different screen sizes
 * 4. Ensure analytics are tracking 404 page visits
 */

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A custom 404 page component that provides a user-friendly message and navigation options
 * when users encounter non-existent routes.
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header component for consistent navigation */}
      <Header />

      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
            Please check the URL or navigate back to the homepage.
          </p>
          
          {/* Navigation button */}
          <Button
            label="Back to Homepage"
            onClick={() => window.location.href = '/'}
            variant="primary"
          />
        </div>
      </main>

      {/* Footer component for consistent branding */}
      <Footer />
    </div>
  );
};

export default NotFoundPage;