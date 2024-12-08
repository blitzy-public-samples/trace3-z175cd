// @version: react@18.x
// @version: prosemirror-state@1.4.2
// @version: prosemirror-view@1.31.3

import React, { useState, useEffect } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

// Internal imports
import ImagePlugin from './plugins/ImagePlugin';
import { createLinkPlugin } from './plugins/LinkPlugin';
import { MarkdownPlugin } from './plugins/MarkdownPlugin';
import MediaUploader from './MediaUploader';
import Toolbar from './Toolbar';

/**
 * Human Tasks:
 * 1. Configure ProseMirror schema based on content requirements
 * 2. Set up media storage backend for image uploads
 * 3. Review editor accessibility implementation
 * 4. Configure autosave functionality
 * 5. Set up content validation rules
 */

/**
 * Main Editor component that provides rich text editing capabilities
 * Requirement: Content Creation - Provides a rich text editor with support for formatting,
 * media uploads, hyperlink management, and Markdown syntax
 * Location: Technical Specification/Core Features/Content Creation
 */
const Editor: React.FC = () => {
  // State for editor instance
  const [editorView, setEditorView] = useState<EditorView | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);

  // Initialize editor on component mount
  useEffect(() => {
    // Create initial editor state with plugins
    const state = EditorState.create({
      doc: null,
      plugins: [
        // Requirement: Content Creation - Integrates image upload functionality
        ImagePlugin(EditorState.create({ doc: null })),
        // Requirement: Content Creation - Enables hyperlink management
        createLinkPlugin(),
        // Requirement: Content Creation - Adds Markdown syntax support
        MarkdownPlugin(EditorState.create({ doc: null }))
      ]
    });

    // Create editor view
    const view = new EditorView(document.querySelector('#editor-content'), {
      state,
      dispatchTransaction: (transaction) => {
        // Update editor state on changes
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        setEditorState(newState);

        // Handle autosave here if needed
        if (transaction.docChanged) {
          // Implement autosave logic
        }
      }
    });

    // Store editor instances in state
    setEditorView(view);
    setEditorState(state);

    // Cleanup on unmount
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return (
    <div className="editor-container w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Requirement: Content Creation - Provides toolbar for quick access */}
      <Toolbar />

      {/* Main editor content area */}
      <div 
        id="editor-content"
        className="min-h-[400px] p-4 prose prose-lg max-w-none"
        aria-label="Rich text editor content area"
      />

      {/* Requirement: Content Creation - Integrates media upload functionality */}
      <div className="border-t border-gray-200 p-4">
        <MediaUploader />
      </div>

      {/* Editor status and accessibility information */}
      <div 
        className="px-4 py-2 bg-gray-50 text-sm text-gray-500 rounded-b-lg"
        role="status"
        aria-live="polite"
      >
        {editorState?.doc?.textContent?.length || 0} characters
        {editorView?.hasFocus() && (
          <span className="ml-2">• Editor is focused</span>
        )}
      </div>
    </div>
  );
};

export default Editor;