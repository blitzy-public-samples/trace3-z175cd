'use client';

/**
 * Human Tasks:
 * 1. Verify password reset email template content with product team
 * 2. Configure error monitoring for password reset failures
 * 3. Set up rate limiting for password reset attempts
 * 4. Test accessibility of the reset password flow
 */

import React from 'react';
import PasswordResetForm from '../../../components/auth/PasswordResetForm';
import '../../../styles/globals.css';

/**
 * @requirement User Authentication
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Description: Implements a reset password page to handle user authentication recovery processes.
 */
const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo or branding could be added here */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address to receive password reset instructions
          </p>
        </div>

        {/* Password Reset Form Component */}
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <PasswordResetForm />
        </div>

        {/* Additional help text or support links */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <a 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;