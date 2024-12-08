/**
 * @fileoverview Defines the Comment model for managing comments associated with posts,
 * including properties, relationships, and methods for CRUD operations.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Supports the creation, retrieval, and management of comments associated with posts.
 * 
 * Human Tasks:
 * - Ensure PostgreSQL database has the comments table created with appropriate schema
 * - Configure appropriate indexes on postId and userId columns for query optimization
 * - Set up proper cascading delete rules for comment deletion when posts are deleted
 */

import { Pool } from 'pg'; // pg v8.11.0
import { User } from '../../auth/models/User';
import { validateSchema } from '../../common/utils/validator';
import { initializeDatabase } from '../../common/config/database';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// Joi schema for comment validation
import Joi from 'joi';

const commentSchema = Joi.object({
    content: Joi.string().required().min(1).max(1000),
    postId: Joi.string().required().uuid(),
    userId: Joi.string().required().uuid()
});

const updateCommentSchema = Joi.object({
    content: Joi.string().required().min(1).max(1000)
});

/**
 * Represents a comment in the content management system.
 */
export class Comment {
    public readonly id: string;
    public content: string;
    public readonly postId: string;
    public readonly userId: string;
    public readonly createdAt: Date;
    public updatedAt: Date;

    /**
     * Creates a new Comment instance.
     */
    constructor(
        id: string,
        content: string,
        postId: string,
        userId: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.content = content;
        this.postId = postId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Updates the content of the comment.
     */
    public async updateContent(newContent: string): Promise<boolean> {
        try {
            // Validate the new content
            validateSchema({ content: newContent }, updateCommentSchema);

            const pool = initializeDatabase();
            const result = await pool.query(
                'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [newContent, this.id]
            );

            if (result.rowCount === 0) {
                throw new Error('Comment not found');
            }

            this.content = newContent;
            this.updatedAt = result.rows[0].updated_at;

            return true;
        } catch (error) {
            logError('Failed to update comment content', {
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                commentId: this.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    }
}

/**
 * Creates a new comment in the database.
 */
export async function createComment(commentData: {
    content: string;
    postId: string;
    userId: string;
}): Promise<Comment> {
    try {
        // Validate input data
        validateSchema(commentData, commentSchema);

        const pool = initializeDatabase();
        const result = await pool.query(
            `INSERT INTO comments (content, post_id, user_id, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING *`,
            [commentData.content, commentData.postId, commentData.userId]
        );

        const row = result.rows[0];
        return new Comment(
            row.id,
            row.content,
            row.post_id,
            row.user_id,
            row.created_at,
            row.updated_at
        );
    } catch (error) {
        logError('Failed to create comment', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            commentData
        });
        throw error;
    }
}

/**
 * Retrieves all comments associated with a specific post ID.
 */
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            `SELECT * FROM comments 
             WHERE post_id = $1 
             ORDER BY created_at DESC`,
            [postId]
        );

        return result.rows.map(row => new Comment(
            row.id,
            row.content,
            row.post_id,
            row.user_id,
            row.created_at,
            row.updated_at
        ));
    } catch (error) {
        logError('Failed to retrieve comments by post ID', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            postId
        });
        throw error;
    }
}

/**
 * Updates the content of an existing comment.
 */
export async function updateComment(
    commentId: string,
    updateData: { content: string }
): Promise<boolean> {
    try {
        validateSchema(updateData, updateCommentSchema);

        const pool = initializeDatabase();
        const result = await pool.query(
            `UPDATE comments 
             SET content = $1, updated_at = NOW() 
             WHERE id = $2`,
            [updateData.content, commentId]
        );

        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to update comment', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            commentId,
            updateData
        });
        return false;
    }
}

/**
 * Deletes a comment from the database.
 */
export async function deleteComment(commentId: string): Promise<boolean> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            'DELETE FROM comments WHERE id = $1',
            [commentId]
        );

        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to delete comment', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            commentId
        });
        return false;
    }
}