// @ts-check
import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { validateAuthUser } from '../../utils/validation';
import { actions } from '../../store/uiSlice';

/**
 * Human Tasks:
 * 1. Review color contrast ratios for input states with design team
 * 2. Verify input field accessibility with screen readers
 * 3. Test input validation behavior across different form contexts
 * 4. Confirm error message display duration with UX team
 */

interface InputProps {
  /** Type of the input field */
  type?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Change handler for input value */
  onChange?: (value: string) => void;
  /** Initial value for the input */
  initialValue?: string;
  /** Label for the input field */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Design System Specifications
 * A reusable input component that follows the design system specifications
 * and provides validation and consistent styling.
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  required = false,
  onChange,
  initialValue = '',
  label,
  error,
  className = ''
}) => {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const dispatch = useDispatch();

  /**
   * Handles input change events and validates the input value
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    // Validate input if it's an email type
    if (type === 'email') {
      const isValidInput = validateAuthUser({ id: '1', email: newValue, role: 'user', token: '' });
      setIsValid(isValidInput);

      if (!isValidInput && newValue.length > 0) {
        dispatch(actions.addNotification({
          type: 'error',
          message: 'Please enter a valid email address',
          duration: 3000
        }));
      }
    }

    // Call parent onChange handler if provided
    onChange?.(newValue);
  }, [type, onChange, dispatch]);

  // Base input classes following design system specifications
  const baseInputClasses = `
    w-full
    px-4
    py-2
    text-base
    border
    rounded-md
    transition-colors
    duration-200
    focus:outline-none
    focus:ring-2
    ${isValid ? 'focus:ring-blue-500' : 'focus:ring-red-500'}
    ${isValid ? 'border-gray-300' : 'border-red-500'}
    ${isValid ? 'hover:border-blue-500' : 'hover:border-red-600'}
    dark:bg-gray-800
    dark:border-gray-700
    dark:text-gray-100
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label 
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200"
          htmlFor={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <input
        id={`input-${label?.toLowerCase().replace(/\s+/g, '-')}`}
        type={type}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!isValid}
        aria-required={required}
        aria-describedby={error ? `error-${label?.toLowerCase().replace(/\s+/g, '-')}` : undefined}
        className={baseInputClasses}
      />

      {error && (
        <p 
          id={`error-${label?.toLowerCase().replace(/\s+/g, '-')}`}
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;