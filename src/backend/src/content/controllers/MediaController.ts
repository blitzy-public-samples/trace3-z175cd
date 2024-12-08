/**
 * @fileoverview Controller for handling media-related operations such as uploading, retrieving,
 * and deleting media files.
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

// Internal imports with relative paths
import { uploadMedia, deleteMedia, retrieveMediaMetadata } from '../services/MediaService';
import { validationMiddleware } from '../../common/middleware/ValidationMiddleware';
import { errorHandler } from '../../common/middleware/ErrorMiddleware';
import { logInfo, logError } from '../../common/utils/logger';
import { IController } from '../../common/interfaces/IController';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../../common/constants/errorCodes';

/**
 * Handles the HTTP request for uploading a media file.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure file upload functionality
 * 
 * @param req - Express Request object containing the file and metadata
 * @param res - Express Response object for sending the response
 */
export const uploadMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the upload request
    logInfo(`Received media upload request: ${req.file?.originalname}`);

    // Validate the request
    if (!req.file) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: No file provided`);
    }

    // Generate a unique destination key for S3
    const destinationKey = `media/${Date.now()}-${req.file.originalname}`;

    // Upload the file using MediaService
    const uploadSuccess = await uploadMedia(req.file.path, destinationKey);

    if (!uploadSuccess) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to upload media file`);
    }

    // Log successful upload
    logInfo(`Successfully uploaded media file: ${destinationKey}`);

    // Send success response
    res.status(201).json({
      message: 'Media file uploaded successfully',
      data: {
        key: destinationKey,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    // Log the error
    logError('Media upload failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      file: req.file?.originalname,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle the error using the error handler middleware
    errorHandler(error as Error, req, res, () => {});
  }
};

/**
 * Handles the HTTP request for deleting a media file.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure file deletion functionality
 * 
 * @param req - Express Request object containing the file key
 * @param res - Express Response object for sending the response
 */
export const deleteMediaHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileKey } = req.params;

    // Log the deletion request
    logInfo(`Received media deletion request for: ${fileKey}`);

    // Validate the file key
    if (!fileKey) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: File key is required`);
    }

    // Delete the file using MediaService
    const deleteSuccess = await deleteMedia(fileKey);

    if (!deleteSuccess) {
      throw new Error(`${ERROR_CODES.INTERNAL_SERVER_ERROR}: Failed to delete media file`);
    }

    // Log successful deletion
    logInfo(`Successfully deleted media file: ${fileKey}`);

    // Send success response
    res.status(200).json({
      message: 'Media file deleted successfully',
      data: { key: fileKey }
    });
  } catch (error) {
    // Log the error
    logError('Media deletion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileKey: req.params.fileKey,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle the error using the error handler middleware
    errorHandler(error as Error, req, res, () => {});
  }
};

/**
 * Handles the HTTP request for retrieving metadata of a media file.
 * 
 * Requirements Addressed:
 * - Media Management: Implements secure metadata retrieval functionality
 * 
 * @param req - Express Request object containing the file key
 * @param res - Express Response object for sending the response
 */
export const retrieveMediaMetadataHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileKey } = req.params;

    // Log the metadata retrieval request
    logInfo(`Received metadata retrieval request for: ${fileKey}`);

    // Validate the file key
    if (!fileKey) {
      throw new Error(`${ERROR_CODES.VALIDATION_ERROR}: File key is required`);
    }

    // Retrieve metadata using MediaService
    const metadata = await retrieveMediaMetadata(fileKey);

    // Log successful metadata retrieval
    logInfo(`Successfully retrieved metadata for: ${fileKey}`);

    // Send success response
    res.status(200).json({
      message: 'Media metadata retrieved successfully',
      data: metadata
    });
  } catch (error) {
    // Log the error
    logError('Media metadata retrieval failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileKey: req.params.fileKey,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle the error using the error handler middleware
    errorHandler(error as Error, req, res, () => {});
  }
};