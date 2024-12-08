/**
 * @fileoverview Defines the Media model for handling media assets within the content management system.
 * 
 * Requirements Addressed:
 * - Media Management (Technical Specification/System Overview/High-Level Description/Content Management):
 *   Provides a structured model for managing media assets, including metadata and storage integration.
 * 
 * Human Tasks:
 * 1. Ensure AWS S3 bucket is properly configured for media storage
 * 2. Configure appropriate CORS settings for media upload/download
 * 3. Set up encryption key management for media metadata
 * 4. Configure media file size limits and allowed file types
 * 5. Implement media backup and recovery procedures
 */

// aws-sdk v2.1372.0
import { S3 } from 'aws-sdk';

import { encrypt, decrypt } from '../../common/utils/encryption';
import { initializeStorage, uploadFile, deleteFile } from '../../common/config/storage';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Interface for media metadata
 */
interface MediaMetadata {
  size: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  description?: string;
  [key: string]: any;
}

/**
 * Interface for media upload response
 */
interface MediaUploadResponse {
  id: string;
  name: string;
  type: string;
  url: string;
  metadata: MediaMetadata;
  success: boolean;
}

/**
 * Class representing a media asset with its metadata and storage details
 */
export class Media {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly url: string;
  private readonly metadata: MediaMetadata;

  /**
   * Creates a new Media instance
   */
  constructor(
    id: string,
    name: string,
    type: string,
    url: string,
    metadata: MediaMetadata
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.url = url;
    this.metadata = metadata;
  }

  /**
   * Retrieves and decrypts the metadata of the media asset
   */
  public getMetadata(): MediaMetadata {
    try {
      // Assuming metadata is stored in encrypted format
      const decryptedMetadata = decrypt(
        JSON.stringify(this.metadata),
        process.env.ENCRYPTION_KEY!,
        process.env.METADATA_IV!,
        process.env.METADATA_AUTH_TAG!
      );
      return JSON.parse(decryptedMetadata);
    } catch (error) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to retrieve media metadata`);
    }
  }
}

/**
 * Uploads a media file to the storage service and stores its metadata
 */
export const uploadMedia = async (
  filePath: string,
  destinationKey: string
): Promise<MediaUploadResponse> => {
  try {
    // Initialize storage client
    const storageClient = initializeStorage();

    // Upload file to storage
    const uploadSuccess = await uploadFile(filePath, destinationKey);
    if (!uploadSuccess) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to upload media file`);
    }

    // Generate metadata
    const metadata: MediaMetadata = {
      size: 0, // Should be calculated from actual file
      mimeType: 'application/octet-stream', // Should be determined from file
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Encrypt sensitive metadata
    const encryptedMetadata = encrypt(
      JSON.stringify(metadata),
      process.env.ENCRYPTION_KEY!
    );

    // Generate media URL
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${destinationKey}`;

    // Create media instance
    const media = new Media(
      destinationKey, // Using destinationKey as ID for simplicity
      filePath.split('/').pop() || 'unnamed',
      'file', // Should be determined from file
      url,
      metadata
    );

    return {
      id: media.id,
      name: media.name,
      type: media.type,
      url: media.url,
      metadata: media.getMetadata(),
      success: true
    };
  } catch (error) {
    throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a media file from the storage service and removes its metadata
 */
export const deleteMedia = async (fileKey: string): Promise<boolean> => {
  try {
    // Initialize storage client
    initializeStorage();

    // Delete file from storage
    const deleteSuccess = await deleteFile(fileKey);
    if (!deleteSuccess) {
      throw new Error(`${ERROR_CODES.RESOURCE_NOT_FOUND}: Media file not found or could not be deleted`);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete media:', error);
    return false;
  }
};