import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DivIcon, Marker, LatLngExpression } from 'leaflet';

export type MarkerCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'park'
  | 'museum'
  | 'shopping'
  | 'entertainment'
  | 'hotel'
  | 'default';

export interface MarkerConfig {
  id: string;
  position: LatLngExpression;
  category: MarkerCategory;
  title: string;
  rating?: number;
  isOpen?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-location-marker',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div
      class="marker-wrapper"
      [class.selected]="selected"
      [class.open]="isOpen"
      [class.closed]="isOpen === false"
    >
      <div class="marker-pin" [style.background]="categoryColor">
        <ion-icon [name]="categoryIcon"></ion-icon>
      </div>
      <div class="marker-shadow"></div>
      @if (showRating && rating) {
        <div class="marker-rating">
          <ion-icon name="star"></ion-icon>
          <span>{{ rating | number: '1.1-1' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .marker-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover,
      &.selected {
        transform: scale(1.2) translateY(-4px);
        z-index: 1000;
      }

      &.selected .marker-pin {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }

    .marker-pin {
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: box-shadow 0.2s ease;

      ion-icon {
        transform: rotate(45deg);
        font-size: 18px;
        color: white;
      }
    }

    .marker-shadow {
      width: 14px;
      height: 6px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 50%;
      margin-top: 2px;
    }

    .marker-rating {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 6px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
      font-size: 10px;
      font-weight: 600;

      ion-icon {
        font-size: 10px;
        color: #fbbf24;
      }
    }

    .marker-wrapper.closed .marker-pin {
      filter: grayscale(0.5);
      opacity: 0.7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationMarkerComponent {
  @Input() category: MarkerCategory = 'default';
  @Input() rating?: number;
  @Input() isOpen?: boolean;
  @Input() selected = false;
  @Input() showRating = true;

  @Output() markerClick = new EventEmitter<void>();

  private readonly categoryConfig: Record<
    MarkerCategory,
    { icon: string; color: string }
  > = {
    restaurant: { icon: 'restaurant', color: '#ef4444' },
    cafe: { icon: 'cafe', color: '#78350f' },
    bar: { icon: 'beer', color: '#7c3aed' },
    park: { icon: 'leaf', color: '#22c55e' },
    museum: { icon: 'business', color: '#6366f1' },
    shopping: { icon: 'bag', color: '#ec4899' },
    entertainment: { icon: 'game-controller', color: '#f59e0b' },
    hotel: { icon: 'bed', color: '#0ea5e9' },
    default: { icon: 'location', color: '#6b7280' },
  };

  get categoryIcon(): string {
    return this.categoryConfig[this.category]?.icon || 'location';
  }

  get categoryColor(): string {
    return this.categoryConfig[this.category]?.color || '#6b7280';
  }

  static createLeafletIcon(
    category: MarkerCategory,
    options?: {
      selected?: boolean;
      rating?: number;
      showRating?: boolean;
    }
  ): DivIcon {
    const categoryConfig: Record<
      MarkerCategory,
      { icon: string; color: string }
    > = {
      restaurant: { icon: 'restaurant', color: '#ef4444' },
      cafe: { icon: 'cafe', color: '#78350f' },
      bar: { icon: 'beer', color: '#7c3aed' },
      park: { icon: 'leaf', color: '#22c55e' },
      museum: { icon: 'business', color: '#6366f1' },
      shopping: { icon: 'bag', color: '#ec4899' },
      entertainment: { icon: 'game-controller', color: '#f59e0b' },
      hotel: { icon: 'bed', color: '#0ea5e9' },
      default: { icon: 'location', color: '#6b7280' },
    };

    const config = categoryConfig[category] || categoryConfig.default;
    const selectedClass = options?.selected ? 'selected' : '';

    const ratingHtml =
      options?.showRating && options?.rating
        ? `<div class="marker-rating">
            <ion-icon name="star"></ion-icon>
            <span>${options.rating.toFixed(1)}</span>
          </div>`
        : '';

    const html = `
      <div class="marker-wrapper ${selectedClass}">
        <div class="marker-pin" style="background: ${config.color}">
          <ion-icon name="${config.icon}"></ion-icon>
        </div>
        <div class="marker-shadow"></div>
        ${ratingHtml}
      </div>
    `;

    return new DivIcon({
      html,
      className: 'custom-location-marker',
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });
  }

  static createMarker(config: MarkerConfig): Marker {
    const icon = LocationMarkerComponent.createLeafletIcon(config.category, {
      selected: config.selected,
      rating: config.rating,
      showRating: true,
    });

    return new Marker(config.position, { icon });
  }

  static getCategoryFromType(type: string): MarkerCategory {
    const typeMap: Record<string, MarkerCategory> = {
      restaurant: 'restaurant',
      food: 'restaurant',
      cafe: 'cafe',
      coffee: 'cafe',
      bar: 'bar',
      pub: 'bar',
      nightclub: 'bar',
      park: 'park',
      garden: 'park',
      nature: 'park',
      museum: 'museum',
      gallery: 'museum',
      art: 'museum',
      shop: 'shopping',
      store: 'shopping',
      mall: 'shopping',
      entertainment: 'entertainment',
      cinema: 'entertainment',
      theater: 'entertainment',
      hotel: 'hotel',
      lodging: 'hotel',
      hostel: 'hotel',
    };

    const normalizedType = type.toLowerCase();
    return typeMap[normalizedType] || 'default';
  }
}
