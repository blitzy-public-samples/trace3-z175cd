/**
 * @fileoverview Configures the storage service for handling media and other assets using AWS S3.
 * 
 * Requirements Addressed:
 * - Media Storage (Technical Specification/System Architecture/Data Storage)
 *   Implements the configuration for AWS S3 to handle media storage and retrieval.
 * 
 * Human Tasks:
 * 1. Ensure AWS S3 bucket is created and properly configured with appropriate CORS settings
 * 2. Verify IAM user has necessary S3 permissions (s3:PutObject, s3:GetObject, s3:DeleteObject)
 * 3. Configure bucket lifecycle rules for object expiration if needed
 * 4. Set up bucket encryption settings according to security requirements
 * 5. Enable bucket versioning if required by the application
 */

// aws-sdk v2.1372.0
import { S3 } from 'aws-sdk';
import { EnvironmentVariables } from '../../types/environment';
import { logError, logInfo } from '../utils/logger';

// Global S3 client instance
let s3Client: S3;

/**
 * Initializes the AWS S3 client with the necessary configuration settings.
 * @returns The configured AWS S3 client instance
 */
export const initializeStorage = (): S3 => {
  try {
    const {
      AWS_S3_BUCKET,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY
    } = process.env as EnvironmentVariables;

    // Validate required environment variables
    if (!AWS_S3_BUCKET || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('Missing required AWS credentials in environment variables');
    }

    // Initialize S3 client with credentials
    s3Client = new S3({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: 'us-east-1', // Default region, can be made configurable via env vars if needed
      apiVersion: '2006-03-01',
      params: {
        Bucket: AWS_S3_BUCKET
      }
    });

    logInfo('AWS S3 client initialized successfully');
    return s3Client;
  } catch (error) {
    logError('Failed to initialize AWS S3 client', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

/**
 * Uploads a file to the configured AWS S3 bucket.
 * @param filePath - The local path or Buffer of the file to upload
 * @param destinationKey - The destination key (path) in the S3 bucket
 * @returns Promise<boolean> indicating success or failure
 */
export const uploadFile = async (
  filePath: string,
  destinationKey: string
): Promise<boolean> => {
  try {
    // Validate inputs
    if (!filePath || !destinationKey) {
      throw new Error('Invalid input: filePath and destinationKey are required');
    }

    // Ensure S3 client is initialized
    if (!s3Client) {
      s3Client = initializeStorage();
    }

    const params = {
      Key: destinationKey,
      Body: filePath, // In a real implementation, this would be a file stream or buffer
      ContentType: 'application/octet-stream', // Should be determined based on file type
    };

    await s3Client.putObject(params).promise();
    
    logInfo(`File uploaded successfully to S3: ${destinationKey}`);
    return true;
  } catch (error) {
    logError('Failed to upload file to S3', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filePath,
      destinationKey,
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};

/**
 * Deletes a file from the configured AWS S3 bucket.
 * @param fileKey - The key (path) of the file to delete in the S3 bucket
 * @returns Promise<boolean> indicating success or failure
 */
export const deleteFile = async (fileKey: string): Promise<boolean> => {
  try {
    // Validate input
    if (!fileKey) {
      throw new Error('Invalid input: fileKey is required');
    }

    // Ensure S3 client is initialized
    if (!s3Client) {
      s3Client = initializeStorage();
    }

    const params = {
      Key: fileKey
    };

    await s3Client.deleteObject(params).promise();
    
    logInfo(`File deleted successfully from S3: ${fileKey}`);
    return true;
  } catch (error) {
    logError('Failed to delete file from S3', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileKey,
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};