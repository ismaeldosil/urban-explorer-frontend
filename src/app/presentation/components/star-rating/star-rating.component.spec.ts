import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';
import { IonicModule } from '@ionic/angular';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRatingComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stars array', () => {
    it('should have 5 stars by default', () => {
      expect(component.stars.length).toBe(5);
    });

    it('should respect maxRating', () => {
      component.maxRating = 10;
      expect(component.stars.length).toBe(10);
    });
  });

  describe('starSize', () => {
    it('should return 16 for small size', () => {
      component.size = 'small';
      expect(component.starSize).toBe(16);
    });

    it('should return 24 for medium size', () => {
      component.size = 'medium';
      expect(component.starSize).toBe(24);
    });

    it('should return 32 for large size', () => {
      component.size = 'large';
      expect(component.starSize).toBe(32);
    });
  });

  describe('valueSize', () => {
    it('should return 12 for small size', () => {
      component.size = 'small';
      expect(component.valueSize).toBe(12);
    });

    it('should return 14 for medium size', () => {
      component.size = 'medium';
      expect(component.valueSize).toBe(14);
    });

    it('should return 18 for large size', () => {
      component.size = 'large';
      expect(component.valueSize).toBe(18);
    });
  });

  describe('displayRating', () => {
    it('should return rating when not hovering', () => {
      component.rating = 3.5;
      expect(component.displayRating).toBe(3.5);
    });

    it('should return hoverRating when hovering', () => {
      component.rating = 3.5;
      component['hoverRating'] = 4;
      expect(component.displayRating).toBe(4);
    });
  });

  describe('getStarIcon', () => {
    it('should return star for filled stars', () => {
      component.rating = 3;
      expect(component.getStarIcon(0)).toBe('star');
      expect(component.getStarIcon(1)).toBe('star');
      expect(component.getStarIcon(2)).toBe('star');
    });

    it('should return star-half for half stars', () => {
      component.rating = 3.5;
      expect(component.getStarIcon(3)).toBe('star-half');
    });

    it('should return star-outline for empty stars', () => {
      component.rating = 3;
      expect(component.getStarIcon(3)).toBe('star-outline');
      expect(component.getStarIcon(4)).toBe('star-outline');
    });
  });

  describe('onStarClick', () => {
    it('should not emit when readonly', () => {
      component.readonly = true;
      const emitSpy = spyOn(component.ratingChange, 'emit');

      component.onStarClick(3);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit rating change when interactive', () => {
      component.readonly = false;
      const emitSpy = spyOn(component.ratingChange, 'emit');

      component.onStarClick(4);

      expect(component.rating).toBe(4);
      expect(emitSpy).toHaveBeenCalledWith(4);
    });
  });

  describe('onHover', () => {
    it('should not set hoverRating when readonly', () => {
      component.readonly = true;

      component.onHover(3);

      expect(component['hoverRating']).toBe(0);
    });

    it('should set hoverRating when interactive', () => {
      component.readonly = false;

      component.onHover(4);

      expect(component['hoverRating']).toBe(4);
    });

    it('should clear hoverRating on mouse leave', () => {
      component.readonly = false;
      component['hoverRating'] = 4;

      component.onHover(0);

      expect(component['hoverRating']).toBe(0);
    });
  });
});
