// react v18.x
import React, { useState, useEffect } from 'react';
// clsx v1.x
import clsx from 'clsx';

// Internal imports
import Header from './Header';
import Sidebar from './Sidebar';
import { actions } from '../../store/uiSlice';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

/**
 * Human Tasks:
 * 1. Configure theme colors in Tailwind config to match design system
 * 2. Review mobile breakpoint values with design team
 * 3. Test keyboard navigation accessibility
 * 4. Set up analytics tracking for navigation interactions
 */

interface NavigationProps {
  children: React.ReactNode;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable navigation component that adheres to the design system and
 * supports responsive navigation and user interactions.
 */
const Navigation: React.FC<NavigationProps> = ({ children }) => {
  // Local state for navigation visibility and interactions
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Hooks for authentication and notifications
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setIsSidebarOpen(!isMobile);
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main content container classes
  const mainContentClasses = clsx(
    'min-h-screen',
    'transition-all duration-300 ease-in-out',
    'bg-gray-50 dark:bg-gray-900',
    {
      'ml-64': isSidebarOpen && !isMobileView, // Sidebar width when open
      'ml-0': !isSidebarOpen || isMobileView,
    }
  );

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    addToast(
      `Sidebar ${!isSidebarOpen ? 'opened' : 'closed'}`,
      'info',
      2000
    );
  };

  // Overlay for mobile view when sidebar is open
  const overlayClasses = clsx(
    'fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity',
    {
      'opacity-100 pointer-events-auto': isMobileView && isSidebarOpen,
      'opacity-0 pointer-events-none': !isMobileView || !isSidebarOpen,
    }
  );

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar
        className={clsx('z-30', {
          'translate-x-0': isSidebarOpen,
          '-translate-x-full': !isSidebarOpen,
        })}
      />

      {/* Mobile Overlay */}
      <div
        className={overlayClasses}
        onClick={() => isMobileView && setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header />

        {/* Main Content */}
        <main className={mainContentClasses}>
          {/* Toggle Button for Mobile */}
          {isMobileView && (
            <button
              className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
              onClick={handleSidebarToggle}
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isSidebarOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}

          {/* Content Container */}
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Navigation;