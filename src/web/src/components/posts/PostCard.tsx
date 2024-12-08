// React v18.x
import React, { useState, useEffect } from 'react';
import { Post } from '../../types/post';
import { formatPostSummary } from '../../utils/format';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

/**
 * Human Tasks:
 * 1. Review accessibility requirements for post card interactions
 * 2. Test post card rendering with different content lengths
 * 3. Verify responsive behavior across breakpoints
 * 4. Ensure date formatting matches regional requirements
 */

interface PostCardProps {
  /** Post object containing metadata and content */
  post: Post;
  /** Optional handler for edit action */
  onEdit?: () => void;
  /** Optional handler for delete action */
  onDelete?: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * @requirement Content Presentation
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A reusable PostCard component that displays a summary of a post,
 * including its title, author, publication date, and actions.
 */
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState('');

  // Format post summary when post data changes
  useEffect(() => {
    try {
      const formattedSummary = formatPostSummary(post);
      setSummary(formattedSummary);
    } catch (error) {
      console.error('Error formatting post summary:', error);
      setSummary('Error loading post summary');
    }
  }, [post]);

  // Generate action buttons based on available handlers
  const actions = [
    {
      label: isExpanded ? 'Show Less' : 'Read More',
      onClick: () => setIsExpanded(!isExpanded),
      variant: 'primary' as const
    },
    ...(onEdit ? [{
      label: 'Edit',
      onClick: onEdit,
      variant: 'outline' as const
    }] : []),
    ...(onDelete ? [{
      label: 'Delete',
      onClick: onDelete,
      variant: 'danger' as const
    }] : [])
  ];

  return (
    <Card
      title={post.title}
      content={summary}
      date={post.createdAt}
      actions={actions}
      className={`post-card ${className}`}
      imageUrl={post.author.avatarUrl}
      imageAlt={`${post.author.email}'s avatar`}
    >
      {isExpanded && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>Author: </span>
            <span className="font-medium">{post.author.email}</span>
          </div>
          {post.publication && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>Publication: </span>
              <span className="font-medium">{post.publication.name}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};