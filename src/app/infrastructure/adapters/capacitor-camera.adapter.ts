import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Result } from '@shared/types/result.type';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
}

export class CapacitorCameraAdapter {
  async takePicture(options?: CameraOptions): Promise<Result<string>> {
    try {
      const image = await Camera.getPhoto({
        quality: options?.quality ?? 90,
        allowEditing: options?.allowEditing ?? false,
        resultType: options?.resultType ?? CameraResultType.Uri,
        source: options?.source ?? CameraSource.Camera,
      });

      return Result.ok(image.webPath || image.path || '');
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async pickFromGallery(options?: CameraOptions): Promise<Result<string>> {
    try {
      const image = await Camera.getPhoto({
        quality: options?.quality ?? 90,
        allowEditing: options?.allowEditing ?? false,
        resultType: options?.resultType ?? CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return Result.ok(image.webPath || image.path || '');
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
