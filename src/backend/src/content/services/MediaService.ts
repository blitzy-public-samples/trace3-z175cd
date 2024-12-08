/**
 * @fileoverview Provides services for handling media operations such as uploading, retrieving,
 * and deleting media files using AWS S3.
 * 
 * Requirements Addressed:
 * - Media Management (Technical Specification/Core Features/Content Creation):
 *   Implements media handling capabilities including uploading, retrieving, and deleting media files.
 * 
 * Human Tasks:
 * 1. Ensure AWS S3 bucket is properly configured with CORS settings for media uploads
 * 2. Verify IAM user has necessary S3 permissions (s3:PutObject, s3:GetObject, s3:DeleteObject)
 * 3. Configure S3 bucket lifecycle rules for media file retention if needed
 * 4. Set up CloudFront distribution for media delivery if required
 * 5. Implement backup strategy for media files
 */

// aws-sdk v2.1372.0
import { S3 } from 'aws-sdk';

// Internal imports with relative paths
import { encrypt, decrypt } from '../../common/utils/encryption';
import { initializeStorage, uploadFile, deleteFile } from '../../common/config/storage';
import { logError, logInfo } from '../../common/utils/logger';
import { ERROR_CODES } from '../../common/constants/errorCodes';

// Global S3 client instance
let s3Client: S3;

/**
 * Interface for media metadata
 */
interface MediaMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  lastModified: string;
  encoding: string;
  userId: string;
}

/**
 * Uploads a media file to AWS S3 and stores its metadata securely.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure file upload functionality with metadata encryption
 * 
 * @param filePath - The local path of the file to upload
 * @param destinationKey - The destination key (path) in S3 bucket
 * @returns Promise<boolean> indicating success or failure of the upload
 */
export const uploadMedia = async (
  filePath: string,
  destinationKey: string
): Promise<boolean> => {
  try {
    // Initialize S3 client if not already initialized
    if (!s3Client) {
      s3Client = initializeStorage();
    }

    // Validate input parameters
    if (!filePath || !destinationKey) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Invalid input parameters`);
    }

    // Create metadata for the file
    const metadata: MediaMetadata = {
      originalName: filePath.split('/').pop() || '',
      mimeType: 'application/octet-stream', // Should be determined based on file type
      size: 0, // Should be calculated from actual file
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      encoding: 'utf-8',
      userId: 'system' // Should be passed from the authenticated user context
    };

    // Encrypt the metadata
    const encryptedMetadata = encrypt(JSON.stringify(metadata), process.env.ENCRYPTION_KEY || '');

    // Upload file to S3 with encrypted metadata
    const uploadSuccess = await uploadFile(filePath, destinationKey);

    if (!uploadSuccess) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to upload file to S3`);
    }

    // Store encrypted metadata in S3
    const metadataKey = `${destinationKey}.metadata`;
    await s3Client.putObject({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: metadataKey,
      Body: JSON.stringify(encryptedMetadata),
      ContentType: 'application/json'
    }).promise();

    logInfo(`Successfully uploaded media file and metadata: ${destinationKey}`);
    return true;

  } catch (error) {
    logError('Failed to upload media file', {
      error: error instanceof Error ? error.message : 'Unknown error',
      filePath,
      destinationKey,
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};

/**
 * Deletes a media file from AWS S3.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure file deletion with metadata cleanup
 * 
 * @param fileKey - The key (path) of the file to delete in S3
 * @returns Promise<boolean> indicating success or failure of the deletion
 */
export const deleteMedia = async (fileKey: string): Promise<boolean> => {
  try {
    // Initialize S3 client if not already initialized
    if (!s3Client) {
      s3Client = initializeStorage();
    }

    // Validate input parameter
    if (!fileKey) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Invalid file key`);
    }

    // Delete the media file
    const deleteSuccess = await deleteFile(fileKey);

    if (!deleteSuccess) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to delete file from S3`);
    }

    // Delete associated metadata
    const metadataKey = `${fileKey}.metadata`;
    await s3Client.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: metadataKey
    }).promise();

    logInfo(`Successfully deleted media file and metadata: ${fileKey}`);
    return true;

  } catch (error) {
    logError('Failed to delete media file', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileKey,
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
};

/**
 * Retrieves and decrypts metadata for a media file stored in AWS S3.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure metadata retrieval and decryption
 * 
 * @param fileKey - The key (path) of the file in S3
 * @returns Promise<MediaMetadata> The decrypted metadata of the media file
 * @throws Error if the file or metadata is not found
 */
export const retrieveMediaMetadata = async (fileKey: string): Promise<MediaMetadata> => {
  try {
    // Initialize S3 client if not already initialized
    if (!s3Client) {
      s3Client = initializeStorage();
    }

    // Validate input parameter
    if (!fileKey) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: Invalid file key`);
    }

    // Check if file exists
    const fileExists = await s3Client.headObject({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: fileKey
    }).promise()
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      throw new Error(`${ERROR_CODES.RESOURCE_NOT_FOUND}: Media file not found`);
    }

    // Retrieve encrypted metadata
    const metadataKey = `${fileKey}.metadata`;
    const metadataResponse = await s3Client.getObject({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: metadataKey
    }).promise();

    if (!metadataResponse.Body) {
      throw new Error(`${ERROR_CODES.RESOURCE_NOT_FOUND}: Media metadata not found`);
    }

    // Parse and decrypt metadata
    const encryptedMetadata = JSON.parse(metadataResponse.Body.toString());
    const decryptedMetadata = decrypt(
      encryptedMetadata.encryptedData,
      process.env.ENCRYPTION_KEY || '',
      encryptedMetadata.iv,
      encryptedMetadata.authTag
    );

    logInfo(`Successfully retrieved media metadata: ${fileKey}`);
    return JSON.parse(decryptedMetadata) as MediaMetadata;

  } catch (error) {
    logError('Failed to retrieve media metadata', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileKey,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};