import { Component, Input, ViewChild, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

@Component({
  selector: 'app-image-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="image-carousel-container">
      @if (images && images.length > 0) {
        <swiper-container
          #swiperRef
          [pagination]="true"
          [zoom]="true"
          class="image-swiper"
        >
          @for (image of images; track image; let i = $index) {
            <swiper-slide>
              <div class="swiper-zoom-container">
                <img
                  [src]="image"
                  [alt]="'Image ' + (i + 1)"
                  (error)="onImageError($event)"
                />
              </div>
            </swiper-slide>
          }
        </swiper-container>

        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      } @else {
        <div class="no-images">
          <ion-icon name="images-outline"></ion-icon>
          <p>No hay imágenes disponibles</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .image-carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 300px;
      background: #000;
    }

    .image-swiper {
      width: 100%;
      height: 100%;
    }

    swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .swiper-zoom-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .swiper-zoom-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-width: 100%;
      max-height: 100%;
    }

    .image-counter {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10;
      pointer-events: none;
    }

    .no-images {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #666;
    }

    .no-images ion-icon {
      font-size: 64px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-images p {
      margin: 0;
      font-size: 16px;
      color: #999;
    }

    /* Swiper pagination customization */
    ::ng-deep {
      .swiper-pagination-bullet {
        background: #fff;
        opacity: 0.5;
      }

      .swiper-pagination-bullet-active {
        opacity: 1;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageCarouselComponent implements AfterViewInit {
  @Input() images: string[] = [];
  @ViewChild('swiperRef', { static: false }) swiperRef: any;

  protected currentIndex = 0;

  ngAfterViewInit(): void {
    if (this.swiperRef?.nativeElement) {
      const swiper = this.swiperRef.nativeElement.swiper;

      // Listen to slide change events
      swiper?.on('slideChange', () => {
        this.currentIndex = swiper.activeIndex;
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-image.png';
    img.alt = 'Image not available';
  }
}
