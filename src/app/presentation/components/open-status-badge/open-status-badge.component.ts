import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type OpenStatus = 'open' | 'closed' | 'closing_soon' | 'opening_soon' | 'unknown';

export interface OpeningHours {
  day: number; // 0-6 (Sunday to Saturday)
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
}

@Component({
  selector: 'app-open-status-badge',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <span
      class="status-badge"
      [class.open]="status === 'open'"
      [class.closed]="status === 'closed'"
      [class.closing-soon]="status === 'closing_soon'"
      [class.opening-soon]="status === 'opening_soon'"
      [class.compact]="compact"
    >
      @if (showIcon) {
        <ion-icon [name]="statusIcon"></ion-icon>
      }
      <span class="status-text">{{ statusText }}</span>
      @if (showTime && timeText) {
        <span class="time-text">{{ timeText }}</span>
      }
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;

      ion-icon {
        font-size: 14px;
      }
    }

    .status-badge.open {
      background: rgba(76, 175, 80, 0.15);
      color: #2e7d32;
    }

    .status-badge.closed {
      background: rgba(244, 67, 54, 0.15);
      color: #c62828;
    }

    .status-badge.closing-soon {
      background: rgba(255, 152, 0, 0.15);
      color: #ef6c00;
    }

    .status-badge.opening-soon {
      background: rgba(33, 150, 243, 0.15);
      color: #1565c0;
    }

    .status-badge.compact {
      padding: 2px 6px;
      font-size: 10px;

      ion-icon {
        font-size: 12px;
      }
    }

    .time-text {
      font-weight: 400;
      opacity: 0.8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenStatusBadgeComponent {
  @Input() status: OpenStatus = 'unknown';
  @Input() closingTime?: string; // HH:mm format
  @Input() openingTime?: string; // HH:mm format
  @Input() showIcon = true;
  @Input() showTime = false;
  @Input() compact = false;

  get statusIcon(): string {
    switch (this.status) {
      case 'open':
        return 'checkmark-circle';
      case 'closed':
        return 'close-circle';
      case 'closing_soon':
        return 'time';
      case 'opening_soon':
        return 'time';
      default:
        return 'help-circle';
    }
  }

  get statusText(): string {
    switch (this.status) {
      case 'open':
        return 'Abierto';
      case 'closed':
        return 'Cerrado';
      case 'closing_soon':
        return 'Cierra pronto';
      case 'opening_soon':
        return 'Abre pronto';
      default:
        return 'Sin info';
    }
  }

  get timeText(): string | null {
    switch (this.status) {
      case 'closing_soon':
        return this.closingTime ? `· Cierra ${this.closingTime}` : null;
      case 'opening_soon':
        return this.openingTime ? `· Abre ${this.openingTime}` : null;
      case 'open':
        return this.closingTime ? `· Hasta ${this.closingTime}` : null;
      case 'closed':
        return this.openingTime ? `· Abre ${this.openingTime}` : null;
      default:
        return null;
    }
  }

  /**
   * Static utility to calculate open status from opening hours
   */
  static calculateStatus(
    hours: OpeningHours[] | null,
    currentDate = new Date()
  ): { status: OpenStatus; closingTime?: string; openingTime?: string } {
    if (!hours || hours.length === 0) {
      return { status: 'unknown' };
    }

    const currentDay = currentDate.getDay();
    const currentTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

    const todayHours = hours.find(h => h.day === currentDay);

    if (!todayHours) {
      // Find next opening day
      const sortedHours = [...hours].sort((a, b) => {
        const aDays = (a.day - currentDay + 7) % 7 || 7;
        const bDays = (b.day - currentDay + 7) % 7 || 7;
        return aDays - bDays;
      });
      const nextDay = sortedHours[0];
      return {
        status: 'closed',
        openingTime: nextDay ? nextDay.openTime : undefined,
      };
    }

    if (currentTime < todayHours.openTime) {
      // Before opening
      const minutesToOpen = this.getMinutesDiff(currentTime, todayHours.openTime);
      if (minutesToOpen <= 30) {
        return { status: 'opening_soon', openingTime: todayHours.openTime };
      }
      return { status: 'closed', openingTime: todayHours.openTime };
    }

    if (currentTime >= todayHours.closeTime) {
      // After closing - find next opening
      return { status: 'closed' };
    }

    // Currently open
    const minutesToClose = this.getMinutesDiff(currentTime, todayHours.closeTime);
    if (minutesToClose <= 30) {
      return { status: 'closing_soon', closingTime: todayHours.closeTime };
    }

    return { status: 'open', closingTime: todayHours.closeTime };
  }

  private static getMinutesDiff(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }
}
