// React v18.x
import React, { useState, useCallback } from 'react';
// react-redux v8.x
import { useDispatch } from 'react-redux';
// tailwindcss v3.x
import { Publication } from '../../types/publication';
import { validatePublication } from '../../utils/validation';
import { actions } from '../../store/uiSlice';
import { store } from '../../store';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Verify form validation rules with product team
 * 2. Review accessibility implementation with UX team
 * 3. Test form submission error handling
 * 4. Confirm required fields with stakeholders
 */

interface PublicationFormProps {
  /** Initial publication data for editing */
  initialData?: Partial<Publication>;
  /** Callback function after successful form submission */
  onSubmit?: (publication: Publication) => void;
}

/**
 * PublicationForm component for managing publication settings
 * @requirement Content Creation
 * Location: Technical Specification/Core Features/Content Creation
 * Provides a form interface for managing publication metadata and settings
 */
const PublicationForm: React.FC<PublicationFormProps> = ({
  initialData = {},
  onSubmit
}) => {
  // Initialize form state with initial data or defaults
  const [formData, setFormData] = useState<Partial<Publication>>({
    name: initialData.name || '',
    description: initialData.description || '',
    id: initialData.id || ''
  });

  // Initialize error state
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const dispatch = useDispatch();

  /**
   * Handles input field changes
   * @requirement User Interface Design
   * Location: Technical Specification/User Interface Design/Design System Specifications
   */
  const handleInputChange = useCallback((field: keyof Publication) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  /**
   * Validates form data and handles submission
   * @requirement Content Creation
   * Location: Technical Specification/Core Features/Content Creation
   */
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form data
    const isValid = validatePublication({
      ...formData,
      id: formData.id || 'temp-id', // Ensure required fields for validation
      name: formData.name || '',
      description: formData.description || ''
    });

    if (!isValid) {
      const newErrors: typeof errors = {};
      
      if (!formData.name?.trim()) {
        newErrors.name = 'Publication name is required';
      }
      
      if (!formData.description?.trim()) {
        newErrors.description = 'Publication description is required';
      }

      setErrors(newErrors);

      dispatch(actions.addNotification({
        type: 'error',
        message: 'Please correct the errors in the form',
        duration: 5000
      }));

      return;
    }

    try {
      // Dispatch action to update publication settings
      store.dispatch(actions.setLoading(true));

      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData as Publication);
      }

      dispatch(actions.addNotification({
        type: 'success',
        message: 'Publication settings updated successfully',
        duration: 3000
      }));
    } catch (error) {
      dispatch(actions.addNotification({
        type: 'error',
        message: 'Failed to update publication settings',
        duration: 5000
      }));
    } finally {
      store.dispatch(actions.setLoading(false));
    }
  }, [formData, dispatch, onSubmit]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      aria-label="Publication settings form"
    >
      {/* Publication Name Input */}
      <div className="space-y-2">
        <Input
          label="Publication Name"
          type="text"
          placeholder="Enter publication name"
          required
          initialValue={formData.name}
          onChange={handleInputChange('name')}
          error={errors.name}
          className="w-full"
        />
      </div>

      {/* Publication Description Input */}
      <div className="space-y-2">
        <Input
          label="Publication Description"
          type="text"
          placeholder="Enter publication description"
          required
          initialValue={formData.description}
          onChange={handleInputChange('description')}
          error={errors.description}
          className="w-full"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          label="Cancel"
          onClick={() => {
            dispatch(actions.addNotification({
              type: 'info',
              message: 'Changes discarded',
              duration: 3000
            }));
          }}
          variant="outline"
        />
        <Button
          label="Save Changes"
          onClick={handleSubmit}
          variant="primary"
        />
      </div>
    </form>
  );
};

export default PublicationForm;