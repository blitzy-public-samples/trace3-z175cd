/**
 * @fileoverview Controller for managing comment-related operations, including creating,
 * retrieving, updating, and deleting comments associated with posts.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Supports the creation, retrieval, and management of comments associated with posts.
 * 
 * Human Tasks:
 * - Ensure proper error monitoring is configured for comment operations
 * - Review and adjust comment size limits if needed
 * - Configure rate limiting for comment creation if required
 */

import { Request, Response } from 'express';
import { Comment, updateComment } from '../models/Comment';
import { ContentService } from '../services/ContentService';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { IController } from '../../common/interfaces/IController';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { logError } from '../../common/utils/logger';
import Joi from 'joi'; // joi v17.6.0

// Validation schemas for comment operations
const createCommentSchema = Joi.object({
    content: Joi.string().required().min(1).max(1000),
    postId: Joi.string().required().uuid(),
    userId: Joi.string().required().uuid()
});

const updateCommentSchema = Joi.object({
    content: Joi.string().required().min(1).max(1000)
});

/**
 * Controller class for handling comment-related operations.
 * Implements the IController interface for standardized request handling.
 */
export class CommentController implements IController {
    private contentService: ContentService;

    constructor() {
        this.contentService = new ContentService();
    }

    /**
     * Implements the IController interface method for handling requests.
     */
    public async handleRequest(req: Request, res: Response): Promise<void> {
        try {
            // Implementation would depend on the specific operation being handled
            res.status(200).json({ success: true });
        } catch (error) {
            errorHandler(error, req, res, () => {});
        }
    }

    /**
     * Creates a new comment for a post.
     */
    @validationMiddleware(createCommentSchema)
    public async createComment(req: Request, res: Response): Promise<void> {
        try {
            const commentData = req.validated.body;

            const success = await this.contentService.addCommentToPost(
                commentData.postId,
                {
                    content: commentData.content,
                    userId: commentData.userId
                }
            );

            if (success) {
                res.status(201).json({
                    message: 'Comment created successfully'
                });
            } else {
                throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to create comment`);
            }
        } catch (error) {
            logError('Failed to create comment', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                requestData: req.body
            });
            errorHandler(error, req, res, () => {});
        }
    }

    /**
     * Retrieves all comments for a specific post.
     */
    public async getComments(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.params;

            if (!postId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Post ID is required`);
            }

            const comments = await Comment.getCommentsByPostId(postId);
            
            res.status(200).json({
                comments: comments.map(comment => ({
                    id: comment.id,
                    content: comment.content,
                    userId: comment.userId,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt
                }))
            });
        } catch (error) {
            logError('Failed to retrieve comments', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                postId: req.params.postId
            });
            errorHandler(error, req, res, () => {});
        }
    }

    /**
     * Updates an existing comment.
     */
    @validationMiddleware(updateCommentSchema)
    public async updateComment(req: Request, res: Response): Promise<void> {
        try {
            const { commentId } = req.params;
            const { content } = req.validated.body;

            if (!commentId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Comment ID is required`);
            }

            const success = await updateComment(commentId, { content });

            if (success) {
                res.status(200).json({
                    message: 'Comment updated successfully'
                });
            } else {
                throw new Error(`${ERROR_CODES.RESOURCE_NOT_FOUND}: Comment not found or update failed`);
            }
        } catch (error) {
            logError('Failed to update comment', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                commentId: req.params.commentId,
                updateData: req.body
            });
            errorHandler(error, req, res, () => {});
        }
    }

    /**
     * Deletes a comment.
     */
    public async deleteComment(req: Request, res: Response): Promise<void> {
        try {
            const { commentId } = req.params;

            if (!commentId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Comment ID is required`);
            }

            const success = await Comment.deleteComment(commentId);

            if (success) {
                res.status(200).json({
                    message: 'Comment deleted successfully'
                });
            } else {
                throw new Error(`${ERROR_CODES.RESOURCE_NOT_FOUND}: Comment not found or delete failed`);
            }
        } catch (error) {
            logError('Failed to delete comment', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                commentId: req.params.commentId
            });
            errorHandler(error, req, res, () => {});
        }
    }
}