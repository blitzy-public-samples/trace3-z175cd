// react v18.x
import React from 'react';
// clsx v1.x
import clsx from 'clsx';

// Internal imports
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';
import { actions } from '../../../store/uiSlice';

/**
 * Human Tasks:
 * 1. Review responsive breakpoints with design team
 * 2. Test layout accessibility with screen readers
 * 3. Verify dark mode color scheme matches design system
 * 4. Configure analytics tracking for layout interactions
 */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable layout for the dashboard section, adhering to the design system
 * and supporting responsive navigation and user interactions.
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Main layout container classes
  const layoutClasses = clsx(
    'min-h-screen',
    'bg-gray-50 dark:bg-gray-900',
    'flex flex-col'
  );

  // Main content area classes
  const mainContentClasses = clsx(
    'flex-1',
    'ml-64', // Match sidebar width
    'p-8',
    'transition-all duration-300',
    'bg-gray-50 dark:bg-gray-900'
  );

  // Content wrapper classes
  const contentWrapperClasses = clsx(
    'max-w-7xl',
    'mx-auto',
    'w-full'
  );

  return (
    <div className={layoutClasses}>
      {/* Header Component */}
      <Header />

      {/* Sidebar Component */}
      <Sidebar className="pt-16" /> {/* Offset by header height */}

      {/* Main Content Area */}
      <main className={mainContentClasses}>
        <div className={contentWrapperClasses}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;