// react v18.x
'use client';
import React from 'react';

// Internal component imports
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';

// Import global styles
import '../styles/globals.css';

/**
 * Human Tasks:
 * 1. Verify that all layout components are properly configured for SSR
 * 2. Test layout responsiveness across different screen sizes
 * 3. Review accessibility implementation with WCAG guidelines
 * 4. Configure analytics tracking for layout interactions
 */

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable layout component that adheres to the design system and
 * integrates key UI components like Header, Footer, and Navigation.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Substack Replica</title>
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Main Navigation with Header */}
          <Navigation>
            {/* Main Content Area */}
            <main className="flex-grow">
              <div className="container mx-auto px-4 py-8">
                {children}
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </Navigation>
        </div>
      </body>
    </html>
  );
};

export default Layout;