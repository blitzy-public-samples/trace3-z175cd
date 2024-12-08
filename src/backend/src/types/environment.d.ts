/**
 * @fileoverview Environment variable type definitions for the backend application
 * 
 * Requirements Addressed:
 * - Environment Configuration (Technical Specification/System Architecture/Cross-Cutting Concerns)
 *   Provides a structured and type-safe way to manage environment variables for various backend services.
 * 
 * Human Tasks:
 * 1. Create a .env file in the project root with all the required environment variables
 * 2. Ensure AWS IAM user has appropriate S3 bucket permissions
 * 3. Configure SMTP service and obtain credentials
 * 4. Set up PostgreSQL database and obtain connection URL
 * 5. Deploy Redis instance and obtain connection URL
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvironmentVariables {}
  }
}

export interface EnvironmentVariables {
  /**
   * The connection URL for the PostgreSQL database.
   * Format: postgresql://[user]:[password]@[host]:[port]/[database]
   */
  DATABASE_URL: string;

  /**
   * The connection URL for the Redis server.
   * Format: redis://[user]:[password]@[host]:[port]
   */
  REDIS_URL: string;

  /**
   * The name of the AWS S3 bucket used for media storage.
   * Example: my-app-media-bucket
   */
  AWS_S3_BUCKET: string;

  /**
   * The AWS access key ID for authenticating with S3.
   * Obtain from AWS IAM user credentials.
   */
  AWS_ACCESS_KEY_ID: string;

  /**
   * The AWS secret access key for authenticating with S3.
   * Obtain from AWS IAM user credentials.
   */
  AWS_SECRET_ACCESS_KEY: string;

  /**
   * The SMTP host for email delivery.
   * Example: smtp.gmail.com
   */
  SMTP_HOST: string;

  /**
   * The SMTP port for email delivery.
   * Common ports: 587 (TLS), 465 (SSL)
   */
  SMTP_PORT: number;

  /**
   * The username for SMTP authentication.
   * Usually an email address
   */
  SMTP_USER: string;

  /**
   * The password for SMTP authentication.
   * For Gmail, use App-Specific Password if 2FA is enabled
   */
  SMTP_PASS: string;
}

// Ensure this file is treated as a module
export {};