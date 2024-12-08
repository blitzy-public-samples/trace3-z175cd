// @reduxjs/toolkit v1.9.x
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Subscription } from '../types/subscription';
import { fetchSubscriptions } from '../lib/api';

/**
 * Human Tasks:
 * 1. Configure error monitoring for subscription state changes
 * 2. Set up analytics tracking for subscription events
 * 3. Review and adjust caching strategies for subscription data
 */

/**
 * State interface for the subscription slice
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 */
interface SubscriptionState {
  /** List of user subscriptions */
  subscriptions: Subscription[];
  /** Loading state for async operations */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Timestamp of last successful data fetch */
  lastFetched: number | null;
}

/**
 * Initial state for the subscription slice
 */
const initialState: SubscriptionState = {
  subscriptions: [],
  loading: false,
  error: null,
  lastFetched: null,
};

/**
 * Async thunk for fetching subscriptions
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 */
export const fetchSubscriptionsThunk = createAsyncThunk(
  'subscription/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const subscriptions = await fetchSubscriptions();
      return subscriptions;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch subscriptions');
    }
  }
);

/**
 * Subscription slice containing reducers and actions
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 */
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    /**
     * Reset the error state
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Reset the subscription state to initial values
     */
    resetState: (state) => {
      state.subscriptions = [];
      state.loading = false;
      state.error = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSubscriptionsThunk.fulfilled,
        (state, action: PayloadAction<Subscription[]>) => {
          state.loading = false;
          state.subscriptions = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(fetchSubscriptionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, resetState } = subscriptionSlice.actions;

// Export selectors
export const selectSubscriptions = (state: { subscription: SubscriptionState }) =>
  state.subscription.subscriptions;
export const selectSubscriptionLoading = (state: { subscription: SubscriptionState }) =>
  state.subscription.loading;
export const selectSubscriptionError = (state: { subscription: SubscriptionState }) =>
  state.subscription.error;
export const selectLastFetched = (state: { subscription: SubscriptionState }) =>
  state.subscription.lastFetched;

// Export reducer as default
export default subscriptionSlice.reducer;