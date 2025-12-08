import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonTextarea,
  IonText,
  IonSpinner,
  IonChip,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, camera, close, checkmark, image, trash } from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { REVIEW_REPOSITORY, FILE_STORAGE_PORT } from '@infrastructure/di/tokens';
import { GetLocationDetailUseCase } from '@application/use-cases/locations/get-location-detail.usecase';
import { LocationEntity } from '@core/entities/location.entity';
import { CameraService, CapturedPhoto } from '@infrastructure/services/camera.service';

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonItem,
    IonTextarea,
    IonText,
    IonSpinner,
    IonChip,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button [defaultHref]="'/location/' + locationId"></ion-back-button>
        </ion-buttons>
        <ion-title>Write Review</ion-title>
        <ion-buttons slot="end">
          <ion-button
            [disabled]="!canSubmit() || isSubmitting()"
            (click)="submitReview()"
            [strong]="true"
          >
            @if (isSubmitting()) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              <ion-icon slot="icon-only" name="checkmark"></ion-icon>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Location Info -->
      @if (location()) {
        <div class="location-header">
          <h2>{{ location()!.name }}</h2>
          <p>{{ location()!.address }}</p>
        </div>
      }

      <!-- Rating Section -->
      <div class="rating-section">
        <h3>Your Rating</h3>
        <div class="star-rating">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <ion-icon
              [name]="rating() >= i ? 'star' : 'star-outline'"
              [class.filled]="rating() >= i"
              (click)="setRating(i)"
            ></ion-icon>
          }
        </div>
        <p class="rating-label">{{ getRatingLabel() }}</p>
      </div>

      <!-- Comment Section -->
      <div class="comment-section">
        <h3>Your Review</h3>
        <ion-item lines="none" class="comment-item">
          <ion-textarea
            [(ngModel)]="comment"
            placeholder="Share your experience... (minimum 50 characters)"
            [autoGrow]="true"
            [rows]="5"
            [maxlength]="500"
            (ionInput)="onCommentChange($event)"
          ></ion-textarea>
        </ion-item>
        <div class="char-count">
          <ion-text [color]="charCountColor()">
            {{ commentLength() }}/500
          </ion-text>
          @if (commentLength() < 50) {
            <ion-text color="medium">
              ({{ 50 - commentLength() }} more characters needed)
            </ion-text>
          }
        </div>
      </div>

      <!-- Tags Section -->
      <div class="tags-section">
        <h3>Tags (optional)</h3>
        <p class="tags-hint">Select up to 3 tags</p>
        <div class="tags-container">
          @for (tag of availableTags; track tag) {
            <ion-chip
              [color]="selectedTags().includes(tag) ? 'primary' : 'medium'"
              [outline]="!selectedTags().includes(tag)"
              (click)="toggleTag(tag)"
            >
              {{ tag }}
            </ion-chip>
          }
        </div>
      </div>

      <!-- Photos Section -->
      <div class="photos-section">
        <h3>Photos (optional)</h3>
        <p class="photos-hint">Add up to {{ maxPhotos }} photos ({{ photos().length }}/{{ maxPhotos }})</p>

        @if (photos().length > 0) {
          <div class="photos-grid">
            @for (photo of photos(); track photo.dataUrl; let i = $index) {
              <div class="photo-item">
                <img [src]="photo.dataUrl" alt="Review photo {{ i + 1 }}" />
                <ion-button
                  class="remove-photo-btn"
                  fill="clear"
                  size="small"
                  color="danger"
                  (click)="removePhoto(i)"
                >
                  <ion-icon slot="icon-only" name="close"></ion-icon>
                </ion-button>
              </div>
            }
          </div>
        }

        @if (photos().length < maxPhotos) {
          <ion-button fill="outline" expand="block" (click)="addPhoto()">
            <ion-icon slot="start" name="camera"></ion-icon>
            {{ photos().length > 0 ? 'Add More Photos' : 'Add Photos' }}
          </ion-button>
        }
      </div>

      <!-- Guidelines -->
      <div class="guidelines">
        <h4>Review Guidelines</h4>
        <ul>
          <li>Be honest and constructive</li>
          <li>Focus on your personal experience</li>
          <li>Avoid offensive language</li>
          <li>Don't include personal information</li>
        </ul>
      </div>
    </ion-content>
  `,
  styles: [`
    .location-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--ion-color-light);

      h2 {
        margin: 0 0 4px;
        font-size: 20px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--ion-color-medium);
        font-size: 14px;
      }
    }

    .rating-section {
      margin-bottom: 24px;
      text-align: center;

      h3 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .star-rating {
        display: flex;
        justify-content: center;
        gap: 8px;

        ion-icon {
          font-size: 40px;
          color: var(--ion-color-medium);
          cursor: pointer;
          transition: transform 0.2s;

          &.filled {
            color: var(--ion-color-warning);
          }

          &:active {
            transform: scale(1.2);
          }
        }
      }

      .rating-label {
        margin: 8px 0 0;
        font-size: 14px;
        color: var(--ion-color-medium);
      }
    }

    .comment-section {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .comment-item {
        --background: var(--ion-color-light);
        --border-radius: 8px;
        --padding-start: 12px;
        --padding-end: 12px;
      }

      .char-count {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
      }
    }

    .tags-section {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
      }

      .tags-hint {
        margin: 0 0 12px;
        font-size: 12px;
        color: var(--ion-color-medium);
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }

    .photos-section {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
      }

      .photos-hint {
        margin: 0 0 12px;
        font-size: 12px;
        color: var(--ion-color-medium);
      }

      .photos-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .photo-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-photo-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          --padding-start: 4px;
          --padding-end: 4px;
          --background: rgba(0, 0, 0, 0.6);
          --border-radius: 50%;

          ion-icon {
            color: white;
            font-size: 16px;
          }
        }
      }
    }

    .guidelines {
      background: var(--ion-color-light);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          font-size: 12px;
          color: var(--ion-color-medium);
          margin-bottom: 4px;
        }
      }
    }
  `],
})
export class WriteReviewPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);
  private authStateService = inject(AuthStateService);
  private reviewRepository = inject(REVIEW_REPOSITORY);
  private fileStorage = inject(FILE_STORAGE_PORT);
  private getLocationDetailUseCase = inject(GetLocationDetailUseCase);
  private cameraService = inject(CameraService);

  locationId = '';
  location = signal<LocationEntity | null>(null);
  rating = signal(0);
  comment = '';
  selectedTags = signal<string[]>([]);
  isSubmitting = signal(false);
  photos = signal<CapturedPhoto[]>([]);
  isUploadingPhoto = signal(false);

  readonly maxPhotos = 5;

  availableTags = [
    'Great food',
    'Nice atmosphere',
    'Good service',
    'Family friendly',
    'Pet friendly',
    'Romantic',
    'Budget friendly',
    'Trendy',
    'Hidden gem',
    'Must visit',
  ];

  commentLength = computed(() => this.comment.length);
  charCountColor = computed(() => {
    const len = this.commentLength();
    if (len < 50) return 'danger';
    if (len > 450) return 'warning';
    return 'success';
  });

  canSubmit = computed(() => {
    return this.rating() > 0 && this.commentLength() >= 50 && this.commentLength() <= 500;
  });

  constructor() {
    addIcons({ star, starOutline, camera, close, checkmark, image, trash });
  }

  ngOnInit(): void {
    this.locationId = this.route.snapshot.paramMap.get('id') || '';
    this.loadLocation();
  }

  private async loadLocation(): Promise<void> {
    if (!this.locationId) return;

    const result = await this.getLocationDetailUseCase.execute(this.locationId);
    if (result.success) {
      this.location.set(result.data);
    }
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  getRatingLabel(): string {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    return labels[this.rating()] || 'Tap to rate';
  }

  onCommentChange(event: CustomEvent): void {
    this.comment = event.detail.value || '';
  }

  toggleTag(tag: string): void {
    const current = this.selectedTags();
    if (current.includes(tag)) {
      this.selectedTags.set(current.filter((t) => t !== tag));
    } else if (current.length < 3) {
      this.selectedTags.set([...current, tag]);
    }
  }

  async addPhoto(): Promise<void> {
    if (this.photos().length >= this.maxPhotos) {
      const toast = await this.toastController.create({
        message: `Maximum ${this.maxPhotos} photos allowed`,
        duration: 2000,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Add Photo',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => {
            this.capturePhoto('camera');
          },
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => {
            this.capturePhoto('gallery');
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private async capturePhoto(source: 'camera' | 'gallery'): Promise<void> {
    try {
      const hasPermission = await this.cameraService.checkPermissions();
      if (!hasPermission) {
        const alert = await this.alertController.create({
          header: 'Permission Required',
          message: 'Camera and photo permissions are required to add photos.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      const photo = await this.cameraService.takePhoto(source);
      if (photo) {
        this.photos.update((current) => [...current, photo]);
        const toast = await this.toastController.create({
          message: 'Photo added!',
          duration: 1500,
          position: 'bottom',
          color: 'success',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      const toast = await this.toastController.create({
        message: 'Failed to capture photo. Please try again.',
        duration: 2000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }

  removePhoto(index: number): void {
    this.photos.update((current) => current.filter((_, i) => i !== index));
  }

  async submitReview(): Promise<void> {
    if (!this.canSubmit()) return;

    const user = this.authStateService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Upload photos first
      const photoUrls: string[] = [];

      if (this.photos().length > 0) {
        for (const photo of this.photos()) {
          const fileName = `review_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${this.cameraService.getFileExtension(photo.dataUrl)}`;
          const path = this.fileStorage.generatePath('reviews', fileName, user.id);

          const uploadResult = await this.fileStorage.uploadBase64(
            'review-photos',
            path,
            photo.dataUrl,
            `image/${this.cameraService.getFileExtension(photo.dataUrl)}`
          );

          if (uploadResult.success && uploadResult.data) {
            photoUrls.push(uploadResult.data.publicUrl);
          }
        }
      }

      const result = await this.reviewRepository.create({
        locationId: this.locationId,
        userId: user.id,
        rating: this.rating(),
        comment: this.comment,
        photos: photoUrls,
        tags: this.selectedTags(),
      });

      if (result.success) {
        const toast = await this.toastController.create({
          message: 'Review submitted successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success',
        });
        await toast.present();

        this.router.navigate(['/location', this.locationId]);
      } else {
        throw new Error(result.error?.message || 'Failed to submit review');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit review';
      const alert = await this.alertController.create({
        header: 'Error',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
