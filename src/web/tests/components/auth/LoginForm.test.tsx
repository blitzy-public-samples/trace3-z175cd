// @testing-library/react v13.x
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// jest v29.x
import { jest } from '@jest/globals';
// redux-mock-store v1.5.x
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
// react v18.x
import React from 'react';

// Internal imports
import { LoginForm } from '../../../src/components/auth/LoginForm';
import { validateAuthUser } from '../../../src/utils/validation';
import useAuth from '../../../src/hooks/useAuth';
import { actions } from '../../../src/store/authSlice';

// Mock the useAuth hook
jest.mock('../../../src/hooks/useAuth');

// Mock the validation utility
jest.mock('../../../src/utils/validation');

// Create mock store
const mockStore = configureStore([]);

/**
 * @requirement User Authentication Testing
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 * Test suite for the LoginForm component ensuring proper functionality
 */
describe('LoginForm Component Tests', () => {
  let store: any;
  const mockLogin = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Configure mock store
    store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      }
    });

    // Mock useAuth implementation
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      loading: false,
      error: null
    });

    // Mock validation
    (validateAuthUser as jest.Mock).mockReturnValue(true);
  });

  /**
   * @requirement User Authentication Testing
   * Tests if the LoginForm component renders correctly with all required elements
   */
  test('renders login form with all required elements', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Verify form elements are present
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  /**
   * @requirement User Authentication Testing
   * Tests the validation logic of the LoginForm component
   */
  test('validates form inputs correctly', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Test invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Mock validation failure
    (validateAuthUser as jest.Mock).mockReturnValueOnce(false);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    // Test invalid password
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  /**
   * @requirement User Authentication Testing
   * Tests the form submission logic of the LoginForm component
   */
  test('handles form submission correctly', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Enter valid credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Verify login function was called with correct credentials
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  /**
   * @requirement User Authentication Testing
   * Tests error handling during form submission
   */
  test('handles login errors correctly', async () => {
    // Mock login failure
    const mockError = new Error('Invalid credentials');
    mockLogin.mockRejectedValueOnce(mockError);

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Submit form with credentials
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  /**
   * @requirement User Authentication Testing
   * Tests loading state during form submission
   */
  test('displays loading state during submission', async () => {
    // Mock delayed login
    mockLogin.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Submit form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verify loading state
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });
});