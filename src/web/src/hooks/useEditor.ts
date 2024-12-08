// @version: react-redux@8.1.1

import { useDispatch, useSelector } from 'react-redux';
import { initializeEditor } from '../lib/editor';
import { validateEditorState } from '../utils/validation';

/**
 * Human Tasks:
 * 1. Ensure react-redux is installed with correct version
 * 2. Configure Redux store with editor state slice
 * 3. Set up editor state actions and reducers
 * 4. Review editor initialization configuration
 */

// Define types for the editor state in Redux store
interface EditorReduxState {
  editor: {
    state: EditorState;
    isValid: boolean;
    isDirty: boolean;
  };
}

/**
 * Custom React hook for managing the state and interactions of the rich text editor
 * Requirement: Content Creation - Supports the rich text editor by providing a custom hook for managing editor state and interactions
 * Location: Technical Specification/Core Features/Content Creation
 */
const useEditor = () => {
  const dispatch = useDispatch();

  // Select editor state from Redux store
  const editorState = useSelector((state: EditorReduxState) => state.editor.state);
  const isValid = useSelector((state: EditorReduxState) => state.editor.isValid);
  const isDirty = useSelector((state: EditorReduxState) => state.editor.isDirty);

  /**
   * Initialize the editor with default configuration
   * Requirement: Content Creation - Supports the rich text editor initialization
   */
  const initializeEditorState = () => {
    try {
      const initialState = initializeEditor({
        schema: {
          nodes: {
            doc: { content: 'block+' },
            paragraph: { group: 'block' },
            heading: { group: 'block', content: 'inline*' },
            text: { group: 'inline' }
          },
          plugins: []
        }
      });

      dispatch({ type: 'editor/setState', payload: initialState });
      
      // Validate the initialized state
      const isValidState = validateEditorState(initialState);
      dispatch({ type: 'editor/setValid', payload: isValidState });
      
      return initialState;
    } catch (error) {
      dispatch({ type: 'editor/setValid', payload: false });
      throw new Error('Failed to initialize editor state');
    }
  };

  /**
   * Update the editor state
   * Requirement: Content Creation - Manages editor state updates
   */
  const updateEditorState = (newState: EditorState) => {
    try {
      const isValidState = validateEditorState(newState);
      
      dispatch({ type: 'editor/setState', payload: newState });
      dispatch({ type: 'editor/setValid', payload: isValidState });
      dispatch({ type: 'editor/setDirty', payload: true });
      
      return isValidState;
    } catch (error) {
      dispatch({ type: 'editor/setValid', payload: false });
      return false;
    }
  };

  /**
   * Reset the editor state to its initial state
   * Requirement: Content Creation - Supports editor state reset
   */
  const resetEditorState = () => {
    try {
      const initialState = initializeEditor({
        schema: {
          nodes: {
            doc: { content: 'block+' },
            paragraph: { group: 'block' },
            text: { group: 'inline' }
          },
          plugins: []
        }
      });

      dispatch({ type: 'editor/setState', payload: initialState });
      dispatch({ type: 'editor/setValid', payload: true });
      dispatch({ type: 'editor/setDirty', payload: false });
      
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    // Editor state
    editorState,
    isValid,
    isDirty,

    // State management functions
    initializeEditorState,
    updateEditorState,
    resetEditorState,
  };
};

export default useEditor;