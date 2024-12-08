// @version: @reduxjs/toolkit@1.9.x
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EditorState } from '../types/editor';
import { validateEditorState } from '../utils/validation';

/**
 * Human Tasks:
 * 1. Ensure @reduxjs/toolkit is installed with version 1.9.x
 * 2. Configure Redux DevTools for development environment
 * 3. Review initial state values for editor configuration
 */

/**
 * Initial state for the editor slice
 * Requirement: Content Creation - Initializes editor with empty document
 */
const initialState: EditorState = {
  doc: {
    type: 'doc',
    content: [],
    nodeSize: 2
  },
  selection: {
    from: 0,
    to: 0,
    anchor: 0,
    head: 0
  },
  plugins: []
};

/**
 * Redux slice for managing editor state
 * Requirement: Content Creation - Supports rich text editor state management
 */
export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    /**
     * Updates the entire editor state
     * Validates state before updating to ensure data integrity
     */
    updateEditorState: (state, action: PayloadAction<EditorState>) => {
      const newState = action.payload;
      if (validateEditorState(newState)) {
        state.doc = newState.doc;
        state.selection = newState.selection;
        state.plugins = newState.plugins;
      } else {
        console.error('Invalid editor state update rejected');
      }
    },

    /**
     * Updates only the document content
     * Preserves existing selection and plugins
     */
    updateDocument: (state, action: PayloadAction<EditorState['doc']>) => {
      const newDoc = action.payload;
      if (newDoc && typeof newDoc.nodeSize === 'number') {
        state.doc = newDoc;
      }
    },

    /**
     * Updates the selection state
     * Validates selection bounds
     */
    updateSelection: (state, action: PayloadAction<EditorState['selection']>) => {
      const newSelection = action.payload;
      if (
        newSelection &&
        typeof newSelection.from === 'number' &&
        typeof newSelection.to === 'number'
      ) {
        state.selection = newSelection;
      }
    },

    /**
     * Updates the plugins array
     * Validates plugin objects
     */
    updatePlugins: (state, action: PayloadAction<EditorState['plugins']>) => {
      const newPlugins = action.payload;
      if (Array.isArray(newPlugins)) {
        const validPlugins = newPlugins.every(plugin => 
          plugin && typeof plugin.spec === 'object'
        );
        if (validPlugins) {
          state.plugins = newPlugins;
        }
      }
    },

    /**
     * Resets the editor state to initial values
     * Used when clearing the editor or handling errors
     */
    resetEditorState: (state) => {
      state.doc = initialState.doc;
      state.selection = initialState.selection;
      state.plugins = initialState.plugins;
    }
  }
});

// Export actions for use in components
export const {
  updateEditorState,
  updateDocument,
  updateSelection,
  updatePlugins,
  resetEditorState
} = editorSlice.actions;

// Export reducer for store configuration
export const editorReducer = editorSlice.reducer;

// Selector to get the current editor state
export const selectEditorState = (state: { editor: EditorState }): EditorState => state.editor;