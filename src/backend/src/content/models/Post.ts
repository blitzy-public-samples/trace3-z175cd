/**
 * @fileoverview Defines the Post model for managing blog posts, including properties,
 * relationships, and methods for CRUD operations.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Supports the creation, retrieval, and management of blog posts, including their
 *   relationships with comments, media, and publications.
 * 
 * Human Tasks:
 * - Ensure PostgreSQL database has the posts table created with appropriate schema
 * - Configure appropriate indexes on id, authorId, and publicationId columns
 * - Set up proper cascading delete rules for post deletion
 * - Configure full-text search indexes if required for content searching
 */

// joi v17.6.0
import Joi from 'joi';
import { Comment, updateComment } from './Comment';
import { Media } from './Media';
import { Publication } from './Publication';
import { validateSchema } from '../../common/utils/validator';
import { ERROR_CODES } from '../../common/constants/errorCodes';
import { initializeDatabase } from '../../common/config/database';
import { logError } from '../../common/utils/logger';

// Validation schemas for post data
const postSchema = Joi.object({
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
 * Represents a blog post in the content management system.
 */
export class Post {
    public readonly id: string;
    public title: string;
    public content: string;
    public readonly authorId: string;
    public comments: Comment[];
    public media: Media[];
    public readonly publicationId: string;
    public readonly createdAt: Date;
    public updatedAt: Date;

    /**
     * Creates a new Post instance.
     */
    constructor(
        id: string,
        title: string,
        content: string,
        authorId: string,
        publicationId: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.publicationId = publicationId;
        this.comments = [];
        this.media = [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Adds a new comment to the post.
     */
    public async addComment(comment: Comment): Promise<void> {
        try {
            validateSchema(comment, Joi.object({
                content: Joi.string().required().min(1).max(1000),
                userId: Joi.string().required().uuid()
            }));

            this.comments.push(comment);
        } catch (error) {
            logError('Failed to add comment to post', {
                code: ERROR_CODES.VALIDATION_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                postId: this.id
            });
            throw error;
        }
    }

    /**
     * Adds a new media asset to the post.
     */
    public async addMedia(media: Media): Promise<void> {
        try {
            const metadata = media.getMetadata();
            validateSchema(metadata, Joi.object({
                size: Joi.number().required(),
                mimeType: Joi.string().required(),
                createdAt: Joi.date().required(),
                updatedAt: Joi.date().required()
            }));

            this.media.push(media);
        } catch (error) {
            logError('Failed to add media to post', {
                code: ERROR_CODES.VALIDATION_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                postId: this.id
            });
            throw error;
        }
    }

    /**
     * Removes a comment from the post by its ID.
     */
    public async removeComment(commentId: string): Promise<boolean> {
        try {
            const commentIndex = this.comments.findIndex(comment => comment.id === commentId);
            if (commentIndex === -1) {
                logError('Comment not found', {
                    code: ERROR_CODES.RESOURCE_NOT_FOUND,
                    commentId,
                    postId: this.id
                });
                return false;
            }

            this.comments.splice(commentIndex, 1);
            return true;
        } catch (error) {
            logError('Failed to remove comment from post', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                commentId,
                postId: this.id
            });
            return false;
        }
    }
}

/**
 * Creates a new post in the database.
 */
export async function createPost(postData: {
    title: string;
    content: string;
    authorId: string;
    publicationId: string;
}): Promise<Post> {
    try {
        // Validate input data
        validateSchema(postData, postSchema);

        const pool = initializeDatabase();
        const result = await pool.query(
            `INSERT INTO posts (title, content, author_id, publication_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [postData.title, postData.content, postData.authorId, postData.publicationId]
        );

        const row = result.rows[0];
        return new Post(
            row.id,
            row.title,
            row.content,
            row.author_id,
            row.publication_id,
            row.created_at,
            row.updated_at
        );
    } catch (error) {
        logError('Failed to create post', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            postData
        });
        throw error;
    }
}

/**
 * Retrieves a post by its ID.
 */
export async function getPostById(postId: string): Promise<Post | null> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            'SELECT * FROM posts WHERE id = $1',
            [postId]
        );

        if (result.rowCount === 0) {
            return null;
        }

        const row = result.rows[0];
        return new Post(
            row.id,
            row.title,
            row.content,
            row.author_id,
            row.publication_id,
            row.created_at,
            row.updated_at
        );
    } catch (error) {
        logError('Failed to retrieve post', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            postId
        });
        throw error;
    }
}

/**
 * Updates the content of an existing post.
 */
export async function updatePost(
    postId: string,
    updateData: {
        title?: string;
        content?: string;
    }
): Promise<boolean> {
    try {
        // Validate update data
        validateSchema(updateData, updatePostSchema);

        const pool = initializeDatabase();
        const setClause = [];
        const values = [];
        let paramCount = 1;

        if (updateData.title) {
            setClause.push(`title = $${paramCount}`);
            values.push(updateData.title);
            paramCount++;
        }

        if (updateData.content) {
            setClause.push(`content = $${paramCount}`);
            values.push(updateData.content);
            paramCount++;
        }

        setClause.push(`updated_at = NOW()`);
        values.push(postId);

        const query = `
            UPDATE posts 
            SET ${setClause.join(', ')}
            WHERE id = $${paramCount}
        `;

        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to update post', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            postId,
            updateData
        });
        return false;
    }
}

/**
 * Deletes a post from the database.
 */
export async function deletePost(postId: string): Promise<boolean> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1',
            [postId]
        );

        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to delete post', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            postId
        });
        return false;
    }
}