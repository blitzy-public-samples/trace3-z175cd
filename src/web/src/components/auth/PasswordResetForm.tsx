// @ts-check
import React, { useState, useCallback } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { validateAuthUser } from '../../utils/validation';
import { authenticateUser } from '../../lib/api';
import useAuth from '../../hooks/useAuth';

/**
 * Human Tasks:
 * 1. Configure error monitoring for form submission failures
 * 2. Review password reset email template content with product team
 * 3. Set up rate limiting for password reset attempts
 * 4. Verify email delivery service configuration
 */

/**
 * @requirement User Authentication
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * A form component that allows users to initiate a password reset by providing their email address.
 */
const PasswordResetForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  /**
   * Handles changes to the email input field
   */
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setError('');
  }, []);

  /**
   * Validates the form input and submits the password reset request
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate email format
      const isValid = validateAuthUser({
        id: '1',
        email,
        role: 'user',
        token: ''
      });

      if (!isValid) {
        throw new Error('Please enter a valid email address');
      }

      // Send password reset request
      await authenticateUser({
        email,
        password: '' // Password not required for reset request
      });

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [email]);

  // Redirect if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300">
        You are already logged in. No need to reset your password.
      </div>
    );
  }

  // Show success message after submission
  if (isSuccess) {
    return (
      <div className="text-center text-green-600 dark:text-green-400">
        <p className="mb-4">Password reset instructions have been sent to your email.</p>
        <p className="text-sm">Please check your inbox and follow the instructions to reset your password.</p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reset Your Password
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <Input
        type="email"
        label="Email Address"
        placeholder="Enter your email address"
        required
        value={email}
        onChange={handleEmailChange}
        error={error}
        className="mb-4"
      />

      <Button
        label={isSubmitting ? 'Sending...' : 'Reset Password'}
        onClick={() => {}} // Form submit handles the action
        disabled={isSubmitting || !email}
        variant="primary"
      />

      {error && (
        <div 
          className="mt-4 text-red-600 dark:text-red-400 text-sm text-center"
          role="alert"
        >
          {error}
        </div>
      )}
    </form>
  );
};

export default PasswordResetForm;