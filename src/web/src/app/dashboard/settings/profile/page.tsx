'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { ProfileForm } from '../../../../components/settings/ProfileForm';
import useAuth from '../../../../hooks/useAuth';
import { authSlice } from '../../../../store/authSlice';
import { validateAuthUser } from '../../../../utils/validation';

/**
 * Human Tasks:
 * 1. Verify profile update success/error message content with UX team
 * 2. Test form accessibility with screen readers
 * 3. Review profile update validation rules with product team
 * 4. Ensure proper error handling for network failures
 */

/**
 * @requirement User Profile Management
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements the Profile Settings page component, allowing users to manage their profile information.
 */
const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  /**
   * Handles profile update by dispatching the update action
   * and validating the user data
   */
  const handleProfileUpdate = React.useCallback((updatedData: any) => {
    if (user && validateAuthUser({ ...user, ...updatedData })) {
      dispatch(authSlice.actions.updateProfile(updatedData));
    }
  }, [dispatch, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update your profile information and manage your account settings.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="max-w-3xl mx-auto px-4 py-5 sm:p-6">
              <ProfileForm />
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              Your profile information helps us personalize your experience and
              communicate with you effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;