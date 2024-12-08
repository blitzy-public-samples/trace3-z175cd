// @version: prosemirror-markdown@1.10.1

import { Plugin } from 'prosemirror-state';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import { EditorState, validateEditorState } from '../../../types/editor';

/**
 * Human Tasks:
 * 1. Ensure prosemirror-markdown package is installed with correct version
 * 2. Configure Markdown schema based on content requirements
 * 3. Review and adjust Markdown parsing rules for security implications
 * 4. Test Markdown serialization with various content types
 */

/**
 * Creates a ProseMirror plugin to enable Markdown syntax support in the editor.
 * Requirement: Content Creation - Supports rich text editor by providing Markdown syntax support
 * Location: Technical Specification/Core Features/Content Creation
 */
export const MarkdownPlugin = (editorState: EditorState): Plugin => {
  // Validate editor state before plugin initialization
  if (!validateEditorState(editorState)) {
    throw new Error('Invalid editor state provided to MarkdownPlugin');
  }

  // Define Markdown schema for supported syntax elements
  const schema = editorState.doc.type.schema;
  
  // Configure Markdown parser with supported tokens
  const markdownParser = new MarkdownParser(schema, {
    blockquote: { block: 'blockquote' },
    paragraph: { block: 'paragraph' },
    heading: { block: 'heading', getAttrs: (tok: any) => ({ level: +tok.tag.slice(1) }) },
    code_block: { block: 'code_block' },
    bullet_list: { block: 'bullet_list' },
    ordered_list: { block: 'ordered_list' },
    list_item: { block: 'list_item' },
    horizontal_rule: { node: 'horizontal_rule' },
    image: { node: 'image', getAttrs: (tok: any) => ({
      src: tok.attrGet('src'),
      title: tok.attrGet('title'),
      alt: tok.children[0]?.content || null
    })},
    hardbreak: { node: 'hard_break' },
    em: { mark: 'em' },
    strong: { mark: 'strong' },
    link: { mark: 'link', getAttrs: (tok: any) => ({
      href: tok.attrGet('href'),
      title: tok.attrGet('title')
    })},
    code: { mark: 'code' }
  });

  // Configure Markdown serializer for converting editor content to Markdown
  const markdownSerializer = new MarkdownSerializer({
    blockquote: (state, node) => {
      state.wrapBlock('> ', null, node, () => state.renderContent(node));
    },
    code_block: (state, node) => {
      state.write('```\n');
      state.text(node.textContent);
      state.ensureNewLine();
      state.write('```');
      state.closeBlock(node);
    },
    heading: (state, node) => {
      state.write('#'.repeat(node.attrs.level) + ' ');
      state.renderInline(node);
      state.closeBlock(node);
    },
    horizontal_rule: (state, node) => {
      state.write('---');
      state.closeBlock(node);
    },
    bullet_list: (state, node) => {
      state.renderList(node, '  ', () => '* ');
    },
    ordered_list: (state, node) => {
      let start = node.attrs.start || 1;
      state.renderList(node, '  ', i => `${start + i}. `);
    },
    list_item: (state, node) => {
      state.renderContent(node);
    },
    paragraph: (state, node) => {
      state.renderInline(node);
      state.closeBlock(node);
    },
    image: (state, node) => {
      state.write(`![${node.attrs.alt || ''}](${node.attrs.src}${
        node.attrs.title ? ` "${node.attrs.title}"` : ''
      })`);
    }
  }, {
    em: {
      open: '*',
      close: '*',
      mixable: true,
      expelEnclosingWhitespace: true
    },
    strong: {
      open: '**',
      close: '**',
      mixable: true,
      expelEnclosingWhitespace: true
    },
    link: {
      open: '[',
      close: (state, mark) => `](${mark.attrs.href}${
        mark.attrs.title ? ` "${mark.attrs.title}"` : ''
      })`,
      mixable: true
    },
    code: {
      open: '`',
      close: '`',
      mixable: false,
      escape: false
    }
  });

  // Create and return the Markdown plugin
  return new Plugin({
    key: new Plugin.key('markdown'),
    props: {
      // Handle paste events to parse Markdown content
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.getData('text/plain')) {
          const text = event.clipboardData.getData('text/plain');
          const doc = markdownParser.parse(text);
          
          if (doc) {
            const tr = view.state.tr.replaceSelectionWith(doc);
            view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
      
      // Handle drop events for Markdown files
      handleDrop: (view, event) => {
        if (event.dataTransfer && event.dataTransfer.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.name.endsWith('.md')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const text = e.target?.result as string;
              if (text) {
                const doc = markdownParser.parse(text);
                if (doc) {
                  const tr = view.state.tr.replaceSelectionWith(doc);
                  view.dispatch(tr);
                }
              }
            };
            reader.readAsText(file);
            return true;
          }
        }
        return false;
      }
    },
    
    // Add serialization methods to editor state
    state: {
      init() {
        return {
          parser: markdownParser,
          serializer: markdownSerializer
        };
      },
      apply() {
        return {
          parser: markdownParser,
          serializer: markdownSerializer
        };
      }
    }
  });
};