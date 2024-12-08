// react-redux v8.x
import { useDispatch, useSelector } from 'react-redux';
// react v18.x
import { useEffect } from 'react';

// Internal imports
import { actions } from '../store/uiSlice';
import { validateEngagementMetric } from '../utils/validation';

/**
 * Human Tasks:
 * 1. Configure toast notification styling in the UI theme
 * 2. Review and adjust default toast duration with UX team
 * 3. Set up analytics tracking for toast interactions
 */

/**
 * Custom hook for managing toast notifications
 * @requirement User Feedback Notifications
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Provides methods for displaying and managing toast notifications
 */
export const useToast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: any) => state.ui.notifications);

  // Set up auto-dismissal for toasts
  useEffect(() => {
    toasts.forEach((toast: { id: string; duration?: number }) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          dispatch(actions.removeNotification(toast.id));
        }, toast.duration);

        // Cleanup timers on unmount
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  /**
   * Adds a new toast notification
   * @param message - The message to display in the toast
   * @param type - The type of toast (success, error, info, warning)
   * @param duration - Optional duration in milliseconds before auto-dismissal
   */
  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    duration?: number
  ) => {
    dispatch(
      actions.addNotification({
        message,
        type,
        duration: duration || 5000, // Default 5 seconds if not specified
      })
    );

    // Track engagement metric for the notification
    const metric = {
      views: 1,
      clicks: 0,
      shares: 0,
    };

    if (validateEngagementMetric(metric)) {
      // Additional analytics tracking could be added here
    }
  };

  /**
   * Removes a specific toast notification
   * @param id - The ID of the toast to remove
   */
  const removeToast = (id: string) => {
    dispatch(actions.removeNotification(id));
  };

  /**
   * Removes all current toast notifications
   */
  const clearToasts = () => {
    dispatch(actions.clearNotifications());
  };

  return {
    addToast,
    removeToast,
    clearToasts,
    toasts,
  };
};