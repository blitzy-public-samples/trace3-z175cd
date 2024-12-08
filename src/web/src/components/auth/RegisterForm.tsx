// @ts-check
import React, { useState, useEffect } from 'react'; // react v18.x
import { AuthUser } from '../../types/auth';
import { validateAuthUser } from '../../utils/validation';
import { authenticateUser } from '../../lib/api';
import useAuth from '../../hooks/useAuth';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Configure form validation rules with the product team
 * 2. Set up error tracking for registration failures
 * 3. Review password strength requirements
 * 4. Verify registration flow analytics integration
 */

/**
 * @requirement User Registration
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A form component for user registration that handles input validation and API integration.
 */
const RegisterForm: React.FC = () => {
  // State management for form inputs and validation
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get authentication utilities from useAuth hook
  const { login } = useAuth();

  // Validate form inputs and update error states
  useEffect(() => {
    const newErrors: typeof errors = {};

    // Validate email
    if (email && !validateAuthUser({ id: '1', email, role: 'user', token: '' })) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Validate password confirmation
    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
  }, [email, password, confirmPassword]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all fields before submission
      if (!email || !password || !confirmPassword) {
        setErrors({
          ...errors,
          form: 'All fields are required'
        });
        return;
      }

      // Create user object for validation
      const user: Partial<AuthUser> = {
        email,
        password
      };

      // Validate user data
      if (!validateAuthUser({ ...user, id: '1', role: 'user', token: '' })) {
        setErrors({
          ...errors,
          form: 'Invalid user data'
        });
        return;
      }

      // Submit registration data to API
      const response = await authenticateUser({
        email,
        password
      });

      // Log in the user after successful registration
      await login({
        email,
        password
      });

    } catch (error) {
      setErrors({
        ...errors,
        form: error instanceof Error ? error.message : 'Registration failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        required
        onChange={setEmail}
        error={errors.email}
        className="w-full"
      />

      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
        onChange={setPassword}
        error={errors.password}
        className="w-full"
      />

      <Input
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        onChange={setConfirmPassword}
        error={errors.confirmPassword}
        className="w-full"
      />

      {errors.form && (
        <div className="text-red-600 text-sm" role="alert">
          {errors.form}
        </div>
      )}

      <Button
        label="Register"
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(errors).length > 0}
        variant="primary"
      />
    </form>
  );
};

export default RegisterForm;