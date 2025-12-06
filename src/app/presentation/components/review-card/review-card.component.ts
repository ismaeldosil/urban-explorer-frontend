import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StarRatingComponent } from '../star-rating/star-rating.component';

export interface ReviewData {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date | string;
  photos?: string[];
}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, IonicModule, StarRatingComponent],
  template: `
    <ion-card class="review-card" [class.skeleton]="skeleton">
      <ion-card-content>
        <div class="review-header">
          <div class="user-info">
            <div class="avatar">
              @if (!skeleton && review?.userAvatar) {
                <img
                  [src]="review?.userAvatar ?? ''"
                  [alt]="review?.userName ?? ''"
                  (error)="onAvatarError($event)"
                />
              } @else {
                <ion-icon name="person-circle-outline"></ion-icon>
              }
            </div>
            <div class="user-details">
              <h3 class="user-name" [class.skeleton-text]="skeleton">
                {{ skeleton ? '' : review?.userName }}
              </h3>
              <p class="review-date" [class.skeleton-text]="skeleton">
                {{ skeleton ? '' : formatDate(review?.date) }}
              </p>
            </div>
          </div>

          <div class="rating" [class.skeleton-text]="skeleton">
            <app-star-rating
              *ngIf="!skeleton"
              [rating]="review?.rating || 0"
              size="small"
              [readonly]="true"
            ></app-star-rating>
          </div>
        </div>

        <div class="review-content" [class.skeleton-text]="skeleton">
          <p>{{ skeleton ? '' : review?.comment }}</p>
        </div>

        @if (!skeleton && review?.photos && review.photos.length > 0) {
          <div class="review-photos">
            @for (photo of getDisplayPhotos(); track photo) {
              <div class="photo-thumbnail">
                <img
                  [src]="photo"
                  [alt]="'Review photo'"
                  (error)="onPhotoError($event)"
                />
              </div>
            }
            @if (getRemainingPhotosCount() > 0) {
              <div class="photo-thumbnail more-photos">
                <span>+{{ getRemainingPhotosCount() }}</span>
              </div>
            }
          </div>
        }
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .review-card {
      margin: 0 0 12px 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      --background: #FFFFFF;
    }

    ion-card-content {
      padding: 16px;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: #F0F0F0;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar ion-icon {
      font-size: 40px;
      color: #CCC;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 16px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 2px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .review-date {
      font-size: 12px;
      color: #666;
      margin: 0;
    }

    .rating {
      flex-shrink: 0;
    }

    .review-content {
      margin-bottom: 12px;
    }

    .review-content p {
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      margin: 0;
      word-wrap: break-word;
    }

    .review-photos {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 0;
      -webkit-overflow-scrolling: touch;
    }

    .photo-thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: #F0F0F0;
      flex-shrink: 0;
      position: relative;
    }

    .photo-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .photo-thumbnail img:hover {
      transform: scale(1.05);
    }

    .photo-thumbnail.more-photos {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-weight: 600;
      font-size: 18px;
    }

    /* Skeleton styles */
    .skeleton .avatar {
      background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-text {
      background: linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      min-height: 16px;
      min-width: 100px;
    }

    .skeleton .user-name {
      width: 120px;
    }

    .skeleton .review-date {
      width: 80px;
    }

    .skeleton .rating {
      width: 100px;
      height: 20px;
    }

    .skeleton .review-content p {
      width: 100%;
      height: 60px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Hide scrollbar but keep functionality */
    .review-photos::-webkit-scrollbar {
      display: none;
    }

    .review-photos {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewCardComponent {
  @Input() review?: ReviewData;
  @Input() skeleton = false;
  @Input() maxPhotosDisplay = 4;

  /**
   * Formats the review date for display
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';

    const reviewDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      // Format as date for older reviews
      return reviewDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  /**
   * Gets the photos to display (limited by maxPhotosDisplay)
   */
  getDisplayPhotos(): string[] {
    if (!this.review?.photos) return [];
    return this.review.photos.slice(0, this.maxPhotosDisplay);
  }

  /**
   * Gets the count of remaining photos not displayed
   */
  getRemainingPhotosCount(): number {
    if (!this.review?.photos) return 0;
    return Math.max(0, this.review.photos.length - this.maxPhotosDisplay);
  }

  /**
   * Handles avatar image loading errors
   */
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  /**
   * Handles photo thumbnail loading errors
   */
  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-image.png';
    img.alt = 'Image not available';
  }
}
