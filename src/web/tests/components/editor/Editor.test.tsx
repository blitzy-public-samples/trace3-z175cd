// @version: @testing-library/react@13.x
// @version: jest@29.x

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Editor from '../../../src/components/editor/Editor';
import Toolbar from '../../../src/components/editor/Toolbar';
import MediaUploader from '../../../src/components/editor/MediaUploader';
import ImagePlugin from '../../../src/components/editor/plugins/ImagePlugin';
import { createLinkPlugin } from '../../../src/components/editor/plugins/LinkPlugin';
import { MarkdownPlugin } from '../../../src/components/editor/plugins/MarkdownPlugin';
import { validateEditorState } from '../../../src/utils/validation';
import useEditor from '../../../src/hooks/useEditor';

// Mock the hooks and plugins
jest.mock('../../../src/hooks/useEditor');
jest.mock('../../../src/components/editor/plugins/ImagePlugin');
jest.mock('../../../src/components/editor/plugins/LinkPlugin');
jest.mock('../../../src/components/editor/plugins/MarkdownPlugin');

/**
 * Test suite for the Editor component
 * Requirement: Content Creation
 * Location: Technical Specification/Core Features/Content Creation
 */
describe('Editor Component', () => {
  // Setup common test props and mocks
  beforeEach(() => {
    // Mock useEditor hook
    (useEditor as jest.Mock).mockReturnValue({
      editorState: {
        doc: { nodeSize: 2, content: [] },
        selection: { from: 0, to: 0 },
        plugins: []
      },
      updateEditorState: jest.fn(),
      isValid: true
    });

    // Mock plugin functions
    (ImagePlugin as jest.Mock).mockReturnValue({});
    (createLinkPlugin as jest.Mock).mockReturnValue({});
    (MarkdownPlugin as jest.Mock).mockReturnValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Editor Rendering
   * Requirement: Content Creation - Ensures the editor renders correctly with all components
   */
  test('renders editor with toolbar and media uploader', () => {
    render(<Editor />);

    // Verify main editor container exists
    expect(screen.getByRole('textbox', { name: /rich text editor content area/i }))
      .toBeInTheDocument();

    // Verify toolbar is rendered
    expect(screen.getByRole('toolbar')).toBeInTheDocument();

    // Verify media uploader is rendered
    expect(screen.getByTestId('media-uploader')).toBeInTheDocument();
  });

  /**
   * Test: Editor State Management
   * Requirement: Content Creation - Verifies editor state management
   */
  test('initializes editor state with plugins', () => {
    render(<Editor />);

    // Verify editor state was initialized
    expect(useEditor).toHaveBeenCalled();
    
    // Verify plugins were initialized
    expect(ImagePlugin).toHaveBeenCalled();
    expect(createLinkPlugin).toHaveBeenCalled();
    expect(MarkdownPlugin).toHaveBeenCalled();
  });

  /**
   * Test: Content Editing
   * Requirement: Content Creation - Tests basic content editing functionality
   */
  test('handles text input correctly', () => {
    const { container } = render(<Editor />);
    const editorContent = container.querySelector('#editor-content');
    
    // Simulate typing text
    fireEvent.input(editorContent!, {
      target: { textContent: 'Test content' }
    });

    // Verify editor state was updated
    expect(useEditor().updateEditorState).toHaveBeenCalled();
  });

  /**
   * Test: Plugin Integration
   * Requirement: Content Creation - Verifies plugin functionality
   */
  test('integrates plugins correctly', () => {
    render(<Editor />);

    // Verify image plugin integration
    expect(ImagePlugin).toHaveBeenCalledWith(expect.any(Object));

    // Verify link plugin integration
    expect(createLinkPlugin).toHaveBeenCalled();

    // Verify markdown plugin integration
    expect(MarkdownPlugin).toHaveBeenCalledWith(expect.any(Object));
  });

  /**
   * Test: Editor Validation
   * Requirement: Content Creation - Tests editor state validation
   */
  test('validates editor state', () => {
    render(<Editor />);
    
    const mockEditorState = {
      doc: { nodeSize: 2, content: [] },
      selection: { from: 0, to: 0 },
      plugins: []
    };

    // Verify editor state validation
    expect(validateEditorState(mockEditorState)).toBeTruthy();
  });

  /**
   * Test: Media Upload Integration
   * Requirement: Content Creation - Tests media upload functionality
   */
  test('handles media uploads', async () => {
    render(<Editor />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('media-upload-input');

    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });

    // Verify media uploader was triggered
    expect(screen.getByTestId('media-uploader')).toHaveAttribute('data-uploading', 'true');
  });

  /**
   * Test: Toolbar Integration
   * Requirement: Content Creation - Tests toolbar functionality
   */
  test('integrates toolbar commands', () => {
    render(<Editor />);
    
    // Test bold command
    const boldButton = screen.getByRole('button', { name: /bold/i });
    fireEvent.click(boldButton);

    // Verify editor state was updated
    expect(useEditor().updateEditorState).toHaveBeenCalled();
  });

  /**
   * Test: Accessibility
   * Requirement: Content Creation - Verifies accessibility features
   */
  test('meets accessibility requirements', () => {
    render(<Editor />);

    // Verify ARIA labels
    expect(screen.getByRole('textbox', { name: /rich text editor content area/i }))
      .toHaveAttribute('aria-label');

    // Verify status information
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  /**
   * Test: Cleanup
   * Requirement: Content Creation - Tests cleanup on unmount
   */
  test('cleans up resources on unmount', () => {
    const { unmount } = render(<Editor />);
    
    // Mock editor view destroy method
    const mockDestroy = jest.fn();
    (useEditor as jest.Mock).mockReturnValue({
      ...useEditor(),
      editorView: { destroy: mockDestroy }
    });

    // Unmount component
    unmount();

    // Verify cleanup was performed
    expect(mockDestroy).toHaveBeenCalled();
  });
});