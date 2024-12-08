// @ts-check
import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AuthUser } from '../../types/auth';
import { validateAuthUser } from '../../utils/validation';
import { authSlice } from '../../store/authSlice';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Verify email validation rules with the product team
 * 2. Confirm password complexity requirements
 * 3. Review error message content with UX team
 * 4. Test form accessibility with screen readers
 */

interface ProfileFormState {
  email: string;
  name: string;
  password: string;
  errors: {
    email?: string;
    name?: string;
    password?: string;
  };
}

/**
 * @requirement User Profile Management
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A form component for managing user profile settings including email, name, and password.
 */
export const ProfileForm: React.FC = () => {
  const dispatch = useDispatch();
  const [formState, setFormState] = useState<ProfileFormState>({
    email: '',
    name: '',
    password: '',
    errors: {}
  });

  /**
   * Handles input field changes and validates the input
   */
  const handleInputChange = useCallback((field: keyof ProfileFormState, value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [field]: value,
      errors: {
        ...prevState.errors,
        [field]: undefined
      }
    }));
  }, []);

  /**
   * Validates the form fields and returns whether the form is valid
   */
  const validateForm = useCallback((): boolean => {
    const errors: ProfileFormState['errors'] = {};
    let isValid = true;

    // Validate email
    if (!validateAuthUser({ id: '1', email: formState.email, role: 'user', token: '' })) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate name
    if (!formState.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Validate password if provided (optional for profile update)
    if (formState.password && formState.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    }

    setFormState(prevState => ({
      ...prevState,
      errors
    }));

    return isValid;
  }, [formState.email, formState.name, formState.password]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create user object for validation
      const userUpdate: Partial<AuthUser> = {
        email: formState.email,
        id: '1' // Placeholder ID for validation
      };

      // Dispatch update action to auth slice
      dispatch(authSlice.actions.updateProfile(userUpdate));

      // Clear password field after successful update
      setFormState(prevState => ({
        ...prevState,
        password: '',
        errors: {}
      }));
    } catch (error) {
      // Handle any errors that occur during profile update
      setFormState(prevState => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          submit: 'Failed to update profile. Please try again.'
        }
      }));
    }
  }, [dispatch, formState.email, validateForm]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <div className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          required
          initialValue={formState.email}
          onChange={(value) => handleInputChange('email', value)}
          error={formState.errors.email}
        />

        <Input
          type="text"
          label="Name"
          placeholder="Enter your name"
          required
          initialValue={formState.name}
          onChange={(value) => handleInputChange('name', value)}
          error={formState.errors.name}
        />

        <Input
          type="password"
          label="New Password"
          placeholder="Enter new password (optional)"
          initialValue={formState.password}
          onChange={(value) => handleInputChange('password', value)}
          error={formState.errors.password}
        />
      </div>

      <div className="flex justify-end mt-6">
        <Button
          label="Update Profile"
          onClick={handleSubmit}
          variant="primary"
        />
      </div>
    </form>
  );
};

export default ProfileForm;