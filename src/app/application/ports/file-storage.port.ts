import { Result } from '@shared/types/result.type';

export interface UploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface IFileStoragePort {
  /**
   * Upload a file to storage
   * @param bucket - The storage bucket name
   * @param path - The path where the file will be stored
   * @param file - The file data (Blob or File)
   * @param options - Upload options
   */
  upload(
    bucket: string,
    path: string,
    file: Blob | File,
    options?: UploadOptions
  ): Promise<Result<UploadResult>>;

  /**
   * Upload a file from a base64 string
   * @param bucket - The storage bucket name
   * @param path - The path where the file will be stored
   * @param base64Data - The base64 encoded file data
   * @param contentType - The file MIME type
   */
  uploadBase64(
    bucket: string,
    path: string,
    base64Data: string,
    contentType: string
  ): Promise<Result<UploadResult>>;

  /**
   * Delete a file from storage
   * @param bucket - The storage bucket name
   * @param paths - Array of file paths to delete
   */
  delete(bucket: string, paths: string[]): Promise<Result<void>>;

  /**
   * Get the public URL for a file
   * @param bucket - The storage bucket name
   * @param path - The file path
   */
  getPublicUrl(bucket: string, path: string): string;

  /**
   * Generate a unique file path for uploads
   * @param folder - The folder path
   * @param fileName - Original file name
   * @param userId - Optional user ID for namespacing
   */
  generatePath(folder: string, fileName: string, userId?: string): string;
}
