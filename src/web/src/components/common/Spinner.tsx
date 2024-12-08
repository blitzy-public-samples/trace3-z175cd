/**
 * Human Tasks:
 * 1. Verify spinner animation performance on low-end devices
 * 2. Ensure spinner color contrast meets WCAG AAA standards
 * 3. Test loading message screen reader compatibility
 */

// classnames v2.x
import classnames from 'classnames';
import { useEffect } from 'react';
import { actions } from '../../store/uiSlice';
import '../../../styles/globals.css';

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Description: Provides a visual indicator for loading states, ensuring a consistent user experience
 */
interface SpinnerProps {
  /** Whether the spinner should be visible */
  isLoading: boolean;
  /** Optional message to display below the spinner */
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ isLoading, message }) => {
  // Apply dynamic classes based on loading state
  const spinnerClasses = classnames(
    'inline-block w-8 h-8 border-4 rounded-full',
    'border-primary border-t-transparent',
    'animate-spin',
    {
      'opacity-100': isLoading,
      'opacity-0': !isLoading,
      'pointer-events-none': !isLoading
    }
  );

  const containerClasses = classnames(
    'flex flex-col items-center justify-center',
    'transition-opacity duration-200',
    {
      'opacity-100': isLoading,
      'opacity-0': !isLoading,
      'pointer-events-none': !isLoading
    }
  );

  // Add ARIA attributes for accessibility
  const ariaProps = {
    role: 'status',
    'aria-live': 'polite' as const,
    'aria-busy': isLoading
  };

  return (
    <div className={containerClasses} {...ariaProps}>
      <div className={spinnerClasses} />
      {message && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
};