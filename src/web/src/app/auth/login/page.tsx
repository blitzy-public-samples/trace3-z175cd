'use client';

// react v18.x
import React from 'react';

// Internal imports
import LoginForm from '../../../components/auth/LoginForm';
import useAuth from '../../../hooks/useAuth';
import { validateAuthUser } from '../../../utils/validation';
import { authenticateUser } from '../../../lib/api';
import { actions } from '../../../store/authSlice';

/**
 * Human Tasks:
 * 1. Verify authentication flow with backend team
 * 2. Review error handling and user feedback mechanisms
 * 3. Test login page accessibility compliance
 * 4. Configure analytics tracking for login attempts
 */

/**
 * @requirement User Authentication
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements the login page component for user authentication.
 * Integrates with the authentication system and provides user feedback.
 */
const LoginPage: React.FC = () => {
  const { isAuthenticated, loading, error } = useAuth();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Sign in to your Substack Replica account
          </p>
          
          {/* Render the login form component */}
          <LoginForm />

          {/* Display any authentication errors */}
          {error && !loading && (
            <div 
              className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Additional authentication options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a 
                href="/auth/register" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </a>
            </p>
            <a 
              href="/auth/forgot-password"
              className="block mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;