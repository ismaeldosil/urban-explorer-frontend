import { inject, Injectable } from '@angular/core';
import { Result } from '@shared/types/result.type';
import { IFileStoragePort } from '@application/ports/file-storage.port';
import { FILE_STORAGE_PORT } from '@infrastructure/di/tokens';

export interface PhotoUploadInput {
  file?: File;
  base64Data?: string;
  fileName: string;
  contentType: string;
}

export interface UploadReviewPhotosInput {
  userId: string;
  locationId: string;
  photos: PhotoUploadInput[];
}

export interface UploadReviewPhotosOutput {
  uploadedUrls: string[];
  failedCount: number;
}

const BUCKET_NAME = 'review-photos';
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable({ providedIn: 'root' })
export class UploadReviewPhotosUseCase {
  private fileStorage = inject(FILE_STORAGE_PORT);

  async execute(input: UploadReviewPhotosInput): Promise<Result<UploadReviewPhotosOutput>> {
    try {
      // Validate photo count
      if (input.photos.length > MAX_PHOTOS) {
        return Result.fail(new Error(`Maximum ${MAX_PHOTOS} photos allowed`));
      }

      const uploadedUrls: string[] = [];
      let failedCount = 0;

      for (const photo of input.photos) {
        try {
          // Generate unique path
          const path = this.fileStorage.generatePath(
            `locations/${input.locationId}`,
            photo.fileName,
            input.userId
          );

          let result;

          if (photo.file) {
            // Validate file size
            if (photo.file.size > MAX_FILE_SIZE) {
              console.warn(`File ${photo.fileName} exceeds max size, skipping`);
              failedCount++;
              continue;
            }

            result = await this.fileStorage.upload(BUCKET_NAME, path, photo.file, {
              contentType: photo.contentType,
            });
          } else if (photo.base64Data) {
            result = await this.fileStorage.uploadBase64(
              BUCKET_NAME,
              path,
              photo.base64Data,
              photo.contentType
            );
          } else {
            console.warn(`No file data for ${photo.fileName}, skipping`);
            failedCount++;
            continue;
          }

          if (result.success && result.data) {
            uploadedUrls.push(result.data.publicUrl);
          } else {
            console.error(`Failed to upload ${photo.fileName}:`, result.error);
            failedCount++;
          }
        } catch (error) {
          console.error(`Error uploading ${photo.fileName}:`, error);
          failedCount++;
        }
      }

      return Result.ok({
        uploadedUrls,
        failedCount,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  /**
   * Delete photos from storage
   */
  async deletePhotos(photoUrls: string[]): Promise<Result<void>> {
    try {
      // Extract paths from URLs
      const paths = photoUrls.map((url) => {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split(`/${BUCKET_NAME}/`);
        return pathParts[1] || '';
      }).filter(Boolean);

      if (paths.length === 0) {
        return Result.ok(undefined);
      }

      return this.fileStorage.delete(BUCKET_NAME, paths);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
