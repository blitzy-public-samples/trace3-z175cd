// react v18.x
import React, { useState, useCallback } from 'react';
// classnames v2.x
import classnames from 'classnames';

// Internal imports
import { AuthResponse } from '../../types/auth';
import { validateAuthUser } from '../../utils/validation';
import { authenticateUser } from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';

/**
 * Human Tasks:
 * 1. Verify error message display durations with UX team
 * 2. Review form validation rules with security team
 * 3. Confirm accessibility compliance for form elements
 * 4. Test form behavior across different browsers
 */

interface LoginFormState {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
  showSuccessToast: boolean;
}

/**
 * @requirement User Authentication
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A React component for handling user authentication through a login form.
 */
export const LoginForm: React.FC = () => {
  // Initialize form state
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    isSubmitting: false,
    error: null,
    showSuccessToast: false
  });

  // Get authentication utilities from useAuth hook
  const { login } = useAuth();

  /**
   * Handles email input changes
   * @param value - New email value
   */
  const handleEmailChange = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      email: value,
      error: null
    }));
  }, []);

  /**
   * Handles password input changes
   * @param value - New password value
   */
  const handlePasswordChange = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      password: value,
      error: null
    }));
  }, []);

  /**
   * Handles form submission for user authentication
   * @param event - Form submission event
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Set submitting state
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      // Validate credentials before submission
      if (!validateAuthUser({ 
        id: '0',
        email: formState.email,
        role: 'user',
        token: ''
      })) {
        throw new Error('Please enter a valid email address');
      }

      if (!formState.password || formState.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Attempt authentication
      const response: AuthResponse = await authenticateUser({
        email: formState.email,
        password: formState.password
      });

      // Show success toast and reset form
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        showSuccessToast: true,
        email: '',
        password: ''
      }));

      // Update authentication state
      await login({
        email: formState.email,
        password: formState.password
      });

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred during login'
      }));
    }
  }, [formState.email, formState.password, login]);

  /**
   * Handles dismissal of success toast
   */
  const handleToastDismiss = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      showSuccessToast: false
    }));
  }, []);

  // Form container classes following design system specifications
  const formClasses = classnames(
    'w-full',
    'max-w-md',
    'mx-auto',
    'p-6',
    'bg-white',
    'dark:bg-gray-800',
    'rounded-lg',
    'shadow-md'
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className={formClasses}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Sign In
          </h2>

          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            required
            onChange={handleEmailChange}
            value={formState.email}
            error={formState.error && formState.error.includes('email') ? formState.error : undefined}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            onChange={handlePasswordChange}
            value={formState.password}
            error={formState.error && formState.error.includes('password') ? formState.error : undefined}
          />

          <Button
            label={formState.isSubmitting ? 'Signing In...' : 'Sign In'}
            onClick={() => {}} // Form submit handles the action
            disabled={formState.isSubmitting}
            variant="primary"
          />

          {formState.error && !formState.error.includes('email') && !formState.error.includes('password') && (
            <div className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
              {formState.error}
            </div>
          )}
        </form>

        {formState.showSuccessToast && (
          <Toast
            message="Successfully signed in!"
            type="success"
            duration={3000}
          />
        )}
      </div>
    </div>
  );
};

export default LoginForm;