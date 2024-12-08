// react v18.x
import React, { useState, useEffect } from 'react';
// clsx v1.x
import clsx from 'clsx';

// Internal imports
import Header from './Header';
import { actions } from '../../store/uiSlice';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

/**
 * Human Tasks:
 * 1. Configure theme colors in Tailwind config to match design system
 * 2. Review mobile breakpoint values with design team
 * 3. Test keyboard navigation accessibility
 * 4. Set up analytics tracking for sidebar interactions
 */

interface SidebarProps {
  className?: string;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable sidebar component that adheres to the design system and
 * supports responsive navigation and user interactions.
 */
const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  // Local state for sidebar visibility and interactions
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Hooks for authentication and notifications
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sidebar container classes
  const sidebarClasses = clsx(
    'fixed left-0 top-0 h-full bg-white dark:bg-gray-900',
    'transition-all duration-300 ease-in-out',
    'border-r border-gray-200 dark:border-gray-800',
    'flex flex-col',
    {
      'w-64': isExpanded,
      'w-20': !isExpanded,
      '-translate-x-full': isMobile && !isExpanded,
    },
    className
  );

  // Navigation item classes
  const navItemClasses = clsx(
    'flex items-center px-4 py-3',
    'text-gray-700 dark:text-gray-300',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'transition-colors duration-200'
  );

  // Toggle sidebar expansion
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    addToast(
      `Sidebar ${!isExpanded ? 'expanded' : 'collapsed'}`,
      'info',
      2000
    );
  };

  return (
    <>
      <Header />
      <aside className={sidebarClasses}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {isExpanded && (
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Navigation
            </span>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isExpanded ? (
                <path d="M15 19l-7-7 7-7" />
              ) : (
                <path d="M9 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <a href="/dashboard" className={navItemClasses}>
            <svg
              className="h-6 w-6 mr-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isExpanded && <span>Dashboard</span>}
          </a>

          <a href="/explore" className={navItemClasses}>
            <svg
              className="h-6 w-6 mr-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isExpanded && <span>Explore</span>}
          </a>

          <a href="/publications" className={navItemClasses}>
            <svg
              className="h-6 w-6 mr-3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
            </svg>
            {isExpanded && <span>Publications</span>}
          </a>

          {isAuthenticated && (
            <a href="/settings" className={navItemClasses}>
              <svg
                className="h-6 w-6 mr-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isExpanded && <span>Settings</span>}
            </a>
          )}
        </nav>

        {/* User Section */}
        {isAuthenticated && user && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              {isExpanded && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;