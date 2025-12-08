import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type ActionButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ActionButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <button
      type="button"
      class="action-button"
      [class]="variantClass + ' ' + sizeClass"
      [class.full-width]="fullWidth"
      [class.icon-only]="iconOnly"
      [class.loading]="loading"
      [disabled]="disabled || loading"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <ion-spinner name="crescent" class="spinner"></ion-spinner>
      } @else {
        @if (icon && iconPosition === 'start') {
          <ion-icon [name]="icon" class="icon start"></ion-icon>
        }
        @if (!iconOnly) {
          <span class="label"><ng-content></ng-content></span>
        }
        @if (icon && iconPosition === 'end') {
          <ion-icon [name]="icon" class="icon end"></ion-icon>
        }
      }
    </button>
  `,
  styles: [`
    .action-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(:disabled):active {
        transform: scale(0.98);
      }
    }

    /* Variants */
    .variant-primary {
      background: var(--ion-color-primary);
      color: white;

      &:not(:disabled):hover {
        background: var(--ion-color-primary-shade);
      }
    }

    .variant-secondary {
      background: var(--ion-color-light);
      color: var(--ion-color-dark);

      &:not(:disabled):hover {
        background: var(--ion-color-light-shade);
      }
    }

    .variant-outline {
      background: transparent;
      border: 2px solid var(--ion-color-primary);
      color: var(--ion-color-primary);

      &:not(:disabled):hover {
        background: var(--ion-color-primary);
        color: white;
      }
    }

    .variant-ghost {
      background: transparent;
      color: var(--ion-color-primary);

      &:not(:disabled):hover {
        background: rgba(var(--ion-color-primary-rgb), 0.1);
      }
    }

    .variant-danger {
      background: var(--ion-color-danger);
      color: white;

      &:not(:disabled):hover {
        background: var(--ion-color-danger-shade);
      }
    }

    /* Sizes */
    .size-sm {
      padding: 8px 16px;
      font-size: 13px;
      min-height: 32px;

      .icon {
        font-size: 16px;
      }

      .spinner {
        width: 16px;
        height: 16px;
      }
    }

    .size-md {
      padding: 12px 24px;
      font-size: 15px;
      min-height: 44px;

      .icon {
        font-size: 20px;
      }

      .spinner {
        width: 20px;
        height: 20px;
      }
    }

    .size-lg {
      padding: 16px 32px;
      font-size: 17px;
      min-height: 52px;

      .icon {
        font-size: 24px;
      }

      .spinner {
        width: 24px;
        height: 24px;
      }
    }

    /* Modifiers */
    .full-width {
      width: 100%;
    }

    .icon-only {
      padding: 0;
      aspect-ratio: 1;

      &.size-sm {
        width: 32px;
        height: 32px;
      }

      &.size-md {
        width: 44px;
        height: 44px;
      }

      &.size-lg {
        width: 52px;
        height: 52px;
      }
    }

    .loading {
      .spinner {
        color: currentColor;
      }
    }

    .icon {
      flex-shrink: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  @Input() variant: ActionButtonVariant = 'primary';
  @Input() size: ActionButtonSize = 'md';
  @Input() icon?: string;
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() iconOnly = false;
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() loading = false;

  @Output() buttonClick = new EventEmitter<MouseEvent>();

  get variantClass(): string {
    return `variant-${this.variant}`;
  }

  get sizeClass(): string {
    return `size-${this.size}`;
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
