import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LocationEntity } from '@core/entities/location.entity';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-location-preview-card',
  standalone: true,
  imports: [CommonModule, IonicModule, StarRatingComponent],
  template: `
    <div class="preview-card" (click)="onCardClick()">
      <div class="preview-image">
        @if (location.imageUrl) {
          <img [src]="location.imageUrl" [alt]="location.name" />
        } @else {
          <div class="placeholder-image">
            <ion-icon [name]="getCategoryIcon()"></ion-icon>
          </div>
        }
        <div class="category-badge">
          <ion-icon [name]="getCategoryIcon()"></ion-icon>
          <span>{{ getCategoryLabel() }}</span>
        </div>
      </div>

      <div class="preview-content">
        <h3 class="preview-title">{{ location.name }}</h3>

        <div class="preview-rating">
          <app-star-rating [rating]="location.rating" [readonly]="true" size="small" />
          <span class="rating-text">{{ location.rating.toFixed(1) }}</span>
          <span class="review-count">({{ location.reviewCount }})</span>
        </div>

        <p class="preview-address">
          <ion-icon name="location-outline"></ion-icon>
          {{ location.address }}
        </p>

        @if (distance !== null) {
          <div class="preview-distance">
            <ion-icon name="navigate-outline"></ion-icon>
            <span>{{ formatDistance(distance) }}</span>
          </div>
        }
      </div>

      <div class="preview-actions">
        <ion-button fill="clear" size="small" (click)="onFavoriteClick($event)">
          <ion-icon [name]="isFavorite ? 'heart' : 'heart-outline'" [color]="isFavorite ? 'danger' : 'medium'"></ion-icon>
        </ion-button>
        <ion-button fill="solid" size="small" color="primary" (click)="onViewDetails($event)">
          Ver más
          <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </div>
  `,
  styles: [`
    .preview-card {
      display: flex;
      flex-direction: column;
      background: var(--ion-background-color, #fff);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .preview-card:active {
      transform: scale(0.98);
    }

    .preview-image {
      position: relative;
      width: 100%;
      height: 120px;
      overflow: hidden;
    }

    .preview-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-primary));

      ion-icon {
        font-size: 48px;
        color: white;
        opacity: 0.5;
      }
    }

    .category-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      color: white;
      font-size: 11px;
      font-weight: 500;

      ion-icon {
        font-size: 12px;
      }
    }

    .preview-content {
      padding: 12px;
      flex: 1;
    }

    .preview-title {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--ion-text-color);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .preview-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
    }

    .rating-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--ion-text-color);
    }

    .review-count {
      font-size: 12px;
      color: var(--ion-color-medium);
    }

    .preview-address {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin: 0 0 4px 0;
      font-size: 12px;
      color: var(--ion-color-medium);
      line-height: 1.4;

      ion-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
    }

    .preview-distance {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ion-color-primary);
      font-weight: 500;

      ion-icon {
        font-size: 14px;
      }
    }

    .preview-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-top: 1px solid var(--ion-color-light);

      ion-button {
        --padding-start: 8px;
        --padding-end: 8px;
        margin: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPreviewCardComponent {
  @Input({ required: true }) location!: LocationEntity;
  @Input() distance: number | null = null;
  @Input() isFavorite = false;

  @Output() cardClick = new EventEmitter<LocationEntity>();
  @Output() favoriteClick = new EventEmitter<LocationEntity>();
  @Output() viewDetails = new EventEmitter<LocationEntity>();

  private readonly categoryLabels: Record<string, string> = {
    restaurant: 'Restaurante',
    cafe: 'Café',
    park: 'Parque',
    museum: 'Museo',
    bar: 'Bar',
    shop: 'Tienda',
  };

  private readonly categoryIcons: Record<string, string> = {
    restaurant: 'restaurant-outline',
    cafe: 'cafe-outline',
    park: 'leaf-outline',
    museum: 'library-outline',
    bar: 'beer-outline',
    shop: 'storefront-outline',
  };

  getCategoryLabel(): string {
    return this.categoryLabels[this.location.category] || this.location.category;
  }

  getCategoryIcon(): string {
    return this.categoryIcons[this.location.category] || 'location-outline';
  }

  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  }

  onCardClick(): void {
    this.cardClick.emit(this.location);
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    this.favoriteClick.emit(this.location);
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.location);
  }
}
