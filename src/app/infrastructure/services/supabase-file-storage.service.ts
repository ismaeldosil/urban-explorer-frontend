import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  IFileStoragePort,
  UploadOptions,
  UploadResult,
} from '@application/ports/file-storage.port';
import { Result } from '@shared/types/result.type';

@Injectable({ providedIn: 'root' })
export class SupabaseFileStorageService implements IFileStoragePort {
  constructor(private supabase: SupabaseService) {}

  async upload(
    bucket: string,
    path: string,
    file: Blob | File,
    options?: UploadOptions
  ): Promise<Result<UploadResult>> {
    try {
      const { data, error } = await this.supabase.storage(bucket).upload(path, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl ?? '3600',
        upsert: options?.upsert ?? false,
      });

      if (error) {
        return Result.fail(new Error(error.message));
      }

      const publicUrl = this.getPublicUrl(bucket, data.path);

      return Result.ok({
        path: data.path,
        publicUrl,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async uploadBase64(
    bucket: string,
    path: string,
    base64Data: string,
    contentType: string
  ): Promise<Result<UploadResult>> {
    try {
      // Remove data URL prefix if present
      const base64Content = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      // Convert base64 to Blob
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });

      return this.upload(bucket, path, blob, { contentType });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(bucket: string, paths: string[]): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.storage(bucket).remove(paths);

      if (error) {
        return Result.fail(new Error(error.message));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  generatePath(folder: string, fileName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop() || 'jpg';
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();

    if (userId) {
      return `${folder}/${userId}/${timestamp}_${randomStr}_${sanitizedFileName}`;
    }

    return `${folder}/${timestamp}_${randomStr}_${sanitizedFileName}`;
  }
}
