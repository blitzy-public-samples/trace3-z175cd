// @reduxjs/toolkit v1.9.x
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { validateSubscription } from '../utils/validation';

/**
 * Human Tasks:
 * 1. Configure Redux DevTools for development environment
 * 2. Set up error tracking for UI state changes
 * 3. Review modal accessibility requirements
 * 4. Verify notification display durations with UX team
 */

// Types for UI state management
interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  type: string;
  props: Record<string, unknown>;
  isOpen: boolean;
}

interface UIState {
  notifications: Notification[];
  modals: Modal[];
  isLoading: boolean;
  darkMode: boolean;
  sidebarCollapsed: boolean;
  lastError: string | null;
}

// Initial state for the UI slice
const initialState: UIState = {
  notifications: [],
  modals: [],
  isLoading: false,
  darkMode: false,
  sidebarCollapsed: false,
  lastError: null,
};

/**
 * @requirement State Management
 * Location: Technical Specification/System Design/Frontend Libraries
 * Creates a Redux slice for managing UI-related state using Redux Toolkit
 */
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = `notification-${Date.now()}`;
      state.notifications.push({
        ...action.payload,
        id,
        duration: action.payload.duration || 5000, // Default 5 seconds
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modal actions
    openModal: (state, action: PayloadAction<Omit<Modal, 'isOpen'>>) => {
      const existingModalIndex = state.modals.findIndex(
        modal => modal.id === action.payload.id
      );
      
      if (existingModalIndex >= 0) {
        state.modals[existingModalIndex] = {
          ...action.payload,
          isOpen: true,
        };
      } else {
        state.modals.push({
          ...action.payload,
          isOpen: true,
        });
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modalIndex = state.modals.findIndex(
        modal => modal.id === action.payload
      );
      if (modalIndex >= 0) {
        state.modals[modalIndex].isOpen = false;
      }
    },
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    clearModals: (state) => {
      state.modals = [];
    },

    // Loading state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Theme actions
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.lastError = action.payload;
    },
    clearError: (state) => {
      state.lastError = null;
    },

    // Subscription-related UI updates
    updateSubscriptionUI: (state, action: PayloadAction<{ id: string; status: string }>) => {
      if (validateSubscription({ ...action.payload, tier: 'any', startDate: new Date(), endDate: new Date(), publication: { id: 'any', name: 'any' } })) {
        // Add a notification for subscription status change
        const message = `Subscription ${action.payload.status === 'active' ? 'activated' : 'updated'}`;
        const notificationId = `subscription-${Date.now()}`;
        state.notifications.push({
          id: notificationId,
          type: 'success',
          message,
          duration: 3000,
        });
      }
    },
  },
});

// Export actions and reducer
export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  removeModal,
  clearModals,
  setLoading,
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarCollapsed,
  setError,
  clearError,
  updateSubscriptionUI,
} = uiSlice.actions;

export const { reducer } = uiSlice;