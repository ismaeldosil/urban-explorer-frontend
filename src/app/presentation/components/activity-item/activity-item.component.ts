import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface ActivityUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface ActivityLocation {
  id: string;
  name: string;
}

export type ActivityType = 'review' | 'favorite';

@Component({
  selector: 'app-activity-item',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-item class="activity-item" lines="none">
      <div class="avatar-container" slot="start">
        @if (user?.avatarUrl) {
          <img [src]="user.avatarUrl" [alt]="user.name" class="avatar" />
        } @else {
          <div class="avatar-placeholder">
            <ion-icon name="person-outline"></ion-icon>
          </div>
        }
      </div>

      <ion-label>
        <div class="activity-content">
          <div class="activity-header">
            <span class="user-name">{{ user?.name }}</span>
            <span class="activity-text">{{ getActivityText() }}</span>
            <span class="location-name">{{ location?.name }}</span>
          </div>
          <div class="activity-date">
            <ion-icon [name]="getActivityIcon()" class="activity-icon"></ion-icon>
            <span>{{ formatDate(date) }}</span>
          </div>
        </div>
      </ion-label>
    </ion-item>
  `,
  styles: [`
    .activity-item {
      --padding-start: 0;
      --padding-end: 0;
      --inner-padding-end: 0;
      --background: transparent;
      margin-bottom: 16px;
    }
    .avatar-container {
      width: 48px;
      height: 48px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #F0F0F0;
    }
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #F0F0F0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #E0E0E0;
    }
    .avatar-placeholder ion-icon {
      font-size: 24px;
      color: #999;
    }
    .activity-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .activity-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px;
      font-size: 14px;
      line-height: 1.4;
    }
    .user-name {
      font-weight: 600;
      color: var(--ion-text-color);
    }
    .activity-text {
      color: var(--ion-color-medium);
    }
    .location-name {
      font-weight: 500;
      color: var(--ion-color-primary);
    }
    .activity-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--ion-color-medium);
    }
    .activity-icon {
      font-size: 14px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityItemComponent {
  @Input() type: ActivityType = 'review';
  @Input() user?: ActivityUser;
  @Input() location?: ActivityLocation;
  @Input() date?: Date | string;

  getActivityText(): string {
    const textMap: Record<ActivityType, string> = {
      review: 'dejó una reseña en',
      favorite: 'agregó a favoritos'
    };
    return textMap[this.type] || '';
  }

  getActivityIcon(): string {
    const iconMap: Record<ActivityType, string> = {
      review: 'chatbox-outline',
      favorite: 'heart-outline'
    };
    return iconMap[this.type] || 'information-circle-outline';
  }

  formatDate(date?: Date | string): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    } else {
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}
