import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <button
      type="button"
      class="avatar-container"
      [class.clickable]="clickable"
      [class.has-border]="showBorder"
      [class.online]="showOnline"
      [attr.aria-label]="name ? 'Avatar de ' + name : 'Avatar de usuario'"
      [style.--avatar-size]="sizeValue"
      [style.--avatar-font-size]="fontSize"
      [disabled]="!clickable"
      (click)="onClick()"
    >
      @if (imageUrl) {
        <img
          [src]="imageUrl"
          [alt]="name || 'Avatar'"
          class="avatar-image"
          (error)="onImageError()"
        />
      } @else {
        <div class="avatar-placeholder" [style.background]="backgroundColor">
          @if (name) {
            <span class="initials">{{ initials }}</span>
          } @else {
            <ion-icon name="person"></ion-icon>
          }
        </div>
      }

      @if (showBadge) {
        <span class="badge" [style.background]="badgeColor">
          @if (badgeIcon) {
            <ion-icon [name]="badgeIcon"></ion-icon>
          } @else if (badgeCount !== undefined) {
            {{ badgeCount > 99 ? '99+' : badgeCount }}
          }
        </span>
      }

      @if (showOnline) {
        <span class="online-indicator"></span>
      }

      @if (editable) {
        <div class="edit-overlay">
          <ion-icon name="camera"></ion-icon>
        </div>
      }
    </button>
  `,
  styles: [`
    .avatar-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--avatar-size, 48px);
      height: var(--avatar-size, 48px);
      border-radius: 50%;
      overflow: hidden;
      background: transparent;
      border: none;
      padding: 0;
      cursor: default;
      flex-shrink: 0;
    }

    .avatar-container.clickable {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .avatar-container.has-border {
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));

      .initials {
        color: white;
        font-size: var(--avatar-font-size, 18px);
        font-weight: 600;
        text-transform: uppercase;
        line-height: 1;
      }

      ion-icon {
        color: white;
        font-size: calc(var(--avatar-size, 48px) * 0.5);
      }
    }

    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ion-color-danger);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: 9px;
      border: 2px solid white;

      ion-icon {
        font-size: 10px;
      }
    }

    .online-indicator {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border-radius: 50%;
      border: 2px solid white;
    }

    .edit-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;

      ion-icon {
        color: white;
        font-size: calc(var(--avatar-size, 48px) * 0.3);
      }
    }

    .avatar-container:hover .edit-overlay {
      opacity: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  @Input() imageUrl?: string | null;
  @Input() name?: string;
  @Input() size: AvatarSize = 'md';
  @Input() showBorder = false;
  @Input() showOnline = false;
  @Input() showBadge = false;
  @Input() badgeCount?: number;
  @Input() badgeIcon?: string;
  @Input() badgeColor = 'var(--ion-color-danger)';
  @Input() clickable = false;
  @Input() editable = false;

  @Output() avatarClick = new EventEmitter<void>();

  private imageLoadError = false;

  private readonly sizeMap: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  private readonly fontSizeMap: Record<AvatarSize, number> = {
    xs: 10,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 36,
  };

  private readonly colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE',
    '#FD79A8', '#00B894', '#E17055', '#6C5CE7',
  ];

  get sizeValue(): string {
    return `${this.sizeMap[this.size]}px`;
  }

  get fontSize(): string {
    return `${this.fontSizeMap[this.size]}px`;
  }

  get initials(): string {
    if (!this.name) return '';

    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get backgroundColor(): string {
    if (!this.name) return this.colors[0];

    // Generate consistent color based on name
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.colors.length;
    return this.colors[index];
  }

  onClick(): void {
    if (this.clickable || this.editable) {
      this.avatarClick.emit();
    }
  }

  onImageError(): void {
    this.imageLoadError = true;
    // Force re-render to show placeholder
    this.imageUrl = null;
  }
}
