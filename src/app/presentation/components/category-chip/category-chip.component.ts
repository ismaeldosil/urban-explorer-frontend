import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface CategoryChipData {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

@Component({
  selector: 'app-category-chip',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <button
      type="button"
      class="category-chip"
      [class.selected]="selected"
      [class.small]="size === 'small'"
      [class.large]="size === 'large'"
      [style.--chip-color]="category.color || defaultColor"
      (click)="onChipClick()"
    >
      <ion-icon [name]="category.icon"></ion-icon>
      @if (!iconOnly) {
        <span class="chip-label">{{ category.name }}</span>
      }
      @if (showCount && count !== undefined) {
        <span class="chip-count">{{ count }}</span>
      }
    </button>
  `,
  styles: [`
    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1.5px solid var(--ion-color-light-shade);
      border-radius: 20px;
      background: var(--ion-background-color, #fff);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;

      ion-icon {
        font-size: 18px;
        color: var(--chip-color, var(--ion-color-medium));
      }

      .chip-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--ion-text-color);
        white-space: nowrap;
      }

      .chip-count {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        background: var(--ion-color-light);
        color: var(--ion-color-medium);
      }

      &:hover {
        background: var(--ion-color-light);
      }

      &:active {
        transform: scale(0.96);
      }

      &.selected {
        background: var(--chip-color, var(--ion-color-primary));
        border-color: var(--chip-color, var(--ion-color-primary));

        ion-icon {
          color: white;
        }

        .chip-label {
          color: white;
        }

        .chip-count {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }
      }

      // Size variants
      &.small {
        padding: 6px 10px;
        gap: 4px;

        ion-icon {
          font-size: 14px;
        }

        .chip-label {
          font-size: 11px;
        }
      }

      &.large {
        padding: 10px 18px;
        gap: 8px;

        ion-icon {
          font-size: 22px;
        }

        .chip-label {
          font-size: 15px;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryChipComponent {
  @Input({ required: true }) category!: CategoryChipData;
  @Input() selected = false;
  @Input() iconOnly = false;
  @Input() showCount = false;
  @Input() count?: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() chipClick = new EventEmitter<CategoryChipData>();

  readonly defaultColor = 'var(--ion-color-primary)';

  onChipClick(): void {
    this.chipClick.emit(this.category);
  }
}
