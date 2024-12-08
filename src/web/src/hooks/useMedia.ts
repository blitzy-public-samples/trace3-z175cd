/**
 * @fileoverview Custom React hook for managing media uploads and interactions
 * Addresses requirements:
 * - Content Creation (Technical Specification/Core Features/Content Creation)
 * - API Integration (Technical Specification/API Design/Integration Patterns)
 */

// react v18.x
import { useState, useEffect } from 'react';

// Internal imports with relative paths
import { saveToStorage, getFromStorage, removeFromStorage } from '../utils/storage';
import { validatePost } from '../utils/validation';
import { createPost } from '../lib/api';
import { store } from '../store';

// Types for media management
interface MediaItem {
  id: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
}

interface MediaError {
  code: string;
  message: string;
}

interface UseMediaReturn {
  uploadMedia: (file: File) => Promise<void>;
  removeMedia: (id: string) => Promise<void>;
  mediaList: MediaItem[];
  isLoading: boolean;
  error: MediaError | null;
}

// Storage key for media items
const MEDIA_STORAGE_KEY = 'media_items';

/**
 * Custom hook for managing media uploads and interactions
 * Provides functionality for uploading, removing, and listing media items
 */
const useMedia = (): UseMediaReturn => {
  // State management
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<MediaError | null>(null);

  // Load media items from storage on mount
  useEffect(() => {
    const loadMediaFromStorage = () => {
      try {
        const storedMedia = getFromStorage(MEDIA_STORAGE_KEY);
        if (storedMedia) {
          const parsedMedia = JSON.parse(storedMedia) as MediaItem[];
          setMediaList(parsedMedia);
        }
      } catch (err) {
        setError({
          code: 'STORAGE_ERROR',
          message: 'Failed to load media from storage'
        });
      }
    };

    loadMediaFromStorage();
  }, []);

  /**
   * Validates media file before upload
   * @param file - File to validate
   */
  const validateMediaFile = (file: File): boolean => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError({
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10MB limit'
      });
      return false;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      setError({
        code: 'INVALID_FILE_TYPE',
        message: 'Unsupported file type'
      });
      return false;
    }

    return true;
  };

  /**
   * Uploads a media file and updates the media list
   * @param file - File to upload
   */
  const uploadMedia = async (file: File): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate file
      if (!validateMediaFile(file)) {
        return;
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);

      // Create post with media
      const postData = {
        type: 'media',
        file: formData,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      };

      // Validate post data
      if (!validatePost(postData)) {
        throw new Error('Invalid post data');
      }

      // Upload media through API
      const response = await createPost(postData);

      // Create media item
      const newMediaItem: MediaItem = {
        id: response.id,
        url: response.url,
        type: file.type,
        size: file.size,
        createdAt: new Date()
      };

      // Update media list
      const updatedMediaList = [...mediaList, newMediaItem];
      setMediaList(updatedMediaList);

      // Save to storage
      saveToStorage(MEDIA_STORAGE_KEY, JSON.stringify(updatedMediaList));

      // Dispatch to store if needed
      store.dispatch({
        type: 'media/mediaUploaded',
        payload: newMediaItem
      });

    } catch (err) {
      setError({
        code: 'UPLOAD_ERROR',
        message: err instanceof Error ? err.message : 'Failed to upload media'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Removes a media item by ID
   * @param id - ID of the media item to remove
   */
  const removeMedia = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Filter out the media item
      const updatedMediaList = mediaList.filter(item => item.id !== id);
      setMediaList(updatedMediaList);

      // Update storage
      if (updatedMediaList.length > 0) {
        saveToStorage(MEDIA_STORAGE_KEY, JSON.stringify(updatedMediaList));
      } else {
        removeFromStorage(MEDIA_STORAGE_KEY);
      }

      // Dispatch to store if needed
      store.dispatch({
        type: 'media/mediaRemoved',
        payload: id
      });

    } catch (err) {
      setError({
        code: 'REMOVE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to remove media'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadMedia,
    removeMedia,
    mediaList,
    isLoading,
    error
  };
};

export default useMedia;