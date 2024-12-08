/**
 * @fileoverview Defines the Publication model, representing a publication entity in the system,
 * including its properties, relationships, and methods for managing posts, comments, and subscriptions.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management)
 *   Supports the creation, retrieval, and management of publications, including their relationships
 *   with posts, comments, and subscriptions.
 * - Subscription Management (Technical Specification/Scope/Core Features/Monetization)
 *   Supports the management of subscriptions associated with publications.
 * 
 * Human Tasks:
 * - Ensure PostgreSQL database has the publications table created with appropriate schema
 * - Configure appropriate indexes on id and name columns for query optimization
 * - Set up proper cascading delete rules for publication deletion
 */

// joi v17.6.0
import Joi from 'joi';
import { Comment, updateComment } from './Comment';
import { validateSchema } from '../../common/utils/validator';
import { initializeDatabase } from '../../common/config/database';
import { logError } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// Validation schemas for publication data
const publicationSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(1000)
});

const updatePublicationSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(1000)
}).min(1);

/**
 * Represents a publication in the content management system.
 */
export class Publication {
    public readonly id: string;
    public name: string;
    public description: string;
    public comments: Comment[];
    public subscriptions: any[];
    public readonly createdAt: Date;
    public updatedAt: Date;

    /**
     * Creates a new Publication instance.
     */
    constructor(
        id: string,
        name: string,
        description: string,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.comments = [];
        this.subscriptions = [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * Adds a new comment to the publication.
     */
    public async addComment(comment: Comment): Promise<void> {
        try {
            // Validate comment data
            validateSchema(comment, Joi.object({
                content: Joi.string().required().min(1).max(1000),
                postId: Joi.string().required().uuid(),
                userId: Joi.string().required().uuid()
            }));

            this.comments.push(comment);
        } catch (error) {
            logError('Failed to add comment to publication', {
                code: ERROR_CODES.VALIDATION_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                publicationId: this.id
            });
            throw error;
        }
    }

    /**
     * Adds a new subscription to the publication.
     */
    public async addSubscription(subscription: any): Promise<void> {
        try {
            // Validate subscription data
            validateSchema(subscription, Joi.object({
                userId: Joi.string().required().uuid(),
                planId: Joi.string().required().uuid(),
                startDate: Joi.date().required(),
                endDate: Joi.date().required()
            }));

            this.subscriptions.push(subscription);
        } catch (error) {
            logError('Failed to add subscription to publication', {
                code: ERROR_CODES.VALIDATION_ERROR,
                error: error instanceof Error ? error.message : 'Unknown error',
                publicationId: this.id
            });
            throw error;
        }
    }
}

/**
 * Creates a new publication in the database.
 */
export async function createPublication(publicationData: {
    name: string;
    description: string;
}): Promise<Publication> {
    try {
        // Validate input data
        validateSchema(publicationData, publicationSchema);

        const pool = initializeDatabase();
        const result = await pool.query(
            `INSERT INTO publications (name, description, created_at, updated_at)
             VALUES ($1, $2, NOW(), NOW())
             RETURNING *`,
            [publicationData.name, publicationData.description]
        );

        const row = result.rows[0];
        return new Publication(
            row.id,
            row.name,
            row.description,
            row.created_at,
            row.updated_at
        );
    } catch (error) {
        logError('Failed to create publication', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            publicationData
        });
        throw error;
    }
}

/**
 * Retrieves a publication by its ID.
 */
export async function getPublicationById(publicationId: string): Promise<Publication | null> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            'SELECT * FROM publications WHERE id = $1',
            [publicationId]
        );

        if (result.rowCount === 0) {
            return null;
        }

        const row = result.rows[0];
        return new Publication(
            row.id,
            row.name,
            row.description,
            row.created_at,
            row.updated_at
        );
    } catch (error) {
        logError('Failed to retrieve publication', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            publicationId
        });
        throw error;
    }
}

/**
 * Updates the details of an existing publication.
 */
export async function updatePublication(
    publicationId: string,
    updateData: {
        name?: string;
        description?: string;
    }
): Promise<boolean> {
    try {
        // Validate update data
        validateSchema(updateData, updatePublicationSchema);

        const pool = initializeDatabase();
        const setClause = [];
        const values = [];
        let paramCount = 1;

        if (updateData.name) {
            setClause.push(`name = $${paramCount}`);
            values.push(updateData.name);
            paramCount++;
        }

        if (updateData.description) {
            setClause.push(`description = $${paramCount}`);
            values.push(updateData.description);
            paramCount++;
        }

        setClause.push(`updated_at = NOW()`);
        values.push(publicationId);

        const query = `
            UPDATE publications 
            SET ${setClause.join(', ')}
            WHERE id = $${paramCount}
        `;

        const result = await pool.query(query, values);
        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to update publication', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            publicationId,
            updateData
        });
        return false;
    }
}

/**
 * Deletes a publication from the database.
 */
export async function deletePublication(publicationId: string): Promise<boolean> {
    try {
        const pool = initializeDatabase();
        const result = await pool.query(
            'DELETE FROM publications WHERE id = $1',
            [publicationId]
        );

        return result.rowCount > 0;
    } catch (error) {
        logError('Failed to delete publication', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: error instanceof Error ? error.message : 'Unknown error',
            publicationId
        });
        return false;
    }
}