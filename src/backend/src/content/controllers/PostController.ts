/**
 * @fileoverview Controller for managing blog posts, including creating, retrieving, updating, and deleting posts.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Supports the creation, retrieval, and management of blog posts through HTTP endpoints.
 * 
 * Human Tasks:
 * - Ensure proper error monitoring is configured for production environment
 * - Set up rate limiting for post creation endpoints if required
 * - Configure appropriate caching strategies for post retrieval
 * - Review and adjust file upload limits for post media attachments
 */

// express v4.18.2
import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { ContentService } from '../services/ContentService';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { IController } from '../../common/interfaces/IController';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import Joi from 'joi'; // joi v17.6.0

// Validation schemas for post operations
const createPostSchema = Joi.object({
    title: Joi.string().required().min(1).max(200),
    content: Joi.string().required().min(1),
    authorId: Joi.string().required().uuid(),
    publicationId: Joi.string().required().uuid()
});

const updatePostSchema = Joi.object({
    title: Joi.string().min(1).max(200),
    content: Joi.string().min(1)
}).min(1);

/**
 * Controller class for handling blog post-related HTTP requests.
 * Implements the IController interface for standardized request handling.
 */
export class PostController implements IController {
    private contentService: ContentService;

    constructor() {
        this.contentService = new ContentService();
    }

    /**
     * Implements the IController interface method for handling requests.
     */
    public async handleRequest(req: Request, res: Response): Promise<void> {
        try {
            // Route to appropriate handler based on HTTP method
            switch (req.method) {
                case 'POST':
                    await this.createPost(req, res);
                    break;
                case 'GET':
                    await this.getPost(req, res);
                    break;
                case 'PUT':
                    await this.updatePost(req, res);
                    break;
                case 'DELETE':
                    await this.deletePost(req, res);
                    break;
                default:
                    res.status(405).json({
                        code: ERROR_CODES.VALIDATION_ERROR,
                        message: 'Method not allowed'
                    });
            }
        } catch (error) {
            errorHandler(error as Error, req, res, () => {});
        }
    }

    /**
     * Creates a new blog post.
     */
    public async createPost(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            await validationMiddleware(createPostSchema, { body: true })(req, res, () => {});

            // Create post using content service
            const post = await this.contentService.createPost(req.body);

            // Handle media attachments if present
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    await this.contentService.attachMediaToPost(post.id, {
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        buffer: file.buffer
                    });
                }
            }

            res.status(201).json({
                message: 'Post created successfully',
                data: post
            });
        } catch (error) {
            errorHandler(error as Error, req, res, () => {});
        }
    }

    /**
     * Retrieves a blog post by its ID.
     */
    public async getPost(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            if (!postId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Post ID is required`);
            }

            const post = await Post.getPostById(postId);
            if (!post) {
                res.status(404).json({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: 'Post not found'
                });
                return;
            }

            res.status(200).json({
                data: post
            });
        } catch (error) {
            errorHandler(error as Error, req, res, () => {});
        }
    }

    /**
     * Updates an existing blog post.
     */
    public async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            if (!postId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Post ID is required`);
            }

            // Validate update data
            await validationMiddleware(updatePostSchema, { body: true })(req, res, () => {});

            const success = await Post.updatePost(postId, req.body);
            if (!success) {
                res.status(404).json({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: 'Post not found or update failed'
                });
                return;
            }

            // Retrieve updated post
            const updatedPost = await Post.getPostById(postId);
            res.status(200).json({
                message: 'Post updated successfully',
                data: updatedPost
            });
        } catch (error) {
            errorHandler(error as Error, req, res, () => {});
        }
    }

    /**
     * Deletes a blog post by its ID.
     */
    public async deletePost(req: Request, res: Response): Promise<void> {
        try {
            const postId = req.params.id;
            if (!postId) {
                throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Post ID is required`);
            }

            const success = await Post.deletePost(postId);
            if (!success) {
                res.status(404).json({
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    message: 'Post not found or deletion failed'
                });
                return;
            }

            res.status(200).json({
                message: 'Post deleted successfully'
            });
        } catch (error) {
            errorHandler(error as Error, req, res, () => {});
        }
    }
}