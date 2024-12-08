/**
 * @fileoverview Initial database schema migration for the Substack Replica platform
 * 
 * Requirements Addressed:
 * - Initial Database Schema (Technical Specification/Database Design/Schema Design)
 *   Implements the foundational database schema for managing users, publications,
 *   posts, and comments.
 * 
 * Human Tasks:
 * 1. Ensure PostgreSQL version 12 or higher is installed
 * 2. Verify database user has CREATE TABLE permissions
 * 3. Back up any existing database before running migration
 * 4. Review and adjust any database-specific settings (e.g., character encoding)
 */

// pg v8.11.0
import { Pool } from 'pg';
import { initializeDatabase } from '../../common/config/database';
import { logError, logInfo } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

export const runMigration = async (): Promise<void> => {
    let pool: Pool | null = null;

    try {
        // Initialize database connection
        pool = initializeDatabase();

        // Begin transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Create users table
            await client.query(`
                CREATE TABLE users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL DEFAULT 'user',
                    is_verified BOOLEAN NOT NULL DEFAULT false,
                    full_name VARCHAR(255),
                    bio TEXT,
                    avatar_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'editor'))
                );

                CREATE INDEX idx_users_email ON users(email);
            `);

            // Create publications table
            await client.query(`
                CREATE TABLE publications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) NOT NULL UNIQUE,
                    description TEXT,
                    logo_url TEXT,
                    settings JSONB NOT NULL DEFAULT '{}',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT valid_settings CHECK (jsonb_typeof(settings) = 'object')
                );

                CREATE INDEX idx_publications_user_id ON publications(user_id);
                CREATE INDEX idx_publications_slug ON publications(slug);
            `);

            // Create posts table
            await client.query(`
                CREATE TABLE posts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    publication_id UUID NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    excerpt TEXT,
                    cover_image_url TEXT,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    status VARCHAR(50) NOT NULL DEFAULT 'draft',
                    published_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
                    CONSTRAINT posts_status_check CHECK (status IN ('draft', 'published', 'archived')),
                    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object'),
                    UNIQUE (publication_id, slug)
                );

                CREATE INDEX idx_posts_publication_id ON posts(publication_id);
                CREATE INDEX idx_posts_status ON posts(status);
                CREATE INDEX idx_posts_published_at ON posts(published_at);
            `);

            // Create comments table
            await client.query(`
                CREATE TABLE comments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    post_id UUID NOT NULL,
                    user_id UUID NOT NULL,
                    parent_id UUID,
                    content TEXT NOT NULL,
                    is_edited BOOLEAN NOT NULL DEFAULT false,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
                );

                CREATE INDEX idx_comments_post_id ON comments(post_id);
                CREATE INDEX idx_comments_user_id ON comments(user_id);
                CREATE INDEX idx_comments_parent_id ON comments(parent_id);
            `);

            // Create triggers for updated_at timestamps
            await client.query(`
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql';

                CREATE TRIGGER update_users_updated_at
                    BEFORE UPDATE ON users
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();

                CREATE TRIGGER update_publications_updated_at
                    BEFORE UPDATE ON publications
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();

                CREATE TRIGGER update_posts_updated_at
                    BEFORE UPDATE ON posts
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();

                CREATE TRIGGER update_comments_updated_at
                    BEFORE UPDATE ON comments
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);

            await client.query('COMMIT');
            logInfo('Successfully executed initial schema migration');

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        const err = error as Error;
        logError('Failed to execute initial schema migration', {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            error: err.message,
            stack: err.stack
        });
        throw error;
    } finally {
        if (pool) {
            await pool.end();
        }
    }
};