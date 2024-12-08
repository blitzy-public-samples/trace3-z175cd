/**
 * @fileoverview Higher-level abstractions for managing storage operations
 * Addresses requirement: Content Management
 * Location: Technical Specification/Core Features/Content Creation
 * Purpose: Provides utilities for storing and retrieving publication and post-related data
 */

// Import storage utilities
import { 
  saveToStorage, 
  getFromStorage, 
  removeFromStorage 
} from '../utils/storage';

// Import types
import { Publication } from '../types/publication';
import { Post } from '../types/post';

// Human Tasks:
// 1. Review storage size requirements for publications and posts to ensure they fit within browser storage limits
// 2. Consider implementing data compression for large content before storage
// 3. Implement storage cleanup strategy for old/unused data
// 4. Add monitoring for storage quota usage
// 5. Consider implementing data encryption for sensitive content

/**
 * Storage key prefixes to prevent collisions
 */
const STORAGE_KEYS = {
  PUBLICATION: 'pub_',
  POST: 'post_'
} as const;

/**
 * Saves a publication object to localStorage or sessionStorage.
 * @param publication - The publication object to save
 * @param useSession - If true, uses sessionStorage; otherwise uses localStorage
 */
export const savePublication = (publication: Publication, useSession: boolean = false): void => {
  try {
    if (!publication || !publication.id) {
      throw new Error('Invalid publication object');
    }

    const storageKey = `${STORAGE_KEYS.PUBLICATION}${publication.id}`;
    const serializedData = JSON.stringify(publication);
    saveToStorage(storageKey, serializedData, useSession);
  } catch (error) {
    console.error('Error saving publication:', error);
    throw error;
  }
};

/**
 * Retrieves a publication object from localStorage or sessionStorage.
 * @param publicationId - The ID of the publication to retrieve
 * @param useSession - If true, retrieves from sessionStorage; otherwise from localStorage
 * @returns The retrieved publication object, or null if not found
 */
export const getPublication = (publicationId: string, useSession: boolean = false): Publication | null => {
  try {
    if (!publicationId) {
      throw new Error('Invalid publication ID');
    }

    const storageKey = `${STORAGE_KEYS.PUBLICATION}${publicationId}`;
    const storedData = getFromStorage(storageKey, useSession);
    
    if (!storedData) {
      return null;
    }

    const publication = JSON.parse(storedData) as Publication;
    
    // Convert date strings back to Date objects for subscriptions
    publication.subscriptions = publication.subscriptions.map(sub => ({
      ...sub,
      startDate: new Date(sub.startDate),
      endDate: new Date(sub.endDate)
    }));

    return publication;
  } catch (error) {
    console.error('Error retrieving publication:', error);
    throw error;
  }
};

/**
 * Removes a publication object from localStorage or sessionStorage.
 * @param publicationId - The ID of the publication to remove
 * @param useSession - If true, removes from sessionStorage; otherwise from localStorage
 */
export const removePublication = (publicationId: string, useSession: boolean = false): void => {
  try {
    if (!publicationId) {
      throw new Error('Invalid publication ID');
    }

    const storageKey = `${STORAGE_KEYS.PUBLICATION}${publicationId}`;
    removeFromStorage(storageKey, useSession);
  } catch (error) {
    console.error('Error removing publication:', error);
    throw error;
  }
};

/**
 * Saves a post object to localStorage or sessionStorage.
 * @param post - The post object to save
 * @param useSession - If true, uses sessionStorage; otherwise uses localStorage
 */
export const savePost = (post: Post, useSession: boolean = false): void => {
  try {
    if (!post || !post.id) {
      throw new Error('Invalid post object');
    }

    const storageKey = `${STORAGE_KEYS.POST}${post.id}`;
    
    // Create a serializable version of the post
    const serializablePost = {
      ...post,
      content: post.content.getCurrentContent().toJSON(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };

    const serializedData = JSON.stringify(serializablePost);
    saveToStorage(storageKey, serializedData, useSession);
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

/**
 * Retrieves a post object from localStorage or sessionStorage.
 * @param postId - The ID of the post to retrieve
 * @param useSession - If true, retrieves from sessionStorage; otherwise from localStorage
 * @returns The retrieved post object, or null if not found
 */
export const getPost = (postId: string, useSession: boolean = false): Post | null => {
  try {
    if (!postId) {
      throw new Error('Invalid post ID');
    }

    const storageKey = `${STORAGE_KEYS.POST}${postId}`;
    const storedData = getFromStorage(storageKey, useSession);
    
    if (!storedData) {
      return null;
    }

    const parsedData = JSON.parse(storedData);
    
    // Reconstruct the Post object with proper types
    const post: Post = {
      ...parsedData,
      content: EditorState.createWithContent(convertFromRaw(JSON.parse(parsedData.content))),
      createdAt: new Date(parsedData.createdAt),
      updatedAt: new Date(parsedData.updatedAt)
    };

    return post;
  } catch (error) {
    console.error('Error retrieving post:', error);
    throw error;
  }
};

/**
 * Removes a post object from localStorage or sessionStorage.
 * @param postId - The ID of the post to remove
 * @param useSession - If true, removes from sessionStorage; otherwise from localStorage
 */
export const removePost = (postId: string, useSession: boolean = false): void => {
  try {
    if (!postId) {
      throw new Error('Invalid post ID');
    }

    const storageKey = `${STORAGE_KEYS.POST}${postId}`;
    removeFromStorage(storageKey, useSession);
  } catch (error) {
    console.error('Error removing post:', error);
    throw error;
  }
};