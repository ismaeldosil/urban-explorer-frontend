import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { register } from 'swiper/element/bundle';

interface OnboardingSlide {
  title: string;
  description: string;
  image: string;
  icon?: string;
}

const ONBOARDING_COMPLETE_KEY = 'urban_explorer_onboarding_complete';

// Register Swiper web components
register();

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-content [fullscreen]="true" [scrollY]="false">
      <div class="onboarding-container">
        <swiper-container
          #swiperRef
        >
          @for (slide of slides; track slide.title) {
            <swiper-slide>
              <div class="slide-content">
                <div class="illustration">
                  @if (slide.icon) {
                    <ion-icon [name]="slide.icon" class="slide-icon"></ion-icon>
                  } @else {
                    <img [src]="slide.image" [alt]="slide.title" />
                  }
                </div>
                <h2 class="slide-title">{{ slide.title }}</h2>
                <p class="slide-description">{{ slide.description }}</p>
              </div>
            </swiper-slide>
          }
        </swiper-container>

        <div class="bottom-section">
          <div class="pagination-dots">
            @for (slide of slides; track $index) {
              <span
                class="dot"
                [class.active]="$index === currentIndex()"
                (click)="goToSlide($index)"
              ></span>
            }
          </div>

          <div class="buttons">
            @if (currentIndex() < slides.length - 1) {
              <ion-button fill="clear" color="medium" (click)="skip()">
                Omitir
              </ion-button>
              <ion-button (click)="next()">
                Siguiente
                <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
              </ion-button>
            } @else {
              <ion-button expand="block" (click)="complete()">
                Comenzar a explorar
                <ion-icon name="compass-outline" slot="end"></ion-icon>
              </ion-button>
            }
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .onboarding-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    }

    swiper-container {
      flex: 1;
      width: 100%;
    }

    swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .slide-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 32px;
      text-align: center;
      max-width: 400px;
    }

    .illustration {
      width: 200px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .slide-icon {
        font-size: 120px;
        color: var(--ion-color-primary);
      }
    }

    .slide-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--ion-text-color);
      margin: 0 0 16px 0;
      line-height: 1.2;
    }

    .slide-description {
      font-size: 16px;
      color: var(--ion-color-medium);
      margin: 0;
      line-height: 1.6;
    }

    .bottom-section {
      padding: 24px 24px calc(var(--ion-safe-area-bottom, 16px) + 24px);
      background: white;
      border-radius: 24px 24px 0 0;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
    }

    .pagination-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: var(--ion-color-light-shade);
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        width: 24px;
        background: var(--ion-color-primary);
      }
    }

    .buttons {
      display: flex;
      gap: 12px;
      align-items: center;

      ion-button:first-child {
        flex-shrink: 0;
      }

      ion-button:last-child {
        flex: 1;
      }
    }

    ion-button[expand="block"] {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  @ViewChild('swiperRef') swiperRef!: ElementRef;

  readonly currentIndex = signal(0);

  readonly slides: OnboardingSlide[] = [
    {
      title: 'Descubre lugares increíbles',
      description: 'Explora restaurantes, cafés, parques y más lugares cerca de ti. Urban Explorer te ayuda a encontrar los mejores spots de tu ciudad.',
      image: 'assets/onboarding/discover.svg',
      icon: 'compass-outline',
    },
    {
      title: 'Lee y comparte reseñas',
      description: 'Conoce la opinión de otros exploradores y comparte tus propias experiencias para ayudar a la comunidad.',
      image: 'assets/onboarding/reviews.svg',
      icon: 'chatbubbles-outline',
    },
    {
      title: 'Guarda tus favoritos',
      description: 'Crea tu lista personalizada de lugares favoritos para visitarlos cuando quieras.',
      image: 'assets/onboarding/favorites.svg',
      icon: 'heart-outline',
    },
    {
      title: 'Navega con el mapa',
      description: 'Visualiza todos los lugares en un mapa interactivo y encuentra la mejor ruta para llegar.',
      image: 'assets/onboarding/map.svg',
      icon: 'map-outline',
    },
  ];

  ngOnInit(): void {
    this.checkOnboardingStatus();
  }

  ngAfterViewInit(): void {
    // Set up slide change listener after view init
    const swiperEl = this.swiperRef?.nativeElement;
    if (swiperEl) {
      swiperEl.addEventListener('swiperslidechange', () => {
        this.onSlideChange();
      });
    }
  }

  private async checkOnboardingStatus(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: ONBOARDING_COMPLETE_KEY });
      if (value === 'true') {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }

  onSlideChange(): void {
    const swiperEl = this.swiperRef?.nativeElement;
    if (swiperEl?.swiper) {
      this.currentIndex.set(swiperEl.swiper.activeIndex);
    }
  }

  goToSlide(index: number): void {
    const swiperEl = this.swiperRef?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideTo(index);
    }
  }

  next(): void {
    const swiperEl = this.swiperRef?.nativeElement;
    if (swiperEl?.swiper) {
      swiperEl.swiper.slideNext();
    }
  }

  async skip(): Promise<void> {
    await this.completeOnboarding();
  }

  async complete(): Promise<void> {
    await this.completeOnboarding();
  }

  private async completeOnboarding(): Promise<void> {
    try {
      await Preferences.set({
        key: ONBOARDING_COMPLETE_KEY,
        value: 'true',
      });
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    }
  }
}
