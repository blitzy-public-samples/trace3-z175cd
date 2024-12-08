/**
 * @fileoverview Redux store configuration
 * Addresses requirement: State Management
 * Location: Technical Specification/System Design/Frontend Libraries
 * Purpose: Configures and combines Redux slices for centralized state management
 */

// @reduxjs/toolkit v1.9.x
import { configureStore } from '@reduxjs/toolkit';

// Import reducers from slices
import { reducer as authReducer } from './authSlice';
import { editorReducer } from './editorSlice';
import subscriptionReducer from './subscriptionSlice';
import { reducer as uiReducer } from './uiSlice';

/**
 * Human Tasks:
 * 1. Configure Redux DevTools in development environment
 * 2. Set up Redux middleware based on environment
 * 3. Configure state persistence if required
 * 4. Set up state rehydration logic if using SSR
 */

/**
 * Configures the Redux store with combined reducers and middleware
 * Requirement: State Management - Implements Redux Toolkit for centralized state management
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    editor: editorReducer,
    subscription: subscriptionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain paths in state for non-serializable values
        ignoredActions: ['editor/updateEditorState'],
        ignoredPaths: ['editor.plugins'],
      },
      thunk: true,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store instance as default
export default store;