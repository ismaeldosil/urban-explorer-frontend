import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-distance-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <span
      class="distance-badge"
      [class.compact]="compact"
      [class.with-icon]="showIcon"
    >
      @if (showIcon) {
        <ion-icon name="navigate-outline"></ion-icon>
      }
      <span class="distance-text">{{ formattedDistance }}</span>
    </span>
  `,
  styles: [`
    .distance-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: var(--ion-color-light);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--ion-color-medium-shade);
      white-space: nowrap;
    }

    .distance-badge.with-icon ion-icon {
      font-size: 14px;
      color: var(--ion-color-primary);
    }

    .distance-badge.compact {
      padding: 2px 6px;
      font-size: 11px;
      background: transparent;

      ion-icon {
        font-size: 12px;
      }
    }

    .distance-text {
      line-height: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistanceBadgeComponent {
  @Input({ required: true }) distanceKm!: number;
  @Input() showIcon = true;
  @Input() compact = false;

  get formattedDistance(): string {
    if (this.distanceKm === null || this.distanceKm === undefined) {
      return '';
    }

    if (this.distanceKm < 0.1) {
      return `${Math.round(this.distanceKm * 1000)} m`;
    }

    if (this.distanceKm < 1) {
      const meters = Math.round(this.distanceKm * 1000);
      // Round to nearest 50 meters
      const rounded = Math.round(meters / 50) * 50;
      return `${rounded} m`;
    }

    if (this.distanceKm < 10) {
      return `${this.distanceKm.toFixed(1)} km`;
    }

    return `${Math.round(this.distanceKm)} km`;
  }
}
