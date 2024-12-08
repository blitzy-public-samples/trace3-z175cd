// react v18.x
import { useState, useEffect } from 'react';

// Internal imports
import { validateAuthUser, validatePost } from '../utils/validation';
import { store } from '../store/index';
import { useToast } from './useToast';

/**
 * Human Tasks:
 * 1. Configure form validation rules based on business requirements
 * 2. Set up error logging for validation failures
 * 3. Review form submission error handling with the team
 * 4. Verify accessibility of form error messages
 */

/**
 * Type definitions for form handling
 */
type FormValues = Record<string, any>;
type FormErrors = Record<string, string>;
type ValidationFunction = (values: FormValues) => boolean;

interface UseFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => void | Promise<void>;
  validationType?: 'auth' | 'post';
}

/**
 * Custom hook for managing form state and validation
 * @requirement Form Management and Validation
 * Location: Technical Specification/User Interface Design/Interface Elements
 */
export const useForm = ({ initialValues, onSubmit, validationType }: UseFormProps) => {
  // Initialize form state
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Get toast notification handler
  const { addToast } = useToast();

  // Select validation function based on form type
  const getValidationFunction = (): ValidationFunction => {
    switch (validationType) {
      case 'auth':
        return (values) => validateAuthUser(values as any);
      case 'post':
        return (values) => validatePost(values as any);
      default:
        return () => true;
    }
  };

  /**
   * Handles changes to form inputs
   * @param event Change event from form input
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));

    // Mark field as touched
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true
    }));
  };

  /**
   * Handles blur events for form inputs
   * @param event Blur event from form input
   */
  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true
    }));
  };

  /**
   * Validates form values using the selected validation function
   * @returns boolean indicating if the form is valid
   */
  const validateForm = (): boolean => {
    const validationFunction = getValidationFunction();
    const isValid = validationFunction(values);

    if (!isValid) {
      const newErrors: FormErrors = {};
      Object.keys(values).forEach((key) => {
        if (!values[key] || values[key].trim() === '') {
          newErrors[key] = `${key} is required`;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  /**
   * Handles form submission
   * @param event Submit event from form
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (validateForm()) {
        await onSubmit(values);
        // Dispatch success action to store if needed
        store.dispatch({ type: 'form/submitSuccess', payload: values });
        addToast('Form submitted successfully', 'success');
      } else {
        addToast('Please correct the form errors', 'error');
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Form submission failed', 'error');
      // Dispatch error action to store if needed
      store.dispatch({ type: 'form/submitError', payload: error });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resets form to initial values
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Validate form when values change
  useEffect(() => {
    const debouncedValidation = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        validateForm();
      }
    }, 300);

    return () => clearTimeout(debouncedValidation);
  }, [values, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
};