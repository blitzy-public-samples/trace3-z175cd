// @version: prosemirror-state@1.4.2
// @version: prosemirror-model@1.19.3

import { Plugin } from 'prosemirror-state';
import { Node } from 'prosemirror-model';
import { initializeEditor } from '../../../lib/editor';
import useMedia from '../../../hooks/useMedia';
import { validatePost } from '../../../utils/validation';
import MediaUploader from '../MediaUploader';

/**
 * Human Tasks:
 * 1. Configure image upload service endpoint in environment variables
 * 2. Set up CDN for image hosting and delivery
 * 3. Review image size and format restrictions
 * 4. Configure CORS policies for image uploads
 * 5. Set up image optimization pipeline
 */

/**
 * Creates a ProseMirror plugin for handling image uploads and embedding
 * Requirement: Content Creation - Enables users to upload and embed images directly into the rich text editor
 * Location: Technical Specification/Core Features/Content Creation
 * 
 * @param editorState - The current editor state
 * @returns A configured ProseMirror plugin for image handling
 */
const ImagePlugin = (editorState: EditorState) => {
  // Initialize media handling hook
  const { uploadMedia, mediaList, isLoading } = useMedia();

  return new Plugin({
    key: new Plugin.key('image'),

    props: {
      // Handle image drop events
      handleDrop(view, event, slice, moved) {
        if (!event.dataTransfer) return false;

        const files = Array.from(event.dataTransfer.files);
        const images = files.filter(file => 
          /^image\/(jpeg|png|gif|webp)$/i.test(file.type)
        );

        if (images.length === 0) return false;

        // Prevent default handling
        event.preventDefault();

        // Process each dropped image
        images.forEach(async (image) => {
          try {
            // Upload the image
            await uploadMedia(image);

            // Create an image node
            const imageNode = view.state.schema.nodes.image.create({
              src: URL.createObjectURL(image),
              alt: image.name,
              title: image.name
            });

            // Insert the image at the drop position
            const transaction = view.state.tr.replaceSelectionWith(imageNode);
            view.dispatch(transaction);
          } catch (error) {
            console.error('Failed to process dropped image:', error);
          }
        });

        return true;
      },

      // Handle paste events for images
      handlePaste(view, event, slice) {
        if (!event.clipboardData) return false;

        const files = Array.from(event.clipboardData.files);
        const images = files.filter(file => 
          /^image\/(jpeg|png|gif|webp)$/i.test(file.type)
        );

        if (images.length === 0) return false;

        // Prevent default handling
        event.preventDefault();

        // Process each pasted image
        images.forEach(async (image) => {
          try {
            // Upload the image
            await uploadMedia(image);

            // Create an image node
            const imageNode = view.state.schema.nodes.image.create({
              src: URL.createObjectURL(image),
              alt: image.name,
              title: image.name
            });

            // Insert the image at the cursor position
            const transaction = view.state.tr.replaceSelectionWith(imageNode);
            view.dispatch(transaction);
          } catch (error) {
            console.error('Failed to process pasted image:', error);
          }
        });

        return true;
      },

      // Define node view for images
      nodeViews: {
        image(node: Node) {
          const dom = document.createElement('img');
          dom.src = node.attrs.src;
          dom.alt = node.attrs.alt || '';
          dom.title = node.attrs.title || '';
          
          // Add loading state class if needed
          if (isLoading) {
            dom.classList.add('loading');
          }

          // Add image styling classes
          dom.classList.add(
            'max-w-full',
            'h-auto',
            'rounded-lg',
            'shadow-md',
            'my-4'
          );

          // Validate image node
          const isValid = validatePost({
            id: 'temp',
            title: 'Image Upload',
            content: editorState,
            author: { id: 'system', email: 'system', role: 'system', token: '' },
            publication: { id: 'system', name: 'system' },
            createdAt: new Date(),
            updatedAt: new Date()
          });

          if (!isValid) {
            console.error('Invalid image node structure');
          }

          return {
            dom,
            update: (node: Node) => {
              dom.src = node.attrs.src;
              dom.alt = node.attrs.alt || '';
              dom.title = node.attrs.title || '';
              return true;
            },
            destroy: () => {
              // Cleanup if needed
            }
          };
        }
      }
    },

    // Plugin state handling
    state: {
      init() {
        return {
          images: mediaList
        };
      },
      apply(tr, pluginState) {
        return pluginState;
      }
    }
  });
};

export default ImagePlugin;