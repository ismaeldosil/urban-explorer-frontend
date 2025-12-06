import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  earnedAt?: Date;
  progress?: number; // 0-100 for locked badges
}

@Component({
  selector: 'app-badge-item',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div
      class="badge-item"
      [class.earned]="badge.earnedAt"
      [class.locked]="!badge.earnedAt"
      [class]="'rarity-' + badge.rarity"
      (click)="onBadgeClick()"
    >
      <div class="badge-icon-container">
        <div class="badge-icon" [class.grayscale]="!badge.earnedAt">
          <ion-icon [name]="badge.icon"></ion-icon>
        </div>
        @if (!badge.earnedAt && badge.progress !== undefined) {
          <div class="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                class="progress-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="progress-bar"
                [attr.stroke-dasharray]="badge.progress + ', 100'"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        }
        @if (badge.earnedAt) {
          <div class="earned-check">
            <ion-icon name="checkmark-circle"></ion-icon>
          </div>
        }
      </div>

      @if (!compact) {
        <div class="badge-info">
          <h4 class="badge-name">{{ badge.name }}</h4>
          <p class="badge-description">{{ badge.description }}</p>
          @if (badge.earnedAt) {
            <span class="earned-date">
              Obtenido {{ formatDate(badge.earnedAt) }}
            </span>
          } @else if (badge.progress !== undefined) {
            <span class="progress-text">{{ badge.progress }}% completado</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .badge-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      background: var(--ion-color-light);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.locked {
        opacity: 0.7;
      }
    }

    .badge-icon-container {
      position: relative;
      width: 56px;
      height: 56px;
      flex-shrink: 0;
    }

    .badge-icon {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;

      &.grayscale {
        filter: grayscale(1);
        opacity: 0.5;
      }
    }

    /* Rarity Colors */
    .rarity-common .badge-icon {
      background: linear-gradient(135deg, #9ca3af, #6b7280);
      color: white;
    }

    .rarity-uncommon .badge-icon {
      background: linear-gradient(135deg, #34d399, #10b981);
      color: white;
    }

    .rarity-rare .badge-icon {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      color: white;
    }

    .rarity-epic .badge-icon {
      background: linear-gradient(135deg, #a78bfa, #8b5cf6);
      color: white;
    }

    .rarity-legendary .badge-icon {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
    }

    .progress-ring {
      position: absolute;
      top: -4px;
      left: -4px;
      width: 64px;
      height: 64px;

      svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .progress-bg {
        fill: none;
        stroke: var(--ion-color-light-shade);
        stroke-width: 2;
      }

      .progress-bar {
        fill: none;
        stroke: var(--ion-color-primary);
        stroke-width: 2;
        stroke-linecap: round;
      }
    }

    .earned-check {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      ion-icon {
        font-size: 18px;
        color: var(--ion-color-success);
      }
    }

    .badge-info {
      flex: 1;
      min-width: 0;
    }

    .badge-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--ion-text-color);
    }

    .badge-description {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: var(--ion-color-medium);
      line-height: 1.4;
    }

    .earned-date,
    .progress-text {
      font-size: 12px;
      color: var(--ion-color-medium-shade);
    }

    .earned-date {
      color: var(--ion-color-success);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeItemComponent {
  @Input({ required: true }) badge!: Badge;
  @Input() compact = false;

  @Output() badgeClick = new EventEmitter<Badge>();

  onBadgeClick(): void {
    this.badgeClick.emit(this.badge);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 7) return `hace ${days} días`;
    if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
    if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
    return `hace ${Math.floor(days / 365)} años`;
  }
}
