// @ts-check

// validator v13.x
import validateEmail from 'validator';

// Import types from internal modules
import { EngagementMetric } from '../types/analytics';
import { AuthUser } from '../types/auth';
import { EditorState } from '../types/editor';
import { Post } from '../types/post';
import { Publication } from '../types/publication';
import { Subscription } from '../types/subscription';

/**
 * Human Tasks:
 * 1. Ensure validator package is installed with correct version
 * 2. Configure validation rules based on business requirements
 * 3. Set up error logging for validation failures
 * 4. Review and adjust validation thresholds as needed
 */

/**
 * @requirement Data Validation
 * Validates the structure of an engagement metric object.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validateEngagementMetric = (metric: EngagementMetric): boolean => {
  if (!metric || typeof metric !== 'object') {
    return false;
  }

  // Check if views, clicks, and shares are non-negative numbers
  if (typeof metric.views !== 'number' || metric.views < 0 ||
      typeof metric.clicks !== 'number' || metric.clicks < 0 ||
      typeof metric.shares !== 'number' || metric.shares < 0) {
    return false;
  }

  return true;
};

/**
 * @requirement Data Validation
 * Validates the structure of an authenticated user object.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validateAuthUser = (user: AuthUser): boolean => {
  if (!user || typeof user !== 'object') {
    return false;
  }

  // Check if id and email are non-empty strings
  if (typeof user.id !== 'string' || user.id.trim() === '' ||
      typeof user.email !== 'string' || user.email.trim() === '') {
    return false;
  }

  // Validate email format using validator library
  if (!validateEmail(user.email)) {
    return false;
  }

  return true;
};

/**
 * @requirement Data Validation
 * Validates the structure of the editor state to ensure data integrity.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validateEditorState = (editorState: EditorState): boolean => {
  if (!editorState || typeof editorState !== 'object') {
    return false;
  }

  try {
    // Check if the 'doc' property is a valid ProseMirror Node
    if (!editorState.doc || typeof editorState.doc.nodeSize !== 'number') {
      return false;
    }

    // Verify that the 'selection' property is a valid ProseMirror Selection
    if (!editorState.selection || 
        typeof editorState.selection.from !== 'number' || 
        typeof editorState.selection.to !== 'number') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * @requirement Data Validation
 * Validates the structure of a post object.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validatePost = (post: Post): boolean => {
  if (!post || typeof post !== 'object') {
    return false;
  }

  // Check if title is a non-empty string
  if (typeof post.title !== 'string' || post.title.trim() === '') {
    return false;
  }

  // Validate the content using validateEditorState
  if (!validateEditorState(post.content)) {
    return false;
  }

  return true;
};

/**
 * @requirement Data Validation
 * Validates the structure of a publication object.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validatePublication = (publication: Publication): boolean => {
  if (!publication || typeof publication !== 'object') {
    return false;
  }

  // Check if id and name are non-empty strings
  if (typeof publication.id !== 'string' || publication.id.trim() === '' ||
      typeof publication.name !== 'string' || publication.name.trim() === '') {
    return false;
  }

  return true;
};

/**
 * @requirement Data Validation
 * Validates the structure of a subscription object.
 * Location: Technical Specification/System Design/Cross-Cutting Concerns
 */
export const validateSubscription = (subscription: Subscription): boolean => {
  if (!subscription || typeof subscription !== 'object') {
    return false;
  }

  // Check if tier and status are non-empty strings
  if (typeof subscription.tier !== 'string' || subscription.tier.trim() === '' ||
      typeof subscription.status !== 'string' || subscription.status.trim() === '') {
    return false;
  }

  // Validate that status is one of the allowed values
  const validStatuses = ['active', 'inactive', 'cancelled'];
  if (!validStatuses.includes(subscription.status)) {
    return false;
  }

  return true;
};