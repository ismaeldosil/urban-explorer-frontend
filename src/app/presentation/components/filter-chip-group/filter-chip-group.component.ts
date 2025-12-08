import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface FilterOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-filter-chip-group',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="filter-chip-group">
      <div class="chip-container">
        <ion-chip
          *ngFor="let filter of filters"
          [outline]="!isSelected(filter.id)"
          [color]="isSelected(filter.id) ? 'primary' : 'medium'"
          (click)="onChipClick(filter.id)"
          [class.selected]="isSelected(filter.id)"
        >
          <ion-label>{{ filter.label }}</ion-label>
        </ion-chip>
      </div>
    </div>
  `,
  styles: [`
    .filter-chip-group {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .filter-chip-group::-webkit-scrollbar {
      display: none;
    }
    .chip-container {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      min-width: min-content;
    }
    ion-chip {
      margin: 0;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
    }
    ion-chip:hover {
      transform: translateY(-1px);
    }
    ion-chip.selected {
      font-weight: 600;
    }
    ion-chip ion-label {
      margin: 0 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterChipGroupComponent {
  @Input() filters: FilterOption[] = [];
  @Input() selectedIds: string[] = [];
  @Input() multiSelect = false;

  @Output() filterChange = new EventEmitter<string[]>();

  isSelected(id: string): boolean {
    return this.selectedIds.includes(id);
  }

  onChipClick(id: string): void {
    let newSelectedIds: string[];

    if (this.multiSelect) {
      // Multi-select mode: toggle selection
      if (this.isSelected(id)) {
        newSelectedIds = this.selectedIds.filter(selectedId => selectedId !== id);
      } else {
        newSelectedIds = [...this.selectedIds, id];
      }
    } else {
      // Single-select mode: replace selection
      if (this.isSelected(id)) {
        // If clicking the already selected item, deselect it
        newSelectedIds = [];
      } else {
        newSelectedIds = [id];
      }
    }

    this.filterChange.emit(newSelectedIds);
  }
}
