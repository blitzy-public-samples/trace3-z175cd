// react v18.x
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Internal imports
import { handleDismiss } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';

/**
 * Human Tasks:
 * 1. Review error message copy with UX team
 * 2. Configure error tracking integration
 * 3. Set up error boundary monitoring
 * 4. Test error recovery flows with QA team
 */

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

/**
 * A functional React component that renders the error page.
 * @requirement Error Handling
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a user-friendly error page to handle application errors and guide users to recover.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps): JSX.Element {
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    // Display error toast notification when component mounts
    addToast(
      `An error occurred: ${error.message}`,
      'error',
      5000
    );
  }, [error, addToast]);

  /**
   * Handles retry action when user attempts to recover from error
   */
  const handleRetry = () => {
    try {
      reset();
      handleDismiss();
    } catch (retryError) {
      addToast(
        'Unable to recover from error. Please try again later.',
        'error',
        5000
      );
    }
  };

  /**
   * Navigates user back to home page
   */
  const handleGoHome = () => {
    try {
      router.push('/');
      handleDismiss();
    } catch (navigationError) {
      addToast(
        'Unable to navigate home. Please refresh the page.',
        'error',
        5000
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" role="alert">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleRetry}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Try again"
            >
              Try again
            </button>
            <button
              onClick={handleGoHome}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Return to home page"
            >
              Return to home page
            </button>
          </div>

          <div className="mt-6">
            <p className="text-center text-xs text-gray-500">
              If this problem persists, please contact support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}