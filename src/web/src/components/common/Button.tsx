// @ts-check
import React from 'react';
// tailwindcss v3.3.x
import { validateSubscription } from '../../utils/validation';

/**
 * Human Tasks:
 * 1. Ensure TailwindCSS is properly configured in the project
 * 2. Review color scheme alignment with design system
 * 3. Verify accessibility compliance for button states
 * 4. Test button behavior across different browser versions
 */

interface ButtonProps {
  /** Text label to display on the button */
  label: string;
  /** Click handler function */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant: 'primary' | 'secondary' | 'outline' | 'danger' */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Design System Specifications
 * A reusable Button component that implements the design system specifications
 * including typography, color system, and state variations.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  // Base button classes for consistent styling
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  // Variant-specific classes based on design system
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  // Combine classes based on variant
  const buttonClasses = `${baseClasses} ${variantClasses[variant]}`;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
};