// react v18.x
import { useState } from 'react';
// react-redux v8.x
import { useDispatch } from 'react-redux';

// Internal imports
import { validatePublication } from '../../utils/validation';
import { actions } from '../../store/uiSlice';
import type { Publication } from '../../types/publication';

/**
 * Human Tasks:
 * 1. Verify accessibility compliance with WCAG AA standards
 * 2. Test keyboard navigation functionality
 * 3. Confirm dropdown styling matches design system specifications
 * 4. Review dropdown behavior on mobile devices
 */

interface SelectProps {
  /**
   * Array of publication options to display in the dropdown
   */
  options: Publication[];
  
  /**
   * Currently selected publication value
   */
  value?: string;
  
  /**
   * Callback function when selection changes
   */
  onChange?: (value: string) => void;
  
  /**
   * Optional placeholder text
   */
  placeholder?: string;
  
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional error message
   */
  error?: string;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Components
 * A reusable Select component for rendering dropdown menus with customizable options.
 */
const Select = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  error
}: SelectProps) => {
  // Local state for managing the selected value
  const [selectedValue, setSelectedValue] = useState<string>(value || '');
  
  // Redux dispatch for UI state updates
  const dispatch = useDispatch();

  /**
   * @requirement State Management
   * Location: Technical Specification/System Design/Frontend Libraries
   * Handles the change event for the Select component, updating both local and Redux state.
   */
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    
    // Find the selected publication
    const selectedPublication = options.find(option => option.id === newValue);
    
    // Validate the selected publication
    if (selectedPublication && validatePublication(selectedPublication)) {
      // Update local state
      setSelectedValue(newValue);
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(newValue);
      }
      
      // Dispatch Redux action to update UI state
      dispatch(actions.addNotification({
        type: 'success',
        message: `Selected publication: ${selectedPublication.name}`,
        duration: 3000
      }));
    } else {
      // Handle invalid selection
      dispatch(actions.addNotification({
        type: 'error',
        message: 'Invalid publication selected',
        duration: 5000
      }));
    }
  };

  return (
    <div className={`select-container ${className}`}>
      <select
        value={selectedValue}
        onChange={handleSelectChange}
        disabled={disabled}
        className={`select-input ${error ? 'select-error' : ''}`}
        aria-label={placeholder}
        aria-invalid={!!error}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.id} 
            value={option.id}
          >
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <span 
          className="select-error-message" 
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;