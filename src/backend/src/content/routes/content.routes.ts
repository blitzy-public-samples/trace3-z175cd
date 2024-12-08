/**
 * @fileoverview Defines routing logic for content-related operations including posts,
 * comments, media, and publications.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Maps HTTP endpoints to controllers for managing posts, comments, media, and publications.
 * - Input Validation (Technical Specification/Cross-Cutting Concerns/Validation)
 *   Applies validation middleware to ensure data integrity.
 * - Error Handling (Technical Specification/Cross-Cutting Concerns/Logging)
 *   Implements centralized error handling for all content routes.
 * 
 * Human Tasks:
 * - Configure rate limiting for content creation endpoints
 * - Set up monitoring for high-traffic content endpoints
 * - Review and adjust file upload limits for media
 * - Configure caching headers for content retrieval endpoints
 */

import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { MediaController } from '../controllers/MediaController';
import { PostController } from '../controllers/PostController';
import { PublicationController } from '../controllers/PublicationController';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';

// Initialize controllers
const commentController = new CommentController();
const postController = new PostController();
const publicationController = new PublicationController();

// Create router instance
const contentRoutes = Router();

// Post routes
contentRoutes.post(
  '/posts',
  postController.createPost.bind(postController)
);

contentRoutes.get(
  '/posts/:id',
  postController.getPost.bind(postController)
);

contentRoutes.put(
  '/posts/:id',
  postController.updatePost.bind(postController)
);

contentRoutes.delete(
  '/posts/:id',
  postController.deletePost.bind(postController)
);

// Comment routes
contentRoutes.post(
  '/posts/:postId/comments',
  commentController.createComment.bind(commentController)
);

contentRoutes.get(
  '/posts/:postId/comments',
  commentController.getComments.bind(commentController)
);

contentRoutes.put(
  '/comments/:commentId',
  commentController.updateComment.bind(commentController)
);

contentRoutes.delete(
  '/comments/:commentId',
  commentController.deleteComment.bind(commentController)
);

// Media routes
contentRoutes.post(
  '/media',
  MediaController.uploadMediaHandler
);

contentRoutes.get(
  '/media/:fileKey/metadata',
  MediaController.retrieveMediaMetadataHandler
);

contentRoutes.delete(
  '/media/:fileKey',
  MediaController.deleteMediaHandler
);

// Publication routes
contentRoutes.post(
  '/publications',
  publicationController.createPublication.bind(publicationController)
);

contentRoutes.get(
  '/publications/:id',
  publicationController.getPublication.bind(publicationController)
);

contentRoutes.put(
  '/publications/:id',
  publicationController.updatePublication.bind(publicationController)
);

contentRoutes.delete(
  '/publications/:id',
  publicationController.deletePublication.bind(publicationController)
);

// Apply error handling middleware to all routes
contentRoutes.use(errorHandler);

export default contentRoutes;