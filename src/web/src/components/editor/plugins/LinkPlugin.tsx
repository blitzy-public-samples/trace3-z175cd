// @version: prosemirror-state@1.4.2
// @version: prosemirror-model@1.19.3

import { Plugin } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { validateEditorState } from '../../../utils/validation';
import { initializeEditor } from '../../../lib/editor';
import useEditor from '../../../hooks/useEditor';

/**
 * Human Tasks:
 * 1. Configure URL validation rules for link creation
 * 2. Set up link preview service integration if required
 * 3. Review security settings for external link handling
 * 4. Configure link tracking analytics if needed
 */

/**
 * @requirement Content Creation
 * Location: Technical Specification/Core Features/Content Creation
 * Creates a ProseMirror plugin for managing hyperlinks in the editor
 */
export const createLinkPlugin = (): Plugin => {
  return new Plugin({
    key: new Plugin.key('link'),

    state: {
      init() {
        return {
          activeLink: null,
          linkMenuOpen: false
        };
      },
      apply(tr, state) {
        const newState = { ...state };
        
        // Update active link state based on selection
        const { selection } = tr;
        if (selection) {
          const node = tr.doc.nodeAt(selection.from);
          if (node && node.type.name === 'link') {
            newState.activeLink = {
              node,
              pos: selection.from
            };
          } else {
            newState.activeLink = null;
          }
        }

        return newState;
      }
    },

    props: {
      handleClick(view, pos, event) {
        const node = view.state.doc.nodeAt(pos);
        if (node && node.type.name === 'link') {
          // Handle link clicks with security measures
          event.preventDefault();
          const href = node.attrs.href;
          if (href && isValidUrl(href)) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
          return true;
        }
        return false;
      },

      handleKeyDown(view, event) {
        // Handle keyboard shortcuts for link creation/editing
        if (event.ctrlKey && event.key === 'k') {
          event.preventDefault();
          openLinkMenu(view);
          return true;
        }
        return false;
      }
    },

    appendTransaction(transactions, oldState, newState) {
      // Handle link validation and cleanup
      const tr = newState.tr;
      let modified = false;

      newState.doc.descendants((node, pos) => {
        if (node.type.name === 'link') {
          const href = node.attrs.href;
          if (!isValidUrl(href)) {
            tr.removeNodeAttribute(pos, 'href');
            modified = true;
          }
        }
      });

      return modified ? tr : null;
    }
  });
};

/**
 * Validates URL format and security
 * @param url URL to validate
 * @returns boolean indicating if URL is valid and safe
 */
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Ensure protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    // Additional security checks can be added here
    return true;
  } catch {
    return false;
  }
};

/**
 * Opens the link creation/editing menu
 * @param view Current editor view
 */
const openLinkMenu = (view: any) => {
  const { state, dispatch } = view;
  const { selection } = state;
  
  if (!selection || !selection.empty) {
    const tr = state.tr.setMeta('link', {
      action: 'OPEN_MENU',
      pos: selection.from
    });
    dispatch(tr);
  }
};

/**
 * Creates a link node with the given URL
 * @param url URL for the link
 * @param text Display text for the link
 * @returns Link node
 */
const createLinkNode = (url: string, text: string): Node => {
  return Node.create({
    type: 'link',
    attrs: { href: url },
    content: [{
      type: 'text',
      text
    }]
  });
};

/**
 * Command to insert or update a link
 * @param url URL for the link
 * @param text Optional display text
 */
const insertLink = (view: any, url: string, text?: string) => {
  const { state, dispatch } = view;
  const { selection } = state;
  
  if (isValidUrl(url)) {
    const node = createLinkNode(url, text || url);
    const tr = state.tr.replaceSelectionWith(node);
    dispatch(tr);
  }
};

/**
 * Command to remove a link, preserving its text content
 */
const removeLink = (view: any) => {
  const { state, dispatch } = view;
  const { selection } = state;
  
  if (selection) {
    const tr = state.tr.removeMark(
      selection.from,
      selection.to,
      state.schema.marks.link
    );
    dispatch(tr);
  }
};