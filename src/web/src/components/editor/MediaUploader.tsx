/**
 * @fileoverview A React component for uploading media files
 * Addresses requirements:
 * - Content Creation (Technical Specification/Core Features/Content Creation)
 * - User Interface Design (Technical Specification/User Interface Design/Interface Elements)
 */

// react v18.x
import { useState, useEffect } from 'react';

// Internal imports with relative paths
import useMedia from '../../hooks/useMedia';
import { Button } from '../common/Button';
import { Spinner } from '../common/Spinner';

// Human Tasks:
// 1. Configure file upload size limits in server/infrastructure
// 2. Set up media storage backend and CDN
// 3. Review file type security policies
// 4. Implement virus scanning for uploaded files
// 5. Configure CORS policies for media uploads

interface UploadState {
  selectedFiles: File[];
  uploadProgress: number;
  error: string | null;
}

/**
 * A functional component that provides a user interface for uploading media files.
 * Implements a user-friendly interface for media uploads, adhering to the design system.
 */
const MediaUploader: React.FC = () => {
  // Initialize local state
  const [uploadState, setUploadState] = useState<UploadState>({
    selectedFiles: [],
    uploadProgress: 0,
    error: null
  });

  // Get media management functions from useMedia hook
  const { uploadMedia, removeMedia, mediaList, isLoading, error } = useMedia();

  // Reset error state when component unmounts
  useEffect(() => {
    return () => {
      setUploadState(prev => ({ ...prev, error: null }));
    };
  }, []);

  /**
   * Handles file selection from input
   * Validates file types and updates state
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      setUploadState(prev => ({
        ...prev,
        error: 'Some files were rejected. Only JPEG, PNG, GIF, and MP4 files are allowed.'
      }));
    }

    setUploadState(prev => ({
      ...prev,
      selectedFiles: validFiles,
      error: null
    }));
  };

  /**
   * Handles the upload process for selected files
   * Uploads files sequentially and updates progress
   */
  const handleUpload = async () => {
    const { selectedFiles } = uploadState;
    if (selectedFiles.length === 0) return;

    setUploadState(prev => ({ ...prev, uploadProgress: 0, error: null }));

    try {
      // Upload files sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        await uploadMedia(selectedFiles[i]);
        setUploadState(prev => ({
          ...prev,
          uploadProgress: ((i + 1) / selectedFiles.length) * 100
        }));
      }

      // Clear selected files after successful upload
      setUploadState(prev => ({
        ...prev,
        selectedFiles: [],
        uploadProgress: 0
      }));
    } catch (err) {
      setUploadState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to upload media'
      }));
    }
  };

  /**
   * Handles media item removal
   */
  const handleRemove = async (id: string) => {
    try {
      await removeMedia(id);
    } catch (err) {
      setUploadState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to remove media'
      }));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* File Input Section */}
      <div className="mb-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,video/mp4"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload">
          <Button
            label="Select Files"
            onClick={() => document.getElementById('media-upload')?.click()}
            variant="primary"
          />
        </label>
      </div>

      {/* Selected Files List */}
      {uploadState.selectedFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
          <ul className="space-y-2">
            {uploadState.selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="text-sm">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
          <Button
            label="Upload Files"
            onClick={handleUpload}
            disabled={isLoading}
            variant="primary"
            className="mt-2"
          />
        </div>
      )}

      {/* Upload Progress */}
      {isLoading && (
        <div className="mb-4">
          <Spinner
            isLoading={true}
            message={`Uploading... ${uploadState.uploadProgress.toFixed(0)}%`}
          />
        </div>
      )}

      {/* Error Display */}
      {(uploadState.error || error) && (
        <div className="mb-4 text-red-600 text-sm">
          {uploadState.error || error}
        </div>
      )}

      {/* Media List */}
      {mediaList.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Uploaded Media:</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {mediaList.map((item) => (
              <div key={item.id} className="relative group">
                {item.type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-24 object-cover rounded"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-24 object-cover rounded"
                  />
                )}
                <Button
                  label="Remove"
                  onClick={() => handleRemove(item.id)}
                  variant="danger"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;