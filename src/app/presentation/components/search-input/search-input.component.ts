import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <div class="search-container" [class.focused]="isFocused" [class.disabled]="disabled">
      <ion-icon *ngIf="!loading" name="search-outline" class="search-icon"></ion-icon>
      <ion-spinner *ngIf="loading" name="crescent" class="search-icon spinner"></ion-spinner>

      <input
        #searchInput
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="internalValue"
        [disabled]="disabled"
        (ngModelChange)="onValueChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keyup.enter)="onSubmit()"
        enterkeyhint="search"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />

      <ion-icon
        *ngIf="internalValue && !disabled"
        name="close-circle"
        class="clear-icon"
        (click)="onClear()"
      ></ion-icon>
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      align-items: center;
      background: #F5F5F5;
      border-radius: 24px;
      padding: 12px 16px;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }
    .search-container.focused {
      background: #FFFFFF;
      border-color: var(--ion-color-primary);
      box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.15);
    }
    .search-container.disabled {
      opacity: 0.7;
      cursor: pointer;
    }
    .search-icon {
      font-size: 22px;
      color: var(--ion-color-medium);
      margin-right: 12px;
      flex-shrink: 0;
    }
    .spinner {
      width: 22px;
      height: 22px;
    }
    input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: #1a1a1a;
      outline: none;
      -webkit-text-fill-color: #1a1a1a;
    }
    input::placeholder {
      color: #999999;
      -webkit-text-fill-color: #999999;
    }
    .clear-icon {
      font-size: 20px;
      color: var(--ion-color-medium);
      cursor: pointer;
      margin-left: 8px;
      flex-shrink: 0;
    }
    .clear-icon:hover {
      color: var(--ion-color-dark);
    }
  `]
})
export class SearchInputComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput', { static: false }) inputRef!: ElementRef<HTMLInputElement>;

  @Input() placeholder = 'Buscar...';
  @Input() set value(val: string) {
    this.internalValue = val;
  }
  @Input() debounceTime = 300;
  @Input() loading = false;
  @Input() autofocus = false;
  @Input() disabled = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  protected isFocused = false;
  protected internalValue = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchChange.emit(value);
    });
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      setTimeout(() => this.focusInput(), 400);
    }
  }

  focusInput(): void {
    this.inputRef?.nativeElement?.focus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onValueChange(value: string): void {
    this.searchSubject.next(value);
  }

  onFocus(): void {
    this.isFocused = true;
    this.focus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.blur.emit();
  }

  onSubmit(): void {
    this.searchSubmit.emit(this.internalValue);
  }

  onClear(): void {
    this.internalValue = '';
    this.searchChange.emit('');
    this.searchClear.emit();
    this.inputRef?.nativeElement?.focus();
  }
}
