import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-card class="stat-card" [class]="'stat-card--' + color">
      <ion-card-content>
        <div class="stat-card-content">
          <div class="icon-container" [style.background]="getIconBackground()">
            <ion-icon [name]="icon" [style.color]="getIconColor()"></ion-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ value }}</div>
            <div class="stat-label">{{ label }}</div>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .stat-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      --background: #FFFFFF;
    }
    ion-card-content {
      padding: 16px;
    }
    .stat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-container ion-icon {
      font-size: 24px;
    }
    .stat-info {
      flex: 1;
      min-width: 0;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-text-color);
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 14px;
      color: var(--ion-color-medium);
      line-height: 1.2;
    }

    /* Color variants */
    .stat-card--primary .icon-container {
      background: rgba(var(--ion-color-primary-rgb), 0.1);
    }
    .stat-card--primary .icon-container ion-icon {
      color: var(--ion-color-primary);
    }

    .stat-card--secondary .icon-container {
      background: rgba(var(--ion-color-secondary-rgb), 0.1);
    }
    .stat-card--secondary .icon-container ion-icon {
      color: var(--ion-color-secondary);
    }

    .stat-card--success .icon-container {
      background: rgba(var(--ion-color-success-rgb), 0.1);
    }
    .stat-card--success .icon-container ion-icon {
      color: var(--ion-color-success);
    }

    .stat-card--warning .icon-container {
      background: rgba(var(--ion-color-warning-rgb), 0.1);
    }
    .stat-card--warning .icon-container ion-icon {
      color: var(--ion-color-warning);
    }

    .stat-card--danger .icon-container {
      background: rgba(var(--ion-color-danger-rgb), 0.1);
    }
    .stat-card--danger .icon-container ion-icon {
      color: var(--ion-color-danger);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  @Input() icon = 'stats-chart-outline';
  @Input() value: number | string = 0;
  @Input() label = '';
  @Input() color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary';

  getIconBackground(): string {
    const colorMap: Record<string, string> = {
      primary: 'rgba(var(--ion-color-primary-rgb), 0.1)',
      secondary: 'rgba(var(--ion-color-secondary-rgb), 0.1)',
      success: 'rgba(var(--ion-color-success-rgb), 0.1)',
      warning: 'rgba(var(--ion-color-warning-rgb), 0.1)',
      danger: 'rgba(var(--ion-color-danger-rgb), 0.1)'
    };
    return colorMap[this.color] || colorMap['primary'];
  }

  getIconColor(): string {
    const colorMap: Record<string, string> = {
      primary: 'var(--ion-color-primary)',
      secondary: 'var(--ion-color-secondary)',
      success: 'var(--ion-color-success)',
      warning: 'var(--ion-color-warning)',
      danger: 'var(--ion-color-danger)'
    };
    return colorMap[this.color] || colorMap['primary'];
  }
}
