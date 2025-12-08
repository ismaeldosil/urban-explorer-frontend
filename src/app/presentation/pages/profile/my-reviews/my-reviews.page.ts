import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonContent,
  IonBackButton,
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonThumbnail,
  IonSpinner,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  createOutline,
  trashOutline,
  starOutline,
  star,
  chatbubbleOutline,
} from 'ionicons/icons';

import { AuthStateService } from '@infrastructure/services/auth-state.service';
import { REVIEW_REPOSITORY } from '@infrastructure/di/tokens';
import { ReviewEntity } from '@core/entities/review.entity';
import { EmptyStateComponent } from '@presentation/components/empty-state/empty-state.component';
import { StarRatingComponent } from '@presentation/components/star-rating/star-rating.component';

interface ReviewWithLocation {
  review: ReviewEntity;
  locationName: string;
  locationImageUrl?: string;
}

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonContent,
    IonBackButton,
    IonList,
    IonItemSliding,
    IonItem,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonThumbnail,
    IonSpinner,
    EmptyStateComponent,
    StarRatingComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>My Reviews</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isLoading()) {
        <div class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (reviews().length === 0) {
        <app-empty-state
          icon="chatbubble-outline"
          title="No reviews yet"
          description="You haven't written any reviews. Explore locations and share your experiences!"
        />
      } @else {
        <ion-list lines="full">
          @for (item of reviews(); track item.review.id) {
            <ion-item-sliding #sliding>
              <ion-item
                button
                [detail]="true"
                (click)="viewReview(item)"
              >
                @if (item.locationImageUrl) {
                  <ion-thumbnail slot="start">
                    <img [src]="item.locationImageUrl" [alt]="item.locationName" />
                  </ion-thumbnail>
                }

                <ion-label>
                  <h2 class="location-name">{{ item.locationName }}</h2>
                  <div class="rating-container">
                    <app-star-rating
                      [rating]="item.review.rating"
                      [readonly]="true"
                      size="small"
                    />
                  </div>
                  <p class="review-comment">{{ truncateComment(item.review.comment) }}</p>
                  <p class="review-date">{{ formatDate(item.review.createdAt) }}</p>
                </ion-label>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="primary" (click)="editReview(item, sliding)">
                  <ion-icon slot="icon-only" name="create-outline"></ion-icon>
                </ion-item-option>
                <ion-item-option color="danger" (click)="confirmDelete(item, sliding)">
                  <ion-icon slot="icon-only" name="trash-outline"></ion-icon>
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          }
        </ion-list>
      }
    </ion-content>
  `,
  styles: [`
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50vh;
    }

    ion-list {
      padding: 0;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --inner-padding-end: 0;
    }

    ion-thumbnail {
      width: 60px;
      height: 60px;
      margin-right: 12px;
      --border-radius: 8px;

      img {
        object-fit: cover;
        width: 100%;
        height: 100%;
        border-radius: 8px;
      }
    }

    .location-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--ion-text-color);
    }

    .rating-container {
      margin: 4px 0;
    }

    .review-comment {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin: 8px 0 4px 0;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .review-date {
      font-size: 12px;
      color: var(--ion-color-medium);
      margin: 4px 0 0 0;
    }

    ion-item-option {
      ion-icon {
        font-size: 24px;
      }
    }
  `]
})
export class MyReviewsPage implements OnInit {
  private router = inject(Router);
  private authStateService = inject(AuthStateService);
  private reviewRepository = inject(REVIEW_REPOSITORY);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  isLoading = signal(true);
  reviews = signal<ReviewWithLocation[]>([]);

  constructor() {
    addIcons({
      arrowBackOutline,
      createOutline,
      trashOutline,
      starOutline,
      star,
      chatbubbleOutline,
    });
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  private async loadReviews(): Promise<void> {
    const user = this.authStateService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isLoading.set(true);

    try {
      const result = await this.reviewRepository.getByUserId(user.id, {
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      if (result.success && result.data) {
        const reviews: ReviewWithLocation[] = result.data.data.map((review: ReviewEntity) => ({
          review,
          locationName: 'Unknown Location', // TODO: Join with location data
          locationImageUrl: undefined,
        }));

        this.reviews.set(reviews);
      } else if (!result.success) {
        console.error('Failed to load reviews:', result.error?.message);
        const toast = await this.toastController.create({
          message: 'Failed to load reviews',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      const toast = await this.toastController.create({
        message: 'An error occurred while loading reviews',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }

    this.isLoading.set(false);
  }

  viewReview(item: ReviewWithLocation): void {
    this.router.navigate(['/location', item.review.locationId]);
  }

  editReview(item: ReviewWithLocation, sliding: IonItemSliding): void {
    sliding.close();
    this.router.navigate(['/location', item.review.locationId, 'review'], {
      queryParams: { reviewId: item.review.id }
    });
  }

  async confirmDelete(item: ReviewWithLocation, sliding: IonItemSliding): Promise<void> {
    sliding.close();

    const alert = await this.alertController.create({
      header: 'Delete Review',
      message: `Are you sure you want to delete your review for ${item.locationName}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteReview(item),
        },
      ],
    });

    await alert.present();
  }

  private async deleteReview(item: ReviewWithLocation): Promise<void> {
    try {
      const result = await this.reviewRepository.delete(item.review.id);

      if (result.success) {
        this.reviews.set(this.reviews().filter(r => r.review.id !== item.review.id));

        const toast = await this.toastController.create({
          message: 'Review deleted successfully',
          duration: 2000,
          color: 'success',
        });
        await toast.present();
      } else {
        const toast = await this.toastController.create({
          message: 'Failed to delete review',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      const toast = await this.toastController.create({
        message: 'An error occurred while deleting the review',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  truncateComment(comment: string, maxLength: number = 100): string {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
