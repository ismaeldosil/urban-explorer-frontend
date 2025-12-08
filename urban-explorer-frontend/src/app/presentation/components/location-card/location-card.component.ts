import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StarRatingComponent } from '../star-rating/star-rating.component';

export interface LocationCardData {
  id: string;
  name: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  distance?: number;
  category: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [CommonModule, IonicModule, StarRatingComponent],
  template: `
    <ion-card
      class="location-card"
      [class.skeleton]="skeleton"
      (click)="onCardClick()"
      button
    >
      <div class="card-content">
        <div class="image-container">
          @if (!skeleton && location?.imageUrl) {
            <img
              [src]="location?.imageUrl ?? ''"
              [alt]="location?.name ?? ''"
              (error)="onImageError($event)"
            />
          } @else {
            <div class="image-placeholder">
              <ion-icon name="image-outline"></ion-icon>
            </div>
          }
        </div>

        <div class="info">
          <div class="header">
            <h3 class="name" [class.skeleton-text]="skeleton">
              {{ skeleton ? '' : location?.name }}
            </h3>
            <ion-button
              *ngIf="showFavorite && !skeleton"
              fill="clear"
              size="small"
              class="favorite-btn"
              (click)="onFavoriteClick($event)"
            >
              <ion-icon
                slot="icon-only"
                [name]="isFavorite ? 'heart' : 'heart-outline'"
                [color]="isFavorite ? 'danger' : 'medium'"
              ></ion-icon>
            </ion-button>
          </div>

          <div class="rating-row" [class.skeleton-text]="skeleton">
            <app-star-rating
              *ngIf="!skeleton"
              [rating]="location?.rating || 0"
              [showValue]="true"
              [showCount]="true"
              [count]="location?.reviewCount || 0"
              size="small"
            ></app-star-rating>
            <span *ngIf="!skeleton" class="price">{{ getPriceIndicator() }}</span>
          </div>

          <div class="meta" [class.skeleton-text]="skeleton">
            @if (!skeleton && showDistance && location?.distance !== undefined) {
              <span class="distance">
                <ion-icon name="location-outline"></ion-icon>
                {{ formatDistance(location?.distance ?? 0) }}
              </span>
            }
            @if (!skeleton && location?.isOpen !== undefined) {
              <span class="status" [class.open]="location?.isOpen ?? false">
                {{ location?.isOpen ? 'Abierto' : 'Cerrado' }}
              </span>
            }
          </div>

          <div *ngIf="!skeleton" class="category">
            <ion-chip size="small" color="primary" outline>
              {{ location?.category }}
            </ion-chip>
          </div>
        </div>
      </div>
    </ion-card>
  `,
  styles: [`
    .location-card {
      margin: 0 0 12px 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      --background: #FFFFFF;
    }
    .card-content {
      display: flex;
      padding: 12px;
      gap: 12px;
    }
    .image-container {
      width: 88px;
      height: 88px;
      flex-shrink: 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-placeholder {
      width: 100%;
      height: 100%;
      background: #F0F0F0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image-placeholder ion-icon {
      font-size: 32px;
      color: #CCC;
    }
    .info {
      flex: 1;
      min-width: 0;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .name {
      font-size: 16px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .favorite-btn {
      --padding-start: 0;
      --padding-end: 0;
      margin: -4px -8px 0 0;
    }
    .rating-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .price {
      color: #666;
      font-size: 14px;
    }
    .meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    .distance {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .status {
      color: #DC3545;
    }
    .status.open {
      color: #28A745;
    }
    .category ion-chip {
      margin: 0;
      height: 24px;
      font-size: 12px;
    }

    /* Skeleton styles */
    .skeleton .image-container {
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
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationCardComponent {
  @Input() location?: LocationCardData;
  @Input() showDistance = true;
  @Input() showFavorite = true;
  @Input() isFavorite = false;
  @Input() skeleton = false;

  @Output() cardClick = new EventEmitter<LocationCardData>();
  @Output() favoriteClick = new EventEmitter<{ location: LocationCardData; isFavorite: boolean }>();

  onCardClick(): void {
    if (this.location && !this.skeleton) {
      this.cardClick.emit(this.location);
    }
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    if (this.location) {
      this.favoriteClick.emit({
        location: this.location,
        isFavorite: !this.isFavorite
      });
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getPriceIndicator(): string {
    if (!this.location) return '';
    return '$'.repeat(this.location.priceLevel);
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  }
}
