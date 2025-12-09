import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationMarkerComponent, MarkerCategory } from './location-marker.component';
import { IonicModule } from '@ionic/angular';

describe('LocationMarkerComponent', () => {
  let component: LocationMarkerComponent;
  let fixture: ComponentFixture<LocationMarkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationMarkerComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationMarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default category to default', () => {
      expect(component.category).toBe('default');
    });

    it('should default selected to false', () => {
      expect(component.selected).toBe(false);
    });

    it('should default showRating to true', () => {
      expect(component.showRating).toBe(true);
    });
  });

  describe('categoryIcon', () => {
    it('should return restaurant icon for restaurant', () => {
      component.category = 'restaurant';
      expect(component.categoryIcon).toBe('restaurant');
    });

    it('should return cafe icon for cafe', () => {
      component.category = 'cafe';
      expect(component.categoryIcon).toBe('cafe');
    });

    it('should return beer icon for bar', () => {
      component.category = 'bar';
      expect(component.categoryIcon).toBe('beer');
    });

    it('should return leaf icon for park', () => {
      component.category = 'park';
      expect(component.categoryIcon).toBe('leaf');
    });

    it('should return business icon for museum', () => {
      component.category = 'museum';
      expect(component.categoryIcon).toBe('business');
    });

    it('should return bag icon for shopping', () => {
      component.category = 'shopping';
      expect(component.categoryIcon).toBe('bag');
    });

    it('should return game-controller icon for entertainment', () => {
      component.category = 'entertainment';
      expect(component.categoryIcon).toBe('game-controller');
    });

    it('should return bed icon for hotel', () => {
      component.category = 'hotel';
      expect(component.categoryIcon).toBe('bed');
    });

    it('should return location icon for default', () => {
      component.category = 'default';
      expect(component.categoryIcon).toBe('location');
    });
  });

  describe('categoryColor', () => {
    it('should return red for restaurant', () => {
      component.category = 'restaurant';
      expect(component.categoryColor).toBe('#ef4444');
    });

    it('should return brown for cafe', () => {
      component.category = 'cafe';
      expect(component.categoryColor).toBe('#78350f');
    });

    it('should return gray for default', () => {
      component.category = 'default';
      expect(component.categoryColor).toBe('#6b7280');
    });
  });

  describe('getCategoryFromType', () => {
    it('should map restaurant type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('restaurant')).toBe('restaurant');
      expect(LocationMarkerComponent.getCategoryFromType('food')).toBe('restaurant');
    });

    it('should map cafe type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('cafe')).toBe('cafe');
      expect(LocationMarkerComponent.getCategoryFromType('coffee')).toBe('cafe');
    });

    it('should map bar type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('bar')).toBe('bar');
      expect(LocationMarkerComponent.getCategoryFromType('pub')).toBe('bar');
      expect(LocationMarkerComponent.getCategoryFromType('nightclub')).toBe('bar');
    });

    it('should map park type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('park')).toBe('park');
      expect(LocationMarkerComponent.getCategoryFromType('garden')).toBe('park');
      expect(LocationMarkerComponent.getCategoryFromType('nature')).toBe('park');
    });

    it('should map museum type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('museum')).toBe('museum');
      expect(LocationMarkerComponent.getCategoryFromType('gallery')).toBe('museum');
      expect(LocationMarkerComponent.getCategoryFromType('art')).toBe('museum');
    });

    it('should map shopping type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('shop')).toBe('shopping');
      expect(LocationMarkerComponent.getCategoryFromType('store')).toBe('shopping');
      expect(LocationMarkerComponent.getCategoryFromType('mall')).toBe('shopping');
    });

    it('should map entertainment type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('entertainment')).toBe('entertainment');
      expect(LocationMarkerComponent.getCategoryFromType('cinema')).toBe('entertainment');
      expect(LocationMarkerComponent.getCategoryFromType('theater')).toBe('entertainment');
    });

    it('should map hotel type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('hotel')).toBe('hotel');
      expect(LocationMarkerComponent.getCategoryFromType('lodging')).toBe('hotel');
      expect(LocationMarkerComponent.getCategoryFromType('hostel')).toBe('hotel');
    });

    it('should return default for unknown type', () => {
      expect(LocationMarkerComponent.getCategoryFromType('unknown')).toBe('default');
    });

    it('should be case insensitive', () => {
      expect(LocationMarkerComponent.getCategoryFromType('RESTAURANT')).toBe('restaurant');
      expect(LocationMarkerComponent.getCategoryFromType('Cafe')).toBe('cafe');
    });
  });

  describe('inputs', () => {
    it('should accept rating input', () => {
      component.rating = 4.5;
      expect(component.rating).toBe(4.5);
    });

    it('should accept isOpen input', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });

    it('should accept selected input', () => {
      component.selected = true;
      expect(component.selected).toBe(true);
    });
  });

  describe('markerClick output', () => {
    it('should have markerClick emitter', () => {
      expect(component.markerClick).toBeDefined();
    });
  });
});
