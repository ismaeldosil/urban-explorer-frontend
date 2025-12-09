import { TestBed } from '@angular/core/testing';
import { UploadReviewPhotosUseCase, UploadReviewPhotosInput } from './upload-review-photos.usecase';
import { FILE_STORAGE_PORT } from '@infrastructure/di/tokens';
import { IFileStoragePort } from '@application/ports/file-storage.port';
import { Result } from '@shared/types/result.type';

describe('UploadReviewPhotosUseCase', () => {
  let useCase: UploadReviewPhotosUseCase;
  let mockFileStorage: jasmine.SpyObj<IFileStoragePort>;

  beforeEach(() => {
    mockFileStorage = jasmine.createSpyObj('IFileStoragePort', [
      'upload',
      'uploadBase64',
      'delete',
      'getPublicUrl',
      'generatePath',
    ]);

    mockFileStorage.generatePath.and.callFake((folder: string, fileName: string, userId?: string) => {
      return `${folder}/${userId || 'anonymous'}/${Date.now()}-${fileName}`;
    });

    TestBed.configureTestingModule({
      providers: [
        UploadReviewPhotosUseCase,
        { provide: FILE_STORAGE_PORT, useValue: mockFileStorage },
      ],
    });

    useCase = TestBed.inject(UploadReviewPhotosUseCase);
  });

  describe('execute', () => {
    it('should upload photos from File objects', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockFileStorage.upload.and.resolveTo(Result.ok({
        path: 'path/to/file.jpg',
        publicUrl: 'http://example.com/file.jpg',
      }));

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          file: mockFile,
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls).toContain('http://example.com/file.jpg');
        expect(result.data.failedCount).toBe(0);
      }
    });

    it('should upload photos from base64 data', async () => {
      mockFileStorage.uploadBase64.and.resolveTo(Result.ok({
        path: 'path/to/file.jpg',
        publicUrl: 'http://example.com/base64-file.jpg',
      }));

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls).toContain('http://example.com/base64-file.jpg');
        expect(result.data.failedCount).toBe(0);
      }
    });

    it('should fail when more than 5 photos are provided', async () => {
      const photos = Array(6).fill(null).map((_, i) => ({
        base64Data: 'data:image/jpeg;base64,test',
        fileName: `photo${i}.jpg`,
        contentType: 'image/jpeg',
      }));

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos,
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(false);
    });

    it('should skip photos larger than 5MB', async () => {
      // Create a file larger than 5MB
      const largeData = new Uint8Array(6 * 1024 * 1024); // 6MB
      const mockLargeFile = new File([largeData], 'large.jpg', { type: 'image/jpeg' });

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          file: mockLargeFile,
          fileName: 'large.jpg',
          contentType: 'image/jpeg',
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls.length).toBe(0);
        expect(result.data.failedCount).toBe(1);
      }
      expect(mockFileStorage.upload).not.toHaveBeenCalled();
    });

    it('should skip photos without file data', async () => {
      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          fileName: 'no-data.jpg',
          contentType: 'image/jpeg',
          // No file or base64Data
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls.length).toBe(0);
        expect(result.data.failedCount).toBe(1);
      }
    });

    it('should count failed uploads when storage fails', async () => {
      mockFileStorage.uploadBase64.and.resolveTo(Result.fail(new Error('Storage error')));

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          base64Data: 'data:image/jpeg;base64,test',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls.length).toBe(0);
        expect(result.data.failedCount).toBe(1);
      }
    });

    it('should handle multiple photos with mixed results', async () => {
      mockFileStorage.uploadBase64
        .and.returnValues(
          Promise.resolve(Result.ok({ path: 'p1', publicUrl: 'http://example.com/1.jpg' })),
          Promise.resolve(Result.fail(new Error('Failed'))),
          Promise.resolve(Result.ok({ path: 'p3', publicUrl: 'http://example.com/3.jpg' }))
        );

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [
          { base64Data: 'data1', fileName: '1.jpg', contentType: 'image/jpeg' },
          { base64Data: 'data2', fileName: '2.jpg', contentType: 'image/jpeg' },
          { base64Data: 'data3', fileName: '3.jpg', contentType: 'image/jpeg' },
        ],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uploadedUrls.length).toBe(2);
        expect(result.data.failedCount).toBe(1);
      }
    });

    it('should handle exceptions during upload', async () => {
      mockFileStorage.uploadBase64.and.throwError(new Error('Unexpected error'));

      const input: UploadReviewPhotosInput = {
        userId: 'user-123',
        locationId: 'location-456',
        photos: [{
          base64Data: 'data:image/jpeg;base64,test',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
        }],
      };

      const result = await useCase.execute(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.failedCount).toBe(1);
      }
    });
  });

  describe('deletePhotos', () => {
    it('should delete photos by URL', async () => {
      mockFileStorage.delete.and.resolveTo(Result.ok(undefined));

      const photoUrls = [
        'http://storage.example.com/review-photos/locations/loc1/photo1.jpg',
        'http://storage.example.com/review-photos/locations/loc1/photo2.jpg',
      ];

      const result = await useCase.deletePhotos(photoUrls);

      expect(result.success).toBe(true);
      expect(mockFileStorage.delete).toHaveBeenCalled();
    });

    it('should return success for empty photo list', async () => {
      const result = await useCase.deletePhotos([]);

      expect(result.success).toBe(true);
      expect(mockFileStorage.delete).not.toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      mockFileStorage.delete.and.resolveTo(Result.fail(new Error('Delete failed')));

      const photoUrls = ['http://storage.example.com/review-photos/photo.jpg'];

      const result = await useCase.deletePhotos(photoUrls);

      expect(result.success).toBe(false);
    });

    it('should handle exceptions during delete', async () => {
      mockFileStorage.delete.and.throwError(new Error('Unexpected error'));

      const photoUrls = ['http://storage.example.com/review-photos/photo.jpg'];

      const result = await useCase.deletePhotos(photoUrls);

      expect(result.success).toBe(false);
    });
  });
});
