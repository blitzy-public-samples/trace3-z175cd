'use client';

// react v18.x
import React from 'react';

// Import components and hooks from relative paths
import RegisterForm from '../../../components/auth/RegisterForm';
import useAuth from '../../../hooks/useAuth';

// Import global styles
import '../../../styles/globals.css';

/**
 * Human Tasks:
 * 1. Verify that the registration page is properly integrated with the authentication flow
 * 2. Ensure proper error handling and user feedback is implemented
 * 3. Test registration form accessibility with screen readers
 * 4. Review registration success/failure analytics tracking
 */

/**
 * @requirement User Registration
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Description: Implements the user registration page, integrating the RegisterForm component
 * and ensuring proper styling and functionality.
 */
const RegisterPage: React.FC = () => {
  // Get authentication utilities from useAuth hook
  const { isAuthenticated } = useAuth();

  // Redirect if user is already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join our community and start sharing your stories
          </p>
        </div>

        {/* Registration form component */}
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
        </div>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;