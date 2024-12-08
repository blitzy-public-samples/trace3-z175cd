'use client';

// Import dependencies
import React from 'react';
import PasswordResetForm from '../../../components/auth/PasswordResetForm';
import useAuth from '../../../hooks/useAuth';
import '../../../styles/globals.css';

/**
 * Human Tasks:
 * 1. Configure error monitoring for password reset attempts
 * 2. Review password reset email templates with design team
 * 3. Set up rate limiting for password reset requests
 * 4. Verify email delivery service configuration
 */

/**
 * @requirement User Authentication
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Description: Implements a forgot password page to handle user authentication recovery processes.
 */
const ForgotPasswordPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect message if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Already Authenticated
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You are already logged in. No need to reset your password.
          </p>
          <a
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Password Reset Form Component */}
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <PasswordResetForm />
        </div>

        {/* Back to Login Link */}
        <div className="text-center mt-4">
          <a
            href="/login"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Back to Login
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Need help?{' '}
          <a
            href="/support"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Contact Support
          </a>
        </p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;