import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewCardComponent, ReviewData } from './review-card.component';
import { IonicModule } from '@ionic/angular';

describe('ReviewCardComponent', () => {
  let component: ReviewCardComponent;
  let fixture: ComponentFixture<ReviewCardComponent>;

  const mockReview: ReviewData = {
    id: 'review-1',
    userName: 'John Doe',
    userAvatar: 'https://example.com/avatar.jpg',
    rating: 4.5,
    comment: 'Great place!',
    date: new Date(),
    photos: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCardComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formatDate', () => {
    it('should return empty string for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('');
    });

    it('should return "Hoy" for today', () => {
      expect(component.formatDate(new Date())).toBe('Hoy');
    });

    it('should return "Ayer" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.formatDate(yesterday)).toBe('Ayer');
    });

    it('should return "Hace X días" for dates within a week', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(component.formatDate(threeDaysAgo)).toBe('Hace 3 días');
    });

    it('should return "Hace X semana(s)" for dates within a month', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      expect(component.formatDate(twoWeeksAgo)).toBe('Hace 2 semanas');
    });

    it('should return "Hace 1 semana" for singular week', () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      expect(component.formatDate(oneWeekAgo)).toBe('Hace 1 semana');
    });

    it('should return "Hace X mes(es)" for dates within a year', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
      expect(component.formatDate(threeMonthsAgo)).toBe('Hace 3 meses');
    });

    it('should return "Hace 1 mes" for singular month', () => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      expect(component.formatDate(oneMonthAgo)).toBe('Hace 1 mes');
    });

    it('should return formatted date for dates over a year ago', () => {
      const oldDate = new Date('2020-06-15');
      const result = component.formatDate(oldDate);
      expect(result).toContain('2020');
    });

    it('should handle string dates', () => {
      const dateString = new Date().toISOString();
      expect(component.formatDate(dateString)).toBe('Hoy');
    });
  });

  describe('getDisplayPhotos', () => {
    it('should return empty array when no photos', () => {
      component.review = undefined;
      expect(component.getDisplayPhotos()).toEqual([]);
    });

    it('should return empty array when photos is undefined', () => {
      component.review = { ...mockReview, photos: undefined };
      expect(component.getDisplayPhotos()).toEqual([]);
    });

    it('should limit photos to maxPhotosDisplay', () => {
      component.review = mockReview;
      component.maxPhotosDisplay = 4;
      const photos = component.getDisplayPhotos();
      expect(photos.length).toBe(4);
    });

    it('should return all photos if less than maxPhotosDisplay', () => {
      component.review = { ...mockReview, photos: ['photo1.jpg', 'photo2.jpg'] };
      component.maxPhotosDisplay = 4;
      const photos = component.getDisplayPhotos();
      expect(photos.length).toBe(2);
    });
  });

  describe('getRemainingPhotosCount', () => {
    it('should return 0 when no photos', () => {
      component.review = undefined;
      expect(component.getRemainingPhotosCount()).toBe(0);
    });

    it('should return 0 when photos is undefined', () => {
      component.review = { ...mockReview, photos: undefined };
      expect(component.getRemainingPhotosCount()).toBe(0);
    });

    it('should return remaining count', () => {
      component.review = mockReview;
      component.maxPhotosDisplay = 4;
      expect(component.getRemainingPhotosCount()).toBe(1);
    });

    it('should return 0 when fewer photos than maxPhotosDisplay', () => {
      component.review = { ...mockReview, photos: ['photo1.jpg'] };
      component.maxPhotosDisplay = 4;
      expect(component.getRemainingPhotosCount()).toBe(0);
    });
  });

  describe('onAvatarError', () => {
    it('should hide image on error', () => {
      const mockImg = document.createElement('img');
      const event = { target: mockImg } as unknown as Event;

      component.onAvatarError(event);

      expect(mockImg.style.display).toBe('none');
    });
  });

  describe('onPhotoError', () => {
    it('should set placeholder image on error', () => {
      const mockImg = document.createElement('img');
      const event = { target: mockImg } as unknown as Event;

      component.onPhotoError(event);

      expect(mockImg.src).toContain('placeholder-image.png');
      expect(mockImg.alt).toBe('Image not available');
    });
  });

  describe('skeleton mode', () => {
    it('should default skeleton to false', () => {
      expect(component.skeleton).toBe(false);
    });

    it('should accept skeleton input', () => {
      component.skeleton = true;
      expect(component.skeleton).toBe(true);
    });
  });
});
