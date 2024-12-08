// React v18.x
import React, { useState, useEffect } from 'react';
// Import internal dependencies with relative paths
import { formatDate } from '../../utils/format';
import { Button } from './Button';
import Modal from './Modal';

/**
 * Human Tasks:
 * 1. Verify TailwindCSS configuration matches design system colors
 * 2. Test card component across different viewport sizes
 * 3. Review card interactions with screen readers
 * 4. Validate hover and focus states meet accessibility standards
 */

interface CardProps {
  /** Title of the card */
  title: string;
  /** Main content of the card */
  content: string;
  /** Optional creation date */
  date?: Date;
  /** Optional image URL */
  imageUrl?: string;
  /** Optional alt text for image */
  imageAlt?: string;
  /** Optional array of action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  }>;
  /** Optional modal content */
  modalContent?: React.ReactNode;
  /** Optional CSS class name */
  className?: string;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Design System Specifications
 * A reusable Card component that implements the design system specifications
 * including typography, color system, and state variations.
 */
export const Card: React.FC<CardProps> = ({
  title,
  content,
  date,
  imageUrl,
  imageAlt,
  actions = [],
  modalContent,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle modal state
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  // Effect to handle modal keyboard interactions
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleModalClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-md 
        overflow-hidden 
        transition-all duration-200 
        hover:shadow-lg 
        focus-within:ring-2 
        focus-within:ring-blue-500 
        ${className}
      `}
      role="article"
    >
      {/* Card Image */}
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={imageAlt || title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Date */}
        {date && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {formatDate(date)}
          </p>
        )}

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {content}
        </p>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {actions.map((action, index) => (
              <Button
                key={`${action.label}-${index}`}
                label={action.label}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalContent && (
        <Modal
          isVisible={isModalOpen}
          onClose={handleModalClose}
          title={title}
          className="max-w-2xl"
        >
          {modalContent}
        </Modal>
      )}
    </div>
  );
};