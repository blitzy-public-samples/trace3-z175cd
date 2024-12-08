// @version: react@18.x
// @version: prosemirror-state@1.4.2

import React, { useState, useEffect } from 'react';
import useEditor from '../../hooks/useEditor';
import ImagePlugin from './plugins/ImagePlugin';
import { createLinkPlugin } from './plugins/LinkPlugin';
import { MarkdownPlugin } from './plugins/MarkdownPlugin';
import { validateEditorState } from '../../utils/validation';

/**
 * Human Tasks:
 * 1. Configure toolbar button icons and styles in the design system
 * 2. Review accessibility requirements for toolbar buttons
 * 3. Set up keyboard shortcuts for toolbar actions
 * 4. Configure analytics tracking for toolbar interactions
 */

/**
 * Toolbar component for the rich text editor
 * Requirement: Content Creation - Supports the rich text editor by providing a toolbar for quick access to formatting, media uploads, and hyperlink management
 * Location: Technical Specification/Core Features/Content Creation
 */
const Toolbar: React.FC = () => {
  // Initialize editor state and plugins
  const { editorState, updateEditorState, isValid } = useEditor();
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());

  // Initialize plugins
  useEffect(() => {
    if (editorState) {
      const plugins = [
        ImagePlugin(editorState),
        createLinkPlugin(),
        MarkdownPlugin(editorState)
      ];

      // Validate editor state after plugin initialization
      const updatedState = {
        ...editorState,
        plugins: [...editorState.plugins, ...plugins]
      };

      if (validateEditorState(updatedState)) {
        updateEditorState(updatedState);
      }
    }
  }, []);

  // Update active buttons based on current selection
  useEffect(() => {
    if (editorState && editorState.selection) {
      const marks = new Set<string>();
      const { from, to } = editorState.selection;

      editorState.doc.nodesBetween(from, to, node => {
        if (node.marks) {
          node.marks.forEach(mark => {
            marks.add(mark.type.name);
          });
        }
      });

      setActiveButtons(marks);
    }
  }, [editorState?.selection]);

  /**
   * Handles toolbar button clicks
   * @param command - The command to execute
   */
  const handleToolbarAction = (command: string) => {
    if (!editorState || !isValid) return;

    const tr = editorState.tr;
    switch (command) {
      case 'bold':
        tr.addMark(
          editorState.selection.from,
          editorState.selection.to,
          editorState.schema.marks.strong.create()
        );
        break;
      case 'italic':
        tr.addMark(
          editorState.selection.from,
          editorState.selection.to,
          editorState.schema.marks.em.create()
        );
        break;
      case 'link':
        const url = window.prompt('Enter URL:');
        if (url) {
          tr.addMark(
            editorState.selection.from,
            editorState.selection.to,
            editorState.schema.marks.link.create({ href: url })
          );
        }
        break;
      case 'image':
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const img = editorState.schema.nodes.image.create({
                src: reader.result,
                alt: file.name
              });
              const pos = editorState.selection.from;
              updateEditorState({
                ...editorState,
                tr: tr.insert(pos, img)
              });
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        break;
      case 'markdown':
        // Toggle Markdown mode
        const isMarkdownActive = activeButtons.has('markdown');
        if (isMarkdownActive) {
          tr.removeMark(
            editorState.selection.from,
            editorState.selection.to,
            editorState.schema.marks.code
          );
        } else {
          tr.addMark(
            editorState.selection.from,
            editorState.selection.to,
            editorState.schema.marks.code.create()
          );
        }
        break;
    }

    // Update editor state with the new transaction
    updateEditorState({
      ...editorState,
      tr
    });
  };

  return (
    <div className="flex items-center space-x-2 p-2 border-b border-gray-200 bg-white">
      {/* Text Formatting */}
      <button
        onClick={() => handleToolbarAction('bold')}
        className={`toolbar-button ${activeButtons.has('strong') ? 'active' : ''}`}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <span className="icon-bold" />
      </button>
      <button
        onClick={() => handleToolbarAction('italic')}
        className={`toolbar-button ${activeButtons.has('em') ? 'active' : ''}`}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <span className="icon-italic" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Media */}
      <button
        onClick={() => handleToolbarAction('image')}
        className="toolbar-button"
        title="Insert Image"
        aria-label="Insert Image"
      >
        <span className="icon-image" />
      </button>
      <button
        onClick={() => handleToolbarAction('link')}
        className={`toolbar-button ${activeButtons.has('link') ? 'active' : ''}`}
        title="Insert Link (Ctrl+K)"
        aria-label="Insert Link"
      >
        <span className="icon-link" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-gray-200" />

      {/* Markdown */}
      <button
        onClick={() => handleToolbarAction('markdown')}
        className={`toolbar-button ${activeButtons.has('markdown') ? 'active' : ''}`}
        title="Toggle Markdown"
        aria-label="Toggle Markdown"
      >
        <span className="icon-markdown" />
      </button>
    </div>
  );
};

export default Toolbar;