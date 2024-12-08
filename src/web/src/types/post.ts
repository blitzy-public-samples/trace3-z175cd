// @ts-check

/**
 * @fileoverview Post type definitions for the Substack Replica platform.
 * Addresses requirement: Content Creation
 * Location: Technical Specification/Core Features/Content Creation
 * Purpose: Defines types for posts, including metadata, content, and associated publication details
 */

// Human Tasks:
// 1. Ensure that the EditorState type from your chosen rich text editor library is properly configured
// 2. Configure validation rules for post content based on your editor's requirements

import { AuthUser } from './auth';

// Using Draft.js EditorState - Version 0.11.7
import { EditorState } from 'draft-js';

/**
 * Represents a publication entity that posts can be associated with
 */
interface Publication {
  /**
   * Unique identifier for the publication
   * Format: UUID v4
   */
  id: string;

  /**
   * Display name of the publication
   * Must be non-empty
   */
  name: string;
}

/**
 * Represents a complete post entity in the system
 * Addresses requirement: Content Creation
 * Location: Technical Specification/Core Features/Content Creation
 */
export interface Post {
  /**
   * Unique identifier for the post
   * Format: UUID v4
   */
  id: string;

  /**
   * Title of the post
   * Must be non-empty
   */
  title: string;

  /**
   * Rich text content of the post
   * Uses Draft.js EditorState for rich text handling
   */
  content: EditorState;

  /**
   * Author of the post
   * Contains essential user information
   */
  author: AuthUser;

  /**
   * Publication the post belongs to
   */
  publication: Publication;

  /**
   * Timestamp when the post was created
   * Format: ISO 8601
   */
  createdAt: Date;

  /**
   * Timestamp when the post was last updated
   * Format: ISO 8601
   */
  updatedAt: Date;
}

/**
 * Validates the content structure of a post
 * @param content - EditorState object containing the post content
 * @returns boolean indicating if the content is valid
 */
const validatePostContent = (content: EditorState): boolean => {
  if (!content || !(content instanceof EditorState)) {
    return false;
  }

  const contentState = content.getCurrentContent();
  if (!contentState) {
    return false;
  }

  // Ensure the content is not completely empty
  const hasText = contentState.hasText();
  const blockMap = contentState.getBlockMap();
  const hasBlocks = blockMap && blockMap.size > 0;

  return hasText && hasBlocks;
};

/**
 * Validates the complete post object structure
 * @param post - Post object to validate
 * @returns boolean indicating if the post is valid
 */
export const validatePost = (post: Post): boolean => {
  // Validate required string fields
  if (!post.id || typeof post.id !== 'string' || post.id.trim() === '') {
    return false;
  }

  if (!post.title || typeof post.title !== 'string' || post.title.trim() === '') {
    return false;
  }

  // Validate content
  if (!validatePostContent(post.content)) {
    return false;
  }

  // Validate author
  if (!post.author || !post.author.id || !post.author.email) {
    return false;
  }

  // Validate publication
  if (!post.publication || !post.publication.id || !post.publication.name) {
    return false;
  }

  // Validate dates
  if (!(post.createdAt instanceof Date) || !(post.updatedAt instanceof Date)) {
    return false;
  }

  return true;
};