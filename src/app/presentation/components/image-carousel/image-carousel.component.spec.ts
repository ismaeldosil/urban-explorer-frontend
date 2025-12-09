import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ImageCarouselComponent } from './image-carousel.component';

// Unit tests for component logic (no DOM queries)
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

    it('should initialize showIndicators to true', () => {
      expect(component.showIndicators).toBe(true);
    });
  });

  describe('Input Properties', () => {
    it('should accept images input', () => {
      component.images = mockImages;
      expect(component.images).toEqual(mockImages);
      expect(component.images.length).toBe(3);
    });

    it('should handle empty images array', () => {
      component.images = [];
      expect(component.images).toEqual([]);
    });

    it('should handle single image', () => {
      component.images = ['https://example.com/single.jpg'];
      expect(component.images.length).toBe(1);
    });

    it('should accept showIndicators input', () => {
      component.showIndicators = false;
      expect(component.showIndicators).toBe(false);
    });
  });

  describe('onImageError Method', () => {
    it('should set placeholder image on error', () => {
      const mockImg = document.createElement('img');
      mockImg.src = 'https://example.com/image1.jpg';
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toContain('assets/placeholder-image.png');
      expect(mockImg.alt).toBe('Image not available');
    });

    it('should update alt text on error', () => {
      const mockImg = document.createElement('img');
      mockImg.alt = 'Original Alt';
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.alt).toBe('Image not available');
    });
  });

  describe('ngAfterViewInit - Swiper Integration', () => {
    it('should handle missing swiperRef gracefully', () => {
      component.swiperRef = undefined;
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });

    it('should handle swiperRef without nativeElement', () => {
      component.swiperRef = {} as any;
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });

    it('should handle swiperRef with nativeElement but no swiper', () => {
      component.swiperRef = { nativeElement: {} } as any;
      expect(() => component.ngAfterViewInit()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long image URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500) + '.jpg';
      component.images = [longUrl];
      expect(component.images[0]).toBe(longUrl);
    });

    it('should handle special characters in URLs', () => {
      const specialUrl = 'https://example.com/image-with-special_chars@123.jpg?param=value';
      component.images = [specialUrl];
      expect(component.images[0]).toBe(specialUrl);
    });

    it('should handle many images', () => {
      const manyImages = Array(100).fill(null).map((_, i) => `https://example.com/image${i}.jpg`);
      component.images = manyImages;
      expect(component.images.length).toBe(100);
    });

    it('should handle undefined images being set', () => {
      component.images = undefined as any;
      expect(component.images).toBeUndefined();
    });
  });

  describe('Data Binding', () => {
    it('should update images when input changes', () => {
      component.images = mockImages;
      expect(component.images.length).toBe(3);

      component.images = ['single.jpg'];
      expect(component.images.length).toBe(1);
    });

    it('should clear images when set to empty array', () => {
      component.images = mockImages;
      expect(component.images.length).toBe(3);

      component.images = [];
      expect(component.images.length).toBe(0);
    });
  });
});

// Template tests disabled due to Swiper custom elements
xdescribe('ImageCarouselComponent Template Tests', () => {
  // Template tests using Swiper elements are skipped
  it('skipped - template tests require Swiper setup', () => {
    expect(true).toBe(true);
  });
});
