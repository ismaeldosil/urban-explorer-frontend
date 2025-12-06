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
  IonLabel,
  IonTextarea,
  IonText,
  IonSpinner,
  IonChip,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, camera, close, checkmark } from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { GetLocationDetailUseCase } from '@application/use-cases/locations/get-location-detail.usecase';
import { LocationEntity } from '@core/entities/location.entity';

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
    IonLabel,
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

      <!-- Photos Section (placeholder) -->
      <div class="photos-section">
        <h3>Photos (optional)</h3>
        <ion-button fill="outline" expand="block" (click)="addPhoto()">
          <ion-icon slot="start" name="camera"></ion-icon>
          Add Photos
        </ion-button>
        <p class="photos-hint">Coming soon - photo upload feature</p>
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
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 600;
      }

      .photos-hint {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--ion-color-medium);
        text-align: center;
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
  private authStateService = inject(AuthStateService);
  private reviewRepository = inject(REVIEW_REPOSITORY);
  private getLocationDetailUseCase = inject(GetLocationDetailUseCase);

  locationId = '';
  location = signal<LocationEntity | null>(null);
  rating = signal(0);
  comment = '';
  selectedTags = signal<string[]>([]);
  isSubmitting = signal(false);

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
    addIcons({ star, starOutline, camera, close, checkmark });
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
    const toast = await this.toastController.create({
      message: 'Photo upload coming soon!',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
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
      const result = await this.reviewRepository.create({
        locationId: this.locationId,
        userId: user.id,
        rating: this.rating(),
        comment: this.comment,
        photos: [],
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
