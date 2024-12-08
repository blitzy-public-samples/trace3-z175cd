/**
 * @fileoverview Provides search functionality for querying posts and publications in the content management system.
 * 
 * Requirements Addressed:
 * - Content Search (Technical Specification/System Overview/Content Management):
 *   Implements search capabilities for querying posts and publications, including full-text search and filtering.
 * 
 * Human Tasks:
 * 1. Ensure PostgreSQL database has full-text search indexes configured on posts and publications tables
 * 2. Configure appropriate database connection pool settings for search query performance
 * 3. Monitor search query performance and optimize indexes as needed
 */

// pg v8.11.0
import { Pool } from 'pg';
import { logInfo, logError } from '../../common/utils/logger';
import { initializeDatabase } from '../../common/config/database';
import { Post, getPostById } from '../models/Post';
import { Publication, getPublicationById } from '../models/Publication';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface for search criteria parameters
 */
interface SearchCriteria {
  query?: string;
  authorId?: string;
  publicationId?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Performs a search query to retrieve posts based on the provided criteria.
 */
export async function searchPosts(searchCriteria: SearchCriteria): Promise<Post[]> {
  try {
    logInfo(`Starting post search with criteria: ${JSON.stringify(searchCriteria)}`);
    
    const pool = initializeDatabase();
    const values: any[] = [];
    let paramCount = 1;
    
    // Build the base query
    let query = `
      SELECT DISTINCT p.*
      FROM posts p
      WHERE 1=1
    `;

    // Add search conditions based on criteria
    if (searchCriteria.query) {
      query += ` AND (
        to_tsvector('english', p.title) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', p.content) @@ plainto_tsquery('english', $${paramCount})
      )`;
      values.push(searchCriteria.query);
      paramCount++;
    }

    if (searchCriteria.authorId) {
      query += ` AND p.author_id = $${paramCount}`;
      values.push(searchCriteria.authorId);
      paramCount++;
    }

    if (searchCriteria.publicationId) {
      query += ` AND p.publication_id = $${paramCount}`;
      values.push(searchCriteria.publicationId);
      paramCount++;
    }

    if (searchCriteria.startDate) {
      query += ` AND p.created_at >= $${paramCount}`;
      values.push(searchCriteria.startDate);
      paramCount++;
    }

    if (searchCriteria.endDate) {
      query += ` AND p.created_at <= $${paramCount}`;
      values.push(searchCriteria.endDate);
      paramCount++;
    }

    if (searchCriteria.tags && searchCriteria.tags.length > 0) {
      query += ` AND p.tags @> $${paramCount}`;
      values.push(searchCriteria.tags);
      paramCount++;
    }

    // Add pagination
    query += ` ORDER BY p.created_at DESC
      LIMIT $${paramCount}
      OFFSET $${paramCount + 1}`;
    values.push(searchCriteria.limit || 10);
    values.push(searchCriteria.offset || 0);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      logInfo(`No posts found matching search criteria: ${JSON.stringify(searchCriteria)}`);
      return [];
    }

    // Map database results to Post objects
    const posts = await Promise.all(
      result.rows.map(async (row) => {
        const post = await getPostById(row.id);
        if (!post) {
          throw new Error(`Post with ID ${row.id} not found during search result mapping`);
        }
        return post;
      })
    );

    logInfo(`Found ${posts.length} posts matching search criteria`);
    return posts;

  } catch (error) {
    logError('Error during post search', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      searchCriteria
    });
    throw error;
  }
}

/**
 * Performs a search query to retrieve publications based on the provided criteria.
 */
export async function searchPublications(searchCriteria: SearchCriteria): Promise<Publication[]> {
  try {
    logInfo(`Starting publication search with criteria: ${JSON.stringify(searchCriteria)}`);
    
    const pool = initializeDatabase();
    const values: any[] = [];
    let paramCount = 1;
    
    // Build the base query
    let query = `
      SELECT DISTINCT pub.*
      FROM publications pub
      WHERE 1=1
    `;

    // Add search conditions based on criteria
    if (searchCriteria.query) {
      query += ` AND (
        to_tsvector('english', pub.name) @@ plainto_tsquery('english', $${paramCount})
        OR to_tsvector('english', pub.description) @@ plainto_tsquery('english', $${paramCount})
      )`;
      values.push(searchCriteria.query);
      paramCount++;
    }

    if (searchCriteria.startDate) {
      query += ` AND pub.created_at >= $${paramCount}`;
      values.push(searchCriteria.startDate);
      paramCount++;
    }

    if (searchCriteria.endDate) {
      query += ` AND pub.created_at <= $${paramCount}`;
      values.push(searchCriteria.endDate);
      paramCount++;
    }

    // Add pagination
    query += ` ORDER BY pub.created_at DESC
      LIMIT $${paramCount}
      OFFSET $${paramCount + 1}`;
    values.push(searchCriteria.limit || 10);
    values.push(searchCriteria.offset || 0);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      logInfo(`No publications found matching search criteria: ${JSON.stringify(searchCriteria)}`);
      return [];
    }

    // Map database results to Publication objects
    const publications = await Promise.all(
      result.rows.map(async (row) => {
        const publication = await getPublicationById(row.id);
        if (!publication) {
          throw new Error(`Publication with ID ${row.id} not found during search result mapping`);
        }
        return publication;
      })
    );

    logInfo(`Found ${publications.length} publications matching search criteria`);
    return publications;

  } catch (error) {
    logError('Error during publication search', {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      error: error instanceof Error ? error.message : 'Unknown error',
      searchCriteria
    });
    throw error;
  }
}