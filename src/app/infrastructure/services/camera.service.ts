import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo, ImageOptions } from '@capacitor/camera';

export interface CapturedPhoto {
  dataUrl: string;
  format: string;
  saved: boolean;
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  /**
   * Capture a photo using the device camera or gallery
   */
  async takePhoto(source: 'camera' | 'gallery' = 'camera'): Promise<CapturedPhoto | null> {
    try {
      const options: ImageOptions = {
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        width: 1200,
        height: 1200,
        correctOrientation: true,
      };

      const photo = await Camera.getPhoto(options);

      if (!photo.dataUrl) {
        return null;
      }

      return {
        dataUrl: photo.dataUrl,
        format: photo.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error capturing photo:', error);
      // User cancelled or permission denied
      if (error instanceof Error && error.message.includes('cancelled')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Pick multiple photos from gallery
   * Note: Capacitor Camera doesn't support multi-select natively,
   * so we'll use a workaround with multiple single selections
   */
  async pickFromGallery(): Promise<CapturedPhoto | null> {
    return this.takePhoto('gallery');
  }

  /**
   * Check and request camera permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();

      if (permissions.camera === 'granted' && permissions.photos === 'granted') {
        return true;
      }

      // Request permissions if not granted
      const requested = await Camera.requestPermissions({
        permissions: ['camera', 'photos'],
      });

      return requested.camera === 'granted' || requested.photos === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  /**
   * Convert data URL to Blob for upload
   */
  dataUrlToBlob(dataUrl: string): Blob {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = parts[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  /**
   * Get file extension from data URL
   */
  getFileExtension(dataUrl: string): string {
    const mimeMatch = dataUrl.match(/data:image\/([a-zA-Z]+);/);
    return mimeMatch ? mimeMatch[1] : 'jpg';
  }
}
