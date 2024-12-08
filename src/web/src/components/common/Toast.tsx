// react v18.x
import React, { useEffect, useCallback } from 'react';
// classnames v2.x
import classnames from 'classnames';
// Internal imports
import { useToast } from '../../hooks/useToast';

/**
 * Human Tasks:
 * 1. Review and adjust toast animation durations with UX team
 * 2. Configure toast z-index to ensure proper stacking
 * 3. Verify toast contrast ratios meet WCAG standards
 * 4. Test toast behavior with screen readers
 */

interface ToastProps {
  /**
   * The message to display in the toast notification
   */
  message: string;
  /**
   * The type of toast notification
   */
  type: 'success' | 'error' | 'info' | 'warning';
  /**
   * Duration in milliseconds before auto-dismissal
   * @default 5000
   */
  duration?: number;
}

/**
 * A reusable component for displaying toast notifications
 * @requirement User Feedback Notifications
 * Location: Technical Specification/User Interface Design/Interface Elements
 */
export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000 
}) => {
  const { removeToast } = useToast();

  /**
   * Handles the manual dismissal of the toast notification
   */
  const handleDismiss = useCallback(() => {
    removeToast(message);
  }, [message, removeToast]);

  // Set up auto-dismiss functionality
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  // Define toast type-specific styles
  const toastClasses = classnames(
    'fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg',
    'transform transition-all duration-300 ease-in-out',
    'flex items-center justify-between min-w-[320px] max-w-[480px]',
    {
      'bg-green-500 text-white': type === 'success',
      'bg-red-500 text-white': type === 'error',
      'bg-blue-500 text-white': type === 'info',
      'bg-yellow-500 text-white': type === 'warning',
    }
  );

  // Define icon based on toast type
  const iconClasses = classnames(
    'mr-3 flex-shrink-0',
    {
      'text-green-100': type === 'success',
      'text-red-100': type === 'error',
      'text-blue-100': type === 'info',
      'text-yellow-100': type === 'warning',
    }
  );

  return (
    <div 
      role="alert"
      aria-live="polite"
      className={toastClasses}
      data-testid="toast-notification"
    >
      <div className="flex items-center">
        <span className={iconClasses}>
          {type === 'success' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-4 text-white opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};