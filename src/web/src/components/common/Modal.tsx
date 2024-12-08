// React v18.x
import React, { useEffect, useCallback, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { validateSubscription } from '../../utils/validation';
import { actions } from '../../store/uiSlice';

/**
 * Human Tasks:
 * 1. Review modal accessibility with UX team
 * 2. Test modal behavior across different screen sizes
 * 3. Verify keyboard navigation and focus management
 * 4. Ensure ARIA labels are appropriate for different modal content types
 */

interface ModalProps {
  /** Content to be displayed inside the modal */
  children: ReactNode;
  /** Controls modal visibility */
  isVisible: boolean;
  /** Callback function when modal is closed */
  onClose: () => void;
  /** Optional title for the modal */
  title?: string;
  /** Optional CSS class for additional styling */
  className?: string;
  /** Optional flag to disable closing on overlay click */
  disableOverlayClick?: boolean;
  /** Optional flag to disable escape key closing */
  disableEscapeKey?: boolean;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A reusable modal component for displaying overlay content in an accessible manner.
 */
export const Modal: React.FC<ModalProps> = ({
  children,
  isVisible,
  onClose,
  title,
  className = '',
  disableOverlayClick = false,
  disableEscapeKey = false,
}) => {
  const dispatch = useDispatch();

  // Handle escape key press
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (!disableEscapeKey && event.key === 'Escape') {
      onClose();
    }
  }, [disableEscapeKey, onClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Set up event listeners
  useEffect(() => {
    if (isVisible) {
      // Add escape key listener
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus trap setup
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, handleEscapeKey]);

  // Toggle modal visibility in Redux store
  const toggleModal = useCallback((isVisible: boolean) => {
    dispatch(actions.openModal({
      id: 'main-modal',
      type: 'default',
      props: { isVisible }
    }));
  }, [dispatch]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Modal overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={`relative z-50 w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all
          ${className}`}
      >
        {/* Modal header */}
        {title && (
          <div className="mb-4">
            <h2
              id="modal-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              {title}
            </h2>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={onClose}
          aria-label="Close modal"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal body */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

// Validate subscription data before modal updates
export const validateModalContent = (content: unknown): boolean => {
  if (content && typeof content === 'object' && 'subscription' in content) {
    return validateSubscription(content.subscription);
  }
  return true;
};