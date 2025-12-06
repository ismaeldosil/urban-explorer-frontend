import { Component, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface PhotoItem {
  url: string;
  id: string;
}

@Component({
  selector: 'app-photo-picker',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="photo-picker">
      <div class="photos-grid">
        @for (photo of photos(); track photo.id) {
          <div class="photo-item">
            <img [src]="photo.url" [alt]="'Photo ' + photo.id" />
            <button
              class="remove-btn"
              (click)="removePhoto(photo.id)"
              type="button"
            >
              <ion-icon name="close-circle"></ion-icon>
            </button>
          </div>
        }

        @if (photos().length < maxPhotos) {
          <button
            class="add-photo-btn"
            (click)="addPhoto()"
            type="button"
          >
            <ion-icon name="camera-outline"></ion-icon>
            <span>Agregar foto</span>
          </button>
        }
      </div>

      @if (photos().length > 0) {
        <div class="photo-count">
          {{ photos().length }} / {{ maxPhotos }} fotos
        </div>
      }
    </div>
  `,
  styles: [`
    .photo-picker {
      width: 100%;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
      margin-bottom: 8px;
    }

    .photo-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background: #F0F0F0;
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.6);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: background 0.2s ease;
    }

    .remove-btn:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    .remove-btn ion-icon {
      font-size: 24px;
      color: #fff;
    }

    .add-photo-btn {
      aspect-ratio: 1;
      border: 2px dashed var(--ion-color-medium);
      border-radius: 8px;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 8px;
    }

    .add-photo-btn:hover {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }

    .add-photo-btn ion-icon {
      font-size: 32px;
      color: var(--ion-color-medium);
    }

    .add-photo-btn:hover ion-icon {
      color: var(--ion-color-primary);
    }

    .add-photo-btn span {
      font-size: 12px;
      color: var(--ion-color-medium);
      text-align: center;
    }

    .add-photo-btn:hover span {
      color: var(--ion-color-primary);
    }

    .photo-count {
      font-size: 14px;
      color: var(--ion-color-medium);
      text-align: right;
      margin-top: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoPickerComponent {
  @Output() photosChange = new EventEmitter<string[]>();

  protected photos = signal<PhotoItem[]>([]);
  protected maxPhotos = 10;

  /**
   * Adds a new photo to the picker
   * Currently uses a placeholder implementation
   * TODO: Integrate with Capacitor Camera plugin
   */
  addPhoto(): void {
    if (this.photos().length >= this.maxPhotos) {
      return;
    }

    // Placeholder implementation - in real app, this would use Capacitor Camera
    // Example with Capacitor Camera:
    // const photo = await Camera.getPhoto({
    //   quality: 90,
    //   allowEditing: false,
    //   resultType: CameraResultType.Uri,
    //   source: CameraSource.Photos
    // });

    // For now, create a placeholder photo
    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: `https://via.placeholder.com/300x300?text=Photo+${this.photos().length + 1}`
    };

    this.photos.update(photos => [...photos, newPhoto]);
    this.emitPhotosChange();
  }

  /**
   * Removes a photo by its ID
   */
  removePhoto(photoId: string): void {
    this.photos.update(photos => photos.filter(p => p.id !== photoId));
    this.emitPhotosChange();
  }

  /**
   * Emits the current photo URLs
   */
  private emitPhotosChange(): void {
    const photoUrls = this.photos().map(p => p.url);
    this.photosChange.emit(photoUrls);
  }

  /**
   * Sets photos programmatically (for form integration)
   */
  setPhotos(urls: string[]): void {
    const photoItems: PhotoItem[] = urls.map((url, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url
    }));
    this.photos.set(photoItems);
  }

  /**
   * Clears all photos
   */
  clearPhotos(): void {
    this.photos.set([]);
    this.emitPhotosChange();
  }
}
