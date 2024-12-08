// react-redux v8.x
import { useSelector, useDispatch } from 'react-redux';

// Import types and actions
import { Subscription } from '../types/subscription';
import { 
  fetchSubscriptionsThunk,
  selectSubscriptions,
  selectSubscriptionLoading,
  selectSubscriptionError,
  clearError,
  resetState
} from '../store/subscriptionSlice';

/**
 * Custom React hook for managing subscription-related state and operations.
 * 
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 * Purpose: Provides a centralized way to manage subscription data and operations
 * in React components.
 * 
 * @returns An object containing subscription data, loading state, error state,
 * and operations for interacting with subscriptions
 */
const useSubscription = () => {
  // Initialize Redux hooks
  const dispatch = useDispatch();

  // Select subscription state from Redux store
  const subscriptions = useSelector(selectSubscriptions);
  const loading = useSelector(selectSubscriptionLoading);
  const error = useSelector(selectSubscriptionError);

  /**
   * Fetches the latest subscription data from the API
   * @returns Promise that resolves when the fetch operation completes
   */
  const fetchSubscriptions = async (): Promise<void> => {
    try {
      await dispatch(fetchSubscriptionsThunk()).unwrap();
    } catch (error) {
      // Error handling is managed by the Redux slice
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  /**
   * Clears any subscription-related errors from the state
   */
  const handleClearError = (): void => {
    dispatch(clearError());
  };

  /**
   * Resets the subscription state to its initial values
   */
  const handleResetState = (): void => {
    dispatch(resetState());
  };

  /**
   * Gets a subscription by its ID
   * @param id - The ID of the subscription to find
   * @returns The found subscription or undefined if not found
   */
  const getSubscriptionById = (id: string): Subscription | undefined => {
    return subscriptions.find(subscription => subscription.id === id);
  };

  /**
   * Gets all subscriptions with a specific status
   * @param status - The status to filter by
   * @returns Array of subscriptions matching the status
   */
  const getSubscriptionsByStatus = (status: string): Subscription[] => {
    return subscriptions.filter(subscription => subscription.status === status);
  };

  /**
   * Gets all subscriptions for a specific tier
   * @param tier - The tier to filter by
   * @returns Array of subscriptions matching the tier
   */
  const getSubscriptionsByTier = (tier: string): Subscription[] => {
    return subscriptions.filter(subscription => subscription.tier === tier);
  };

  return {
    // State
    subscriptions,
    loading,
    error,

    // Operations
    fetchSubscriptions,
    handleClearError,
    handleResetState,
    getSubscriptionById,
    getSubscriptionsByStatus,
    getSubscriptionsByTier
  };
};

export default useSubscription;