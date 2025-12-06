import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ImageCarouselComponent } from './image-carousel.component';

describe('ImageCarouselComponent', () => {
  let component: ImageCarouselComponent;
  let fixture: ComponentFixture<ImageCarouselComponent>;

  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCarouselComponent, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCarouselComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty images array', () => {
      expect(component.images).toEqual([]);
    });

    it('should initialize currentIndex to 0', () => {
      expect(component['currentIndex']).toBe(0);
    });
  });

  describe('Input Properties', () => {
    it('should accept images input', () => {
      component.images = mockImages;
      fixture.detectChanges();

      expect(component.images).toEqual(mockImages);
      expect(component.images.length).toBe(3);
    });

    it('should handle empty images array', () => {
      component.images = [];
      fixture.detectChanges();

      expect(component.images).toEqual([]);
    });

    it('should handle single image', () => {
      component.images = ['https://example.com/single.jpg'];
      fixture.detectChanges();

      expect(component.images.length).toBe(1);
    });

    it('should update when images change', () => {
      component.images = mockImages;
      fixture.detectChanges();

      const newImages = ['https://example.com/new1.jpg', 'https://example.com/new2.jpg'];
      component.images = newImages;
      fixture.detectChanges();

      expect(component.images).toEqual(newImages);
    });
  });

  describe('Template Rendering - With Images', () => {
    beforeEach(() => {
      component.images = mockImages;
      fixture.detectChanges();
    });

    it('should render swiper-container when images exist', () => {
      const swiperContainer = fixture.nativeElement.querySelector('swiper-container');
      expect(swiperContainer).toBeTruthy();
    });

    it('should render correct number of swiper-slide elements', () => {
      const slides = fixture.nativeElement.querySelectorAll('swiper-slide');
      expect(slides.length).toBe(3);
    });

    it('should render images with correct src attributes', () => {
      const images = fixture.nativeElement.querySelectorAll('swiper-slide img');

      expect(images[0].getAttribute('src')).toBe('https://example.com/image1.jpg');
      expect(images[1].getAttribute('src')).toBe('https://example.com/image2.jpg');
      expect(images[2].getAttribute('src')).toBe('https://example.com/image3.jpg');
    });

    it('should render images with correct alt attributes', () => {
      const images = fixture.nativeElement.querySelectorAll('swiper-slide img');

      expect(images[0].getAttribute('alt')).toBe('Image 1');
      expect(images[1].getAttribute('alt')).toBe('Image 2');
      expect(images[2].getAttribute('alt')).toBe('Image 3');
    });

    it('should render image counter', () => {
      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter).toBeTruthy();
      expect(counter.textContent.trim()).toBe('1 / 3');
    });

    it('should have pagination enabled on swiper', () => {
      const swiperContainer = fixture.nativeElement.querySelector('swiper-container');
      expect(swiperContainer.hasAttribute('pagination')).toBe(true);
    });

    it('should have zoom enabled on swiper', () => {
      const swiperContainer = fixture.nativeElement.querySelector('swiper-container');
      expect(swiperContainer.hasAttribute('zoom')).toBe(true);
    });

    it('should wrap images in swiper-zoom-container', () => {
      const zoomContainers = fixture.nativeElement.querySelectorAll('.swiper-zoom-container');
      expect(zoomContainers.length).toBe(3);
    });

    it('should not render no-images state', () => {
      const noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeFalsy();
    });
  });

  describe('Template Rendering - Empty State', () => {
    beforeEach(() => {
      component.images = [];
      fixture.detectChanges();
    });

    it('should render no-images state when images array is empty', () => {
      const noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeTruthy();
    });

    it('should display empty state icon', () => {
      const icon = fixture.nativeElement.querySelector('.no-images ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('images-outline');
    });

    it('should display empty state message', () => {
      const message = fixture.nativeElement.querySelector('.no-images p');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('No hay imágenes disponibles');
    });

    it('should not render swiper-container in empty state', () => {
      const swiperContainer = fixture.nativeElement.querySelector('swiper-container');
      expect(swiperContainer).toBeFalsy();
    });

    it('should not render image counter in empty state', () => {
      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter).toBeFalsy();
    });
  });

  describe('Image Error Handling', () => {
    beforeEach(() => {
      component.images = mockImages;
      fixture.detectChanges();
    });

    it('should handle image error event', () => {
      const mockImg = document.createElement('img');
      mockImg.src = 'https://example.com/image1.jpg';
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toContain('assets/placeholder-image.png');
      expect(mockImg.alt).toBe('Image not available');
    });

    it('should have error handler bound to images', () => {
      const images = fixture.nativeElement.querySelectorAll('swiper-slide img');

      images.forEach((img: HTMLImageElement) => {
        expect(img.getAttribute('ng-reflect-ng-on-error')).toBeDefined();
      });
    });

    it('should replace failed image with placeholder', () => {
      const mockImg = document.createElement('img');
      mockImg.src = 'invalid-url';
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toContain('placeholder-image.png');
    });

    it('should update alt text when image fails', () => {
      const mockImg = document.createElement('img');
      mockImg.alt = 'Original alt';
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.alt).toBe('Image not available');
    });
  });

  describe('Swiper Integration - AfterViewInit', () => {
    it('should access swiperRef in ngAfterViewInit when available', () => {
      component.images = mockImages;
      fixture.detectChanges();

      const mockSwiper = {
        activeIndex: 0,
        on: jest.fn()
      };

      component.swiperRef = {
        nativeElement: {
          swiper: mockSwiper
        }
      };

      component.ngAfterViewInit();

      expect(mockSwiper.on).toHaveBeenCalledWith('slideChange', expect.any(Function));
    });

    it('should handle missing swiperRef gracefully', () => {
      component.swiperRef = undefined;

      expect(() => component.ngAfterViewInit()).not.toThrow();
    });

    it('should handle swiperRef without nativeElement', () => {
      component.swiperRef = {} as any;

      expect(() => component.ngAfterViewInit()).not.toThrow();
    });

    it('should handle swiper without on method', () => {
      component.swiperRef = {
        nativeElement: {
          swiper: {}
        }
      };

      expect(() => component.ngAfterViewInit()).not.toThrow();
    });

    it('should update currentIndex when slide changes', () => {
      component.images = mockImages;
      fixture.detectChanges();

      let slideChangeCallback: (() => void) | undefined;
      const mockSwiper = {
        activeIndex: 0,
        on: jest.fn((event, callback) => {
          if (event === 'slideChange') {
            slideChangeCallback = callback;
          }
        })
      };

      component.swiperRef = {
        nativeElement: {
          swiper: mockSwiper
        }
      };

      component.ngAfterViewInit();

      // Simulate slide change
      mockSwiper.activeIndex = 2;
      slideChangeCallback!();

      expect(component['currentIndex']).toBe(2);
    });
  });

  describe('Image Counter Display', () => {
    it('should show 1 / 1 for single image', () => {
      component.images = ['https://example.com/single.jpg'];
      fixture.detectChanges();

      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter.textContent.trim()).toBe('1 / 1');
    });

    it('should show correct initial count for multiple images', () => {
      component.images = mockImages;
      fixture.detectChanges();

      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter.textContent.trim()).toBe('1 / 3');
    });

    it('should update counter when currentIndex changes', () => {
      component.images = mockImages;
      component['currentIndex'] = 1;
      fixture.detectChanges();

      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter.textContent.trim()).toBe('2 / 3');
    });

    it('should show correct count for many images', () => {
      component.images = Array(10).fill('').map((_, i) => `https://example.com/image${i}.jpg`);
      fixture.detectChanges();

      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter.textContent.trim()).toBe('1 / 10');
    });
  });

  describe('CSS Classes and Styling', () => {
    beforeEach(() => {
      component.images = mockImages;
      fixture.detectChanges();
    });

    it('should have image-carousel-container class', () => {
      const container = fixture.nativeElement.querySelector('.image-carousel-container');
      expect(container).toBeTruthy();
    });

    it('should have image-swiper class on swiper-container', () => {
      const swiper = fixture.nativeElement.querySelector('swiper-container');
      expect(swiper.classList.contains('image-swiper')).toBe(true);
    });

    it('should have swiper-zoom-container class on zoom divs', () => {
      const zoomContainers = fixture.nativeElement.querySelectorAll('.swiper-zoom-container');
      expect(zoomContainers.length).toBeGreaterThan(0);
    });

    it('should have image-counter class on counter element', () => {
      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined images input', () => {
      component.images = undefined as any;
      fixture.detectChanges();

      const noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeTruthy();
    });

    it('should handle null images input', () => {
      component.images = null as any;
      fixture.detectChanges();

      const noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeTruthy();
    });

    it('should handle very long image URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.jpg';
      component.images = [longUrl];
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('swiper-slide img');
      expect(img.getAttribute('src')).toBe(longUrl);
    });

    it('should handle special characters in URLs', () => {
      const specialUrl = 'https://example.com/image-with-special_chars@123.jpg?param=value';
      component.images = [specialUrl];
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('swiper-slide img');
      expect(img.getAttribute('src')).toBe(specialUrl);
    });

    it('should handle 100+ images', () => {
      const manyImages = Array(100).fill('').map((_, i) => `https://example.com/image${i}.jpg`);
      component.images = manyImages;
      fixture.detectChanges();

      const slides = fixture.nativeElement.querySelectorAll('swiper-slide');
      expect(slides.length).toBe(100);
    });

    it('should reset currentIndex when images change', () => {
      component.images = mockImages;
      component['currentIndex'] = 2;
      fixture.detectChanges();

      component.images = ['https://example.com/new.jpg'];
      fixture.detectChanges();

      const counter = fixture.nativeElement.querySelector('.image-counter');
      expect(counter.textContent).toContain('/ 1');
    });
  });

  describe('OnPush Change Detection', () => {
    it('should update view when images input changes', () => {
      component.images = [];
      fixture.detectChanges();

      let noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeTruthy();

      component.images = mockImages;
      fixture.detectChanges();

      noImages = fixture.nativeElement.querySelector('.no-images');
      expect(noImages).toBeFalsy();

      const swiper = fixture.nativeElement.querySelector('swiper-container');
      expect(swiper).toBeTruthy();
    });

    it('should reflect changes when images array is modified', () => {
      const images = [...mockImages];
      component.images = images;
      fixture.detectChanges();

      let slides = fixture.nativeElement.querySelectorAll('swiper-slide');
      expect(slides.length).toBe(3);

      component.images = [...images, 'https://example.com/new.jpg'];
      fixture.detectChanges();

      slides = fixture.nativeElement.querySelectorAll('swiper-slide');
      expect(slides.length).toBe(4);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.images = mockImages;
      fixture.detectChanges();
    });

    it('should provide meaningful alt text for images', () => {
      const images = fixture.nativeElement.querySelectorAll('swiper-slide img');

      images.forEach((img: HTMLImageElement, index: number) => {
        expect(img.alt).toBe(`Image ${index + 1}`);
      });
    });

    it('should update alt text on error to indicate unavailability', () => {
      const mockImg = document.createElement('img');
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.alt).toBe('Image not available');
    });
  });

  describe('Swiper Configuration', () => {
    beforeEach(() => {
      component.images = mockImages;
      fixture.detectChanges();
    });

    it('should configure swiper with pagination', () => {
      const swiper = fixture.nativeElement.querySelector('swiper-container');
      expect(swiper.getAttribute('pagination')).toBe('true');
    });

    it('should configure swiper with zoom', () => {
      const swiper = fixture.nativeElement.querySelector('swiper-container');
      expect(swiper.getAttribute('zoom')).toBe('true');
    });

    it('should have correct swiper container structure', () => {
      const container = fixture.nativeElement.querySelector('.image-carousel-container');
      const swiper = container.querySelector('swiper-container');
      const slides = swiper.querySelectorAll('swiper-slide');

      expect(container).toBeTruthy();
      expect(swiper).toBeTruthy();
      expect(slides.length).toBe(3);
    });
  });
});
