'use client';

// react v18.x
import React, { useState, useEffect } from 'react';
// tailwindcss v3.x
import { useDispatch } from 'react-redux';

// Import components and styles with correct relative paths
import { ProfileForm } from '../../../components/settings/ProfileForm';
import PublicationForm from '../../../components/settings/PublicationForm';
import BillingForm from '../../../components/settings/BillingForm';
import DashboardLayout from '../layout';
import { actions } from '../../../store/uiSlice';
import store from '../../../store';
import '../../../styles/globals.css';

/**
 * Human Tasks:
 * 1. Verify form validation rules with product team
 * 2. Review form accessibility implementation
 * 3. Test dark mode compatibility
 * 4. Configure analytics tracking for settings changes
 */

/**
 * Settings page component that integrates profile, publication, and billing forms
 * @requirement User Profile Management
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Description: Provides a user interface for managing and updating profile settings.
 */
const SettingsPage: React.FC = () => {
  // Local state for active section
  const [activeSection, setActiveSection] = useState<'profile' | 'publication' | 'billing'>('profile');
  const dispatch = useDispatch();

  // Initialize page state
  useEffect(() => {
    // Clear any existing notifications
    dispatch(actions.clearNotifications());
    
    // Set initial loading state
    store.dispatch(actions.setLoading(false));
  }, [dispatch]);

  /**
   * Handles section navigation
   * @param section - The section to navigate to
   */
  const handleSectionChange = (section: typeof activeSection) => {
    setActiveSection(section);
    dispatch(actions.clearNotifications());
  };

  // Section navigation button classes
  const getSectionButtonClass = (section: typeof activeSection) => `
    px-4 py-2 text-sm font-medium rounded-md
    ${activeSection === section
      ? 'bg-blue-600 text-white'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
    transition-colors duration-200
  `;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your profile, publication, and billing settings
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-8 flex space-x-4 bg-white dark:bg-gray-900 p-1 rounded-lg shadow-sm">
          <button
            className={getSectionButtonClass('profile')}
            onClick={() => handleSectionChange('profile')}
            aria-current={activeSection === 'profile' ? 'page' : undefined}
          >
            Profile
          </button>
          <button
            className={getSectionButtonClass('publication')}
            onClick={() => handleSectionChange('publication')}
            aria-current={activeSection === 'publication' ? 'page' : undefined}
          >
            Publication
          </button>
          <button
            className={getSectionButtonClass('billing')}
            onClick={() => handleSectionChange('billing')}
            aria-current={activeSection === 'billing' ? 'page' : undefined}
          >
            Billing
          </button>
        </div>

        {/* Active Section Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
          {/* Profile Settings Section */}
          {activeSection === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Profile Settings
              </h2>
              <ProfileForm />
            </div>
          )}

          {/* Publication Settings Section */}
          {activeSection === 'publication' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Publication Settings
              </h2>
              <PublicationForm
                onSubmit={(publication) => {
                  dispatch(actions.addNotification({
                    type: 'success',
                    message: 'Publication settings updated successfully',
                    duration: 3000
                  }));
                }}
              />
            </div>
          )}

          {/* Billing Settings Section */}
          {activeSection === 'billing' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Billing Settings
              </h2>
              <BillingForm />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;