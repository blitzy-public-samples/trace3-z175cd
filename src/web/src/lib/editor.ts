// @version: prosemirror-state@1.4.2
// @version: prosemirror-view@1.31.3

import { EditorState as ProseMirrorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { EditorState, EditorConfig } from '../types/editor';
import { validateEditorState } from '../utils/validation';

/**
 * Human Tasks:
 * 1. Ensure ProseMirror dependencies are installed with correct versions
 * 2. Configure image upload service for ImagePlugin
 * 3. Set up link validation rules for createLinkPlugin
 * 4. Review Markdown syntax configuration for security implications
 */

/**
 * Implements a localized toolbar component for editor functionality
 * Requirement: Content Creation - Provides rich text editing capabilities
 */
class Toolbar {
  /**
   * Renders the toolbar with editor functionalities
   * @param editorState Current state of the editor
   * @returns HTMLElement containing the toolbar
   */
  render(editorState: EditorState): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';

    // Basic formatting buttons
    const boldButton = this.createToolbarButton('Bold', 'bold', editorState);
    const italicButton = this.createToolbarButton('Italic', 'italic', editorState);
    const underlineButton = this.createToolbarButton('Underline', 'underline', editorState);

    // List formatting buttons
    const bulletListButton = this.createToolbarButton('Bullet List', 'bullet_list', editorState);
    const orderedListButton = this.createToolbarButton('Ordered List', 'ordered_list', editorState);

    // Heading buttons
    const h1Button = this.createToolbarButton('H1', 'heading1', editorState);
    const h2Button = this.createToolbarButton('H2', 'heading2', editorState);

    // Link and image buttons
    const linkButton = this.createToolbarButton('Link', 'link', editorState);
    const imageButton = this.createToolbarButton('Image', 'image', editorState);

    // Append all buttons to toolbar
    toolbar.append(
      boldButton,
      italicButton,
      underlineButton,
      bulletListButton,
      orderedListButton,
      h1Button,
      h2Button,
      linkButton,
      imageButton
    );

    return toolbar;
  }

  private createToolbarButton(
    label: string,
    command: string,
    editorState: EditorState
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'toolbar-button';
    button.title = label;
    button.textContent = label;
    button.dataset.command = command;
    return button;
  }
}

/**
 * Creates a plugin for handling Markdown syntax support
 * Requirement: Content Creation - Enables Markdown formatting
 */
const createMarkdownPlugin = (): Plugin => {
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        // Handle Markdown shortcuts
        if (event.key === '*' && event.ctrlKey) {
          // Bold text shortcut
          return true;
        }
        if (event.key === '_' && event.ctrlKey) {
          // Italic text shortcut
          return true;
        }
        if (event.key === '#' && event.ctrlKey) {
          // Heading shortcut
          return true;
        }
        return false;
      }
    }
  });
};

/**
 * Creates a plugin for handling image uploads and embedding
 * Requirement: Content Creation - Supports image integration
 */
const createImagePlugin = (): Plugin => {
  return new Plugin({
    props: {
      handleDrop(view, event, slice, moved) {
        if (!event.dataTransfer) return false;
        const files = Array.from(event.dataTransfer.files);
        const images = files.filter(file => /^image\/(jpg|jpeg|png|gif)$/i.test(file.type));
        
        if (images.length === 0) return false;

        // Handle image uploads
        images.forEach(image => {
          // Image upload logic would go here
          console.log('Processing image upload:', image.name);
        });

        return true;
      }
    }
  });
};

/**
 * Creates a plugin for managing hyperlinks
 * Requirement: Content Creation - Enables link management
 */
const createLinkPlugin = (): Plugin => {
  return new Plugin({
    props: {
      handleClick(view, pos, event) {
        const node = view.state.doc.nodeAt(pos);
        if (node && node.type.name === 'link') {
          // Handle link clicks
          event.preventDefault();
          const href = node.attrs.href;
          if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
          return true;
        }
        return false;
      }
    }
  });
};

/**
 * Initializes the rich text editor with provided configuration and plugins
 * Requirement: Content Creation - Supports the rich text editor initialization
 * 
 * @param config Editor configuration including schema and plugins
 * @returns Initialized editor state
 */
export const initializeEditor = (config: EditorConfig): EditorState => {
  // Validate the provided configuration
  const initialState: EditorState = {
    doc: ProseMirrorState.create(config).doc,
    selection: ProseMirrorState.create(config).selection,
    plugins: [
      ...config.plugins,
      createMarkdownPlugin(),
      createImagePlugin(),
      createLinkPlugin()
    ]
  };

  if (!validateEditorState(initialState)) {
    throw new Error('Invalid editor state configuration');
  }

  // Initialize editor state with provided schema and plugins
  const editorState = ProseMirrorState.create({
    schema: config.schema,
    plugins: initialState.plugins
  });

  // Create and integrate toolbar
  const toolbar = new Toolbar();
  const toolbarElement = toolbar.render(initialState);
  document.querySelector('.editor-container')?.prepend(toolbarElement);

  return {
    doc: editorState.doc,
    selection: editorState.selection,
    plugins: editorState.plugins
  };
};