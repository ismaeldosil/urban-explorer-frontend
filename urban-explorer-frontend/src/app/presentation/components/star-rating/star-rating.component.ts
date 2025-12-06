import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="star-rating" [class.readonly]="readonly" [class.interactive]="!readonly">
      <ion-icon
        *ngFor="let star of stars; let i = index"
        [name]="getStarIcon(i)"
        [class.filled]="i < Math.floor(rating)"
        [class.half]="i === Math.floor(rating) && rating % 1 >= 0.5"
        [style.font-size.px]="starSize"
        (click)="!readonly && onStarClick(i + 1)"
        (mouseenter)="!readonly && onHover(i + 1)"
        (mouseleave)="!readonly && onHover(0)"
      ></ion-icon>
      <span *ngIf="showValue" class="rating-value" [style.font-size.px]="valueSize">
        {{ rating.toFixed(1) }}
      </span>
      <span *ngIf="showCount && count > 0" class="rating-count">
        ({{ count }})
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    ion-icon {
      color: #E0E0E0;
      transition: color 0.15s ease, transform 0.15s ease;
    }
    ion-icon.filled {
      color: #FFB800;
    }
    ion-icon.half {
      background: linear-gradient(90deg, #FFB800 50%, #E0E0E0 50%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .interactive ion-icon {
      cursor: pointer;
    }
    .interactive ion-icon:hover {
      transform: scale(1.1);
    }
    .rating-value {
      margin-left: 4px;
      font-weight: 600;
      color: var(--ion-text-color);
    }
    .rating-count {
      margin-left: 2px;
      color: var(--ion-color-medium);
      font-size: 0.85em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() maxRating = 5;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() readonly = true;
  @Input() showValue = false;
  @Input() showCount = false;
  @Input() count = 0;
  @Input() allowHalf = true;

  @Output() ratingChange = new EventEmitter<number>();

  protected Math = Math;
  protected hoverRating = 0;

  get stars(): number[] {
    return Array(this.maxRating).fill(0);
  }

  get starSize(): number {
    const sizes = { small: 16, medium: 24, large: 32 };
    return sizes[this.size];
  }

  get valueSize(): number {
    const sizes = { small: 12, medium: 14, large: 18 };
    return sizes[this.size];
  }

  get displayRating(): number {
    return this.hoverRating || this.rating;
  }

  getStarIcon(index: number): string {
    const rating = this.displayRating;
    if (index < Math.floor(rating)) return 'star';
    if (index === Math.floor(rating) && rating % 1 >= 0.5) return 'star-half';
    return 'star-outline';
  }

  onStarClick(value: number): void {
    if (this.readonly) return;
    this.rating = value;
    this.ratingChange.emit(value);
  }

  onHover(value: number): void {
    if (this.readonly) return;
    this.hoverRating = value;
  }
}
