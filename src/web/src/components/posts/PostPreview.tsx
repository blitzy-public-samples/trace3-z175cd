// React v18.x
import React from 'react';
import { Post } from '../../types/post';
import { formatPostSummary } from '../../utils/format';
import { formatToDisplayDate } from '../../utils/date';
import { PostCard } from './PostCard';

/**
 * Human Tasks:
 * 1. Review accessibility requirements for post preview interactions
 * 2. Test content truncation with various content lengths
 * 3. Verify responsive design across different screen sizes
 * 4. Ensure date formatting matches regional requirements
 */

interface PostPreviewProps {
  /** Post object containing metadata and content */
  post: Post;
}

/**
 * @requirement Content Presentation
 * Location: Technical Specification/User Interface Design/Interface Elements
 * A React component that provides a preview of a post, including its title,
 * author, publication date, and a snippet of its content.
 */
export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  // Format the post summary and date
  const formattedSummary = formatPostSummary(post);
  const formattedDate = formatToDisplayDate(post.createdAt);

  // Extract content preview from EditorState
  const contentPreview = React.useMemo(() => {
    const contentState = post.content.getCurrentContent();
    const plainText = contentState.getPlainText();
    // Truncate content to 200 characters for preview
    return plainText.length > 200
      ? `${plainText.substring(0, 200)}...`
      : plainText;
  }, [post.content]);

  // Handle "Read More" action
  const handleReadMore = () => {
    // Navigate to full post view
    window.location.href = `/posts/${post.id}`;
  };

  // Define actions for the PostCard
  const actions = [
    {
      label: 'Read More',
      onClick: handleReadMore,
      variant: 'primary' as const
    }
  ];

  return (
    <PostCard
      title={post.title}
      content={contentPreview}
      date={post.createdAt}
      actions={actions}
      className="post-preview"
      imageUrl={post.author.avatarUrl}
      imageAlt={`${post.author.email}'s avatar`}
    >
      <div className="post-preview-metadata">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>By </span>
          <span className="font-medium">{post.author.email}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span>Published on </span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        {post.publication && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span>In </span>
            <span className="font-medium">{post.publication.name}</span>
          </div>
        )}
      </div>
    </PostCard>
  );
};