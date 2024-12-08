'use client';

// @version: react@18.x
// @version: next@13.x

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Internal imports
import Editor from '../../../../../components/editor/Editor';
import Toolbar from '../../../../../components/editor/Toolbar';
import { validatePost } from '../../../../../utils/validation';
import { createPost } from '../../../../../lib/api';
import useEditor from '../../../../../hooks/useEditor';

/**
 * Human Tasks:
 * 1. Configure autosave functionality for post drafts
 * 2. Set up error tracking for post validation failures
 * 3. Review accessibility implementation for the editor
 * 4. Configure analytics tracking for post edits
 */

/**
 * Edit Post page component that provides interface for editing existing posts
 * Requirement: Content Creation - Provides a user interface for editing posts
 * Location: Technical Specification/Core Features/Content Creation
 */
const EditPostPage = () => {
  // Initialize router for navigation and post ID retrieval
  const router = useRouter();
  const { id } = router.query;

  // Initialize editor state and validation
  const { 
    editorState, 
    isValid, 
    isDirty,
    initializeEditorState, 
    updateEditorState 
  } = useEditor();

  // Local state for post metadata
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${id}`);
        const post = await response.json();

        if (!validatePost(post)) {
          throw new Error('Invalid post data received');
        }

        setTitle(post.title);
        initializeEditorState();
        updateEditorState(post.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  /**
   * Handles post submission
   * Validates post data before sending to API
   */
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!editorState || !isValid) {
        throw new Error('Invalid editor state');
      }

      const postData = {
        id,
        title,
        content: editorState,
        updatedAt: new Date()
      };

      // Validate post data before submission
      if (!validatePost(postData)) {
        throw new Error('Invalid post data');
      }

      // Submit updated post to API
      await createPost(postData);

      // Navigate back to posts list on success
      router.push('/dashboard/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="mt-2 text-sm text-gray-600">
            Make changes to your post content and click Save when done.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Title Input */}
        <div className="mb-6">
          <label 
            htmlFor="post-title" 
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter post title"
          />
        </div>

        {/* Editor Toolbar */}
        <div className="mb-4 bg-white rounded-t-lg shadow-sm">
          <Toolbar />
        </div>

        {/* Editor */}
        <div className="bg-white rounded-b-lg shadow-sm">
          <Editor />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/posts')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !isValid || !isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostPage;