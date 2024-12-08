'use client';

// react v18.x
import React, { useState, useEffect } from 'react';
// react-redux v8.x
import { useDispatch } from 'react-redux';

// Internal imports with relative paths
import Editor from '../../../../components/editor/Editor';
import Toolbar from '../../../../components/editor/Toolbar';
import MediaUploader from '../../../../components/editor/MediaUploader';
import { validatePost } from '../../../../utils/validation';
import { createPost } from '../../../../lib/api';
import { editorSlice } from '../../../../store/editorSlice';
import store from '../../../../store';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import DashboardLayout from '../../layout';

/**
 * Human Tasks:
 * 1. Configure rich text editor plugins and extensions
 * 2. Set up media storage backend for file uploads
 * 3. Review content validation rules
 * 4. Configure autosave functionality
 * 5. Set up error tracking for post creation
 */

/**
 * Page component for creating a new post in the dashboard
 * Requirement: Content Creation - Provides a user interface for creating new posts
 * Location: Technical Specification/Core Features/Content Creation
 */
const NewPostPage: React.FC = () => {
  // Local state for post data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get dispatch function for Redux actions
  const dispatch = useDispatch();

  // Initialize editor state on mount
  useEffect(() => {
    dispatch(editorSlice.actions.resetEditorState());
  }, [dispatch]);

  /**
   * Handles post submission
   * Validates post data and dispatches creation action
   */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create post object
      const postData = {
        title,
        content,
        author: store.getState().auth.user,
        publication: store.getState().auth.user?.publication,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate post data
      if (!validatePost(postData)) {
        throw new Error('Invalid post data. Please check all required fields.');
      }

      // Create post through API
      await createPost(postData);

      // Reset form and editor state
      setTitle('');
      setContent('');
      dispatch(editorSlice.actions.resetEditorState());

      // Redirect to posts list
      window.location.href = '/dashboard/posts';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Post
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and publish a new post to your publication.
          </p>
        </div>

        {/* Post Form */}
        <div className="space-y-6">
          {/* Title Input */}
          <div>
            <Input
              label="Post Title"
              placeholder="Enter post title"
              required
              onChange={setTitle}
              value={title}
              error={error}
            />
          </div>

          {/* Editor Toolbar */}
          <div className="border rounded-t-lg border-gray-200 dark:border-gray-800">
            <Toolbar />
          </div>

          {/* Main Editor */}
          <div className="min-h-[400px] border rounded-b-lg border-gray-200 dark:border-gray-800">
            <Editor />
          </div>

          {/* Media Uploader */}
          <div className="border rounded-lg border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-lg font-medium mb-4">
              Media Uploads
            </h3>
            <MediaUploader />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              label={isSubmitting ? 'Creating...' : 'Create Post'}
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !content}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewPostPage;