import { TestBed } from '@angular/core/testing';
import { CameraService } from './camera.service';

describe('CameraService', () => {
  let service: CameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CameraService],
    });
    service = TestBed.inject(CameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('dataUrlToBlob', () => {
    it('should convert data URL to Blob', () => {
      // Simple 1x1 red pixel PNG
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const blob = service.dataUrlToBlob(dataUrl);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should convert JPEG data URL to Blob', () => {
      // Minimal JPEG data URL
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

      const blob = service.dataUrlToBlob(dataUrl);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should handle data URL without standard mime format', () => {
      // When mime type pattern is empty, it falls through to empty string match
      const dataUrl = 'data:;base64,SGVsbG8gV29ybGQ=';

      const blob = service.dataUrlToBlob(dataUrl);

      expect(blob).toBeInstanceOf(Blob);
      // The regex captures empty string between : and ;
      expect(blob.type).toBe('');
    });
  });

  describe('getFileExtension', () => {
    it('should return png for PNG data URL', () => {
      const dataUrl = 'data:image/png;base64,abc123';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('png');
    });

    it('should return jpeg for JPEG data URL', () => {
      const dataUrl = 'data:image/jpeg;base64,abc123';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('jpeg');
    });

    it('should return gif for GIF data URL', () => {
      const dataUrl = 'data:image/gif;base64,abc123';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('gif');
    });

    it('should return webp for WebP data URL', () => {
      const dataUrl = 'data:image/webp;base64,abc123';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('webp');
    });

    it('should default to jpg for unknown format', () => {
      const dataUrl = 'data:application/octet-stream;base64,abc123';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('jpg');
    });

    it('should default to jpg for malformed data URL', () => {
      const dataUrl = 'not-a-valid-data-url';

      const extension = service.getFileExtension(dataUrl);

      expect(extension).toBe('jpg');
    });
  });

  describe('pickFromGallery', () => {
    it('should call takePhoto with gallery source', async () => {
      const mockPhoto = {
        dataUrl: 'data:image/png;base64,abc123',
        format: 'png',
        saved: false,
      };
      const takePhotoSpy = spyOn(service, 'takePhoto').and.returnValue(Promise.resolve(mockPhoto));

      const result = await service.pickFromGallery();

      expect(takePhotoSpy).toHaveBeenCalledWith('gallery');
      expect(result).toEqual(mockPhoto);
    });

    it('should return null when takePhoto returns null', async () => {
      spyOn(service, 'takePhoto').and.returnValue(Promise.resolve(null));

      const result = await service.pickFromGallery();

      expect(result).toBeNull();
    });
  });
});
