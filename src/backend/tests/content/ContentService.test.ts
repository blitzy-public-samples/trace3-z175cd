/**
 * @fileoverview Unit tests for the ContentService class, ensuring the correctness of content management operations.
 * 
 * Requirements Addressed:
 * - Content Management (Technical Specification/System Overview/Content Management):
 *   Validates the functionality of content management operations, including posts, comments, and media.
 * 
 * Human Tasks:
 * - Ensure test database is properly configured and accessible
 * - Configure test environment variables for media storage
 * - Set up test encryption keys for media metadata
 */

// jest v29.0.0
import { ContentService } from '../../src/content/services/ContentService';
import { Post } from '../../src/content/models/Post';
import { Media } from '../../src/content/models/Media';
import { validateSchema } from '../../src/common/utils/validator';
import { logInfo, logError } from '../../src/common/utils/logger';
import { generateMockData } from '../utils/testHelpers';
import { ERROR_CODES } from '../../src/common/constants/errorCodes';

// Mock the Post model
jest.mock('../../src/content/models/Post');

// Mock the Media model
jest.mock('../../src/content/models/Media');

// Mock the logger functions
jest.mock('../../src/common/utils/logger');

describe('ContentService Tests', () => {
    let contentService: ContentService;

    beforeEach(() => {
        contentService = new ContentService();
        jest.clearAllMocks();
    });

    describe('testCreatePost', () => {
        it('should successfully create a post with valid data', async () => {
            // Generate mock post data
            const mockPostData = generateMockData('article');
            
            // Mock Post.createPost to return a successful response
            const mockPost = new Post(
                mockPostData.id,
                mockPostData.title,
                mockPostData.content,
                mockPostData.authorId,
                mockPostData.publicationId,
                new Date(),
                new Date()
            );
            
            (Post as any).createPost = jest.fn().mockResolvedValue(mockPost);

            try {
                // Call the service method
                const result = await contentService.createPost(mockPostData);

                // Verify the result
                expect(result).toBeDefined();
                expect(result.id).toBe(mockPostData.id);
                expect(result.title).toBe(mockPostData.title);
                expect(result.content).toBe(mockPostData.content);
                
                // Verify logger was called
                expect(logInfo).toHaveBeenCalledWith(
                    expect.stringContaining('Post created successfully')
                );
            } catch (error) {
                fail('Should not throw an error');
            }
        });

        it('should fail to create post with invalid data', async () => {
            // Generate invalid post data
            const invalidPostData = {
                title: '', // Invalid: empty title
                content: 'Test content',
                authorId: 'invalid-uuid', // Invalid UUID
                publicationId: '123' // Invalid UUID
            };

            try {
                await contentService.createPost(invalidPostData);
                fail('Should throw validation error');
            } catch (error) {
                expect(error).toBeDefined();
                expect(logError).toHaveBeenCalledWith(
                    'Failed to create post',
                    expect.objectContaining({
                        code: ERROR_CODES.INTERNAL_SERVER_ERROR
                    })
                );
            }
        });
    });

    describe('testAddCommentToPost', () => {
        it('should successfully add comment to existing post', async () => {
            // Generate mock data
            const mockPostId = 'mock-post-id';
            const mockCommentData = generateMockData('comment');

            // Mock Post.getPostById
            const mockPost = {
                id: mockPostId,
                addComment: jest.fn().mockResolvedValue(true)
            };
            (Post as any).getPostById = jest.fn().mockResolvedValue(mockPost);

            try {
                // Call the service method
                const result = await contentService.addCommentToPost(
                    mockPostId,
                    mockCommentData
                );

                // Verify the result
                expect(result).toBe(true);
                expect(mockPost.addComment).toHaveBeenCalled();
                
                // Verify logger was called
                expect(logInfo).toHaveBeenCalledWith(
                    expect.stringContaining('Comment added successfully')
                );
            } catch (error) {
                fail('Should not throw an error');
            }
        });

        it('should fail to add comment to non-existent post', async () => {
            const mockPostId = 'non-existent-post';
            const mockCommentData = generateMockData('comment');

            // Mock Post.getPostById to return null
            (Post as any).getPostById = jest.fn().mockResolvedValue(null);

            try {
                await contentService.addCommentToPost(mockPostId, mockCommentData);
                fail('Should throw error for non-existent post');
            } catch (error) {
                expect(error).toBeDefined();
                expect(logError).toHaveBeenCalledWith(
                    'Failed to add comment to post',
                    expect.objectContaining({
                        code: ERROR_CODES.INTERNAL_SERVER_ERROR
                    })
                );
            }
        });
    });

    describe('testAttachMediaToPost', () => {
        it('should successfully attach media to existing post', async () => {
            // Generate mock data
            const mockPostId = 'mock-post-id';
            const mockMediaData = {
                name: 'test-image.jpg',
                type: 'image/jpeg',
                size: 1024,
                mimeType: 'image/jpeg',
                metadata: {
                    width: 800,
                    height: 600
                }
            };

            // Mock Post.getPostById
            const mockPost = {
                id: mockPostId,
                addMedia: jest.fn().mockResolvedValue(true)
            };
            (Post as any).getPostById = jest.fn().mockResolvedValue(mockPost);

            // Mock Media.getMetadata
            const mockMedia = {
                getMetadata: jest.fn().mockReturnValue(mockMediaData)
            };
            (Media as any).mockImplementation(() => mockMedia);

            try {
                // Call the service method
                const result = await contentService.attachMediaToPost(
                    mockPostId,
                    mockMediaData
                );

                // Verify the result
                expect(result).toBe(true);
                expect(mockPost.addMedia).toHaveBeenCalled();
                expect(mockMedia.getMetadata).toHaveBeenCalled();
                
                // Verify logger was called
                expect(logInfo).toHaveBeenCalledWith(
                    expect.stringContaining('Media attached successfully')
                );
            } catch (error) {
                fail('Should not throw an error');
            }
        });

        it('should fail to attach media with invalid data', async () => {
            const mockPostId = 'mock-post-id';
            const invalidMediaData = {
                name: '', // Invalid: empty name
                type: '', // Invalid: empty type
                size: -1, // Invalid: negative size
                mimeType: 'invalid-mime-type' // Invalid mime type
            };

            try {
                await contentService.attachMediaToPost(mockPostId, invalidMediaData);
                fail('Should throw validation error');
            } catch (error) {
                expect(error).toBeDefined();
                expect(logError).toHaveBeenCalledWith(
                    'Failed to attach media to post',
                    expect.objectContaining({
                        code: ERROR_CODES.INTERNAL_SERVER_ERROR
                    })
                );
            }
        });
    });
});