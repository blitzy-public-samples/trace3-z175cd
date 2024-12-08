// react v18.x
import React, { useState, useEffect } from 'react';
// clsx v1.x
import clsx from 'clsx';
// Internal imports
import { actions } from '../../store/uiSlice';
import useAuth from '../../hooks/useAuth';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Configure theme colors in Tailwind config to match design system
 * 2. Set up analytics tracking for header interactions
 * 3. Review mobile breakpoint values with design team
 * 4. Test keyboard navigation accessibility
 */

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable header component that adheres to the design system and
 * supports branding, navigation, and user interactions.
 */
const Header: React.FC = () => {
  // Local state for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Local state for scroll position
  const [isScrolled, setIsScrolled] = useState(false);

  // Get authentication state and methods
  const { isAuthenticated, user, logout } = useAuth();

  // Handle scroll events to update header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header container classes based on scroll state
  const headerClasses = clsx(
    'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
    'bg-white dark:bg-gray-900',
    {
      'shadow-md': isScrolled,
      'border-b border-gray-200 dark:border-gray-800': !isScrolled
    }
  );

  // Navigation menu classes
  const navClasses = clsx(
    'hidden md:flex items-center space-x-6',
    'text-gray-600 dark:text-gray-300'
  );

  // Mobile menu classes
  const mobileMenuClasses = clsx(
    'md:hidden absolute top-full left-0 right-0',
    'bg-white dark:bg-gray-900 shadow-lg',
    'transition-transform duration-200 ease-in-out',
    {
      'translate-y-0': isMobileMenuOpen,
      '-translate-y-full': !isMobileMenuOpen
    }
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and branding */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Substack Replica
          </a>
        </div>

        {/* Desktop navigation */}
        <nav className={navClasses}>
          <a href="/explore" className="hover:text-blue-600 dark:hover:text-blue-400">
            Explore
          </a>
          <a href="/publications" className="hover:text-blue-600 dark:hover:text-blue-400">
            Publications
          </a>
          {isAuthenticated && (
            <a href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
              Dashboard
            </a>
          )}
        </nav>

        {/* Authentication controls */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-gray-600 dark:text-gray-300">
                {user?.email}
              </span>
              <Button
                label="Logout"
                variant="outline"
                onClick={logout}
              />
            </>
          ) : (
            <>
              <Button
                label="Login"
                variant="outline"
                onClick={() => window.location.href = '/login'}
              />
              <Button
                label="Sign Up"
                variant="primary"
                onClick={() => window.location.href = '/signup'}
              />
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
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
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div className={mobileMenuClasses}>
        <div className="px-4 py-3 space-y-3">
          <a
            href="/explore"
            className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Explore
          </a>
          <a
            href="/publications"
            className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Publications
          </a>
          {isAuthenticated && (
            <a
              href="/dashboard"
              className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Dashboard
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;