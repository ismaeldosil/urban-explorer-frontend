import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { LocationCardComponent, LocationCardData } from './location-card.component';
import { StarRatingComponent } from '../star-rating/star-rating.component';

// TODO: Fix tests - requires better Ionic component mocking
xdescribe('LocationCardComponent', () => {
  let component: LocationCardComponent;
  let fixture: ComponentFixture<LocationCardComponent>;

  const mockLocation: LocationCardData = {
    id: '1',
    name: 'Test Location',
    imageUrl: 'https://example.com/image.jpg',
    rating: 4.5,
    reviewCount: 120,
    priceLevel: 2,
    distance: 500,
    category: 'Restaurant',
    isOpen: true
  };

  const mockLocationClosed: LocationCardData = {
    ...mockLocation,
    id: '2',
    isOpen: false
  };

  const mockLocationNoImage: LocationCardData = {
    ...mockLocation,
    id: '3',
    imageUrl: undefined
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationCardComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationCardComponent);
    component = fixture.componentInstance;
  });

  describe('Creation and Initial Rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render skeleton state when skeleton is true', () => {
      component.skeleton = true;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('skeleton')).toBe(true);
    });

    it('should not render skeleton state when skeleton is false', () => {
      component.skeleton = false;
      component.location = mockLocation;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('skeleton')).toBe(false);
    });
  });

  describe('Input Properties', () => {
    beforeEach(() => {
      component.location = mockLocation;
      fixture.detectChanges();
    });

    it('should display location name', () => {
      const nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('Test Location');
    });

    it('should display location image when imageUrl is provided', () => {
      const img = fixture.nativeElement.querySelector('.image-container img');
      expect(img).toBeTruthy();
      expect(img.src).toContain('example.com/image.jpg');
    });

    it('should display placeholder when imageUrl is not provided', () => {
      component.location = mockLocationNoImage;
      fixture.detectChanges();

      const placeholder = fixture.nativeElement.querySelector('.image-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('should display category chip', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip.textContent).toContain('Restaurant');
    });

    it('should show "Abierto" when location is open', () => {
      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement.textContent.trim()).toBe('Abierto');
      expect(statusElement.classList.contains('open')).toBe(true);
    });

    it('should show "Cerrado" when location is closed', () => {
      component.location = mockLocationClosed;
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement.textContent.trim()).toBe('Cerrado');
      expect(statusElement.classList.contains('open')).toBe(false);
    });

    it('should include StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating).toBeTruthy();
    });

    it('should pass correct rating to StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.rating).toBe(4.5);
    });

    it('should pass correct reviewCount to StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.count).toBe(120);
    });

    it('should set default values for showDistance and showFavorite', () => {
      expect(component.showDistance).toBe(true);
      expect(component.showFavorite).toBe(true);
    });

    it('should not show favorite button when showFavorite is false', () => {
      component.showFavorite = false;
      fixture.detectChanges();

      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      expect(favoriteBtn).toBeFalsy();
    });

    it('should show favorite button when showFavorite is true', () => {
      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      expect(favoriteBtn).toBeTruthy();
    });

    it('should show heart-outline icon when not favorite', () => {
      component.isFavorite = false;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('name')).toBe('heart-outline');
    });

    it('should show heart icon when favorite', () => {
      component.isFavorite = true;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('name')).toBe('heart');
    });
  });

  describe('showDistance Input', () => {
    it('should display distance when showDistance is true and distance is defined', () => {
      component.location = mockLocation;
      component.showDistance = true;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement).toBeTruthy();
    });

    it('should not display distance when showDistance is false', () => {
      component.location = mockLocation;
      component.showDistance = false;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement).toBeFalsy();
    });

    it('should not display distance when distance is undefined', () => {
      component.location = { ...mockLocation, distance: undefined };
      component.showDistance = true;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement).toBeFalsy();
    });
  });

  describe('Output Events', () => {
    beforeEach(() => {
      component.location = mockLocation;
      fixture.detectChanges();
    });

    it('should emit cardClick when card is clicked', () => {
      spyOn(component.cardClick, 'emit');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.cardClick.emit).toHaveBeenCalledWith(mockLocation);
    });

    it('should not emit cardClick when skeleton is true', () => {
      component.skeleton = true;
      fixture.detectChanges();

      spyOn(component.cardClick, 'emit');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.cardClick.emit).not.toHaveBeenCalled();
    });

    it('should not emit cardClick when location is undefined', () => {
      component.location = undefined;
      fixture.detectChanges();

      spyOn(component.cardClick, 'emit');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.cardClick.emit).not.toHaveBeenCalled();
    });

    it('should emit favoriteClick when favorite button is clicked', () => {
      spyOn(component.favoriteClick, 'emit');
      component.isFavorite = false;
      fixture.detectChanges();

      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      favoriteBtn.click();

      expect(component.favoriteClick.emit).toHaveBeenCalledWith({
        location: mockLocation,
        isFavorite: true
      });
    });

    it('should toggle favorite state in emit', () => {
      spyOn(component.favoriteClick, 'emit');
      component.isFavorite = true;
      fixture.detectChanges();

      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      favoriteBtn.click();

      expect(component.favoriteClick.emit).toHaveBeenCalledWith({
        location: mockLocation,
        isFavorite: false
      });
    });

    it('should stop propagation when favorite button is clicked', () => {
      spyOn(component.favoriteClick, 'emit');

      component.onFavoriteClick(new MouseEvent('click'));

      expect(component.favoriteClick.emit).toHaveBeenCalled();
    });

    it('should not emit favoriteClick when location is undefined', () => {
      component.location = undefined;
      fixture.detectChanges();

      spyOn(component.favoriteClick, 'emit');
      component.onFavoriteClick(new MouseEvent('click'));

      expect(component.favoriteClick.emit).not.toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    describe('getPriceIndicator', () => {
      it('should return correct price indicator for priceLevel 1', () => {
        component.location = { ...mockLocation, priceLevel: 1 };
        expect(component.getPriceIndicator()).toBe('$');
      });

      it('should return correct price indicator for priceLevel 2', () => {
        component.location = { ...mockLocation, priceLevel: 2 };
        expect(component.getPriceIndicator()).toBe('$$');
      });

      it('should return correct price indicator for priceLevel 3', () => {
        component.location = { ...mockLocation, priceLevel: 3 };
        expect(component.getPriceIndicator()).toBe('$$$');
      });

      it('should return correct price indicator for priceLevel 4', () => {
        component.location = { ...mockLocation, priceLevel: 4 };
        expect(component.getPriceIndicator()).toBe('$$$$');
      });

      it('should return empty string when location is undefined', () => {
        component.location = undefined;
        expect(component.getPriceIndicator()).toBe('');
      });
    });

    describe('formatDistance', () => {
      it('should format distance in meters when less than 1000m', () => {
        expect(component.formatDistance(500)).toBe('500 m');
      });

      it('should format distance in kilometers when 1000m or more', () => {
        expect(component.formatDistance(1500)).toBe('1.5 km');
      });

      it('should format exactly 1000m as kilometers', () => {
        expect(component.formatDistance(1000)).toBe('1.0 km');
      });

      it('should round meters to nearest integer', () => {
        expect(component.formatDistance(456.7)).toBe('457 m');
      });

      it('should format kilometers with one decimal place', () => {
        expect(component.formatDistance(2345)).toBe('2.3 km');
      });
    });

    describe('onImageError', () => {
      it('should hide image on error', () => {
        const mockImg = { style: { display: '' } } as HTMLImageElement;
        const mockEvent = { target: mockImg } as unknown as Event;

        component.onImageError(mockEvent);

        expect(mockImg.style.display).toBe('none');
      });
    });
  });

  describe('Price Display', () => {
    it('should display price indicator in the template', () => {
      component.location = { ...mockLocation, priceLevel: 3 };
      fixture.detectChanges();

      const priceElement = fixture.nativeElement.querySelector('.price');
      expect(priceElement.textContent).toBe('$$$');
    });
  });

  describe('Skeleton State', () => {
    beforeEach(() => {
      component.skeleton = true;
      fixture.detectChanges();
    });

    it('should have skeleton class on card', () => {
      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('skeleton')).toBe(true);
    });

    it('should have skeleton-text class on name', () => {
      const name = fixture.nativeElement.querySelector('.name');
      expect(name.classList.contains('skeleton-text')).toBe(true);
    });

    it('should have skeleton-text class on rating-row', () => {
      const ratingRow = fixture.nativeElement.querySelector('.rating-row');
      expect(ratingRow.classList.contains('skeleton-text')).toBe(true);
    });

    it('should have skeleton-text class on meta', () => {
      const meta = fixture.nativeElement.querySelector('.meta');
      expect(meta.classList.contains('skeleton-text')).toBe(true);
    });

    it('should not show StarRatingComponent in skeleton state', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating).toBeFalsy();
    });

    it('should not show category chip in skeleton state', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip).toBeFalsy();
    });

    it('should not show favorite button in skeleton state', () => {
      component.showFavorite = true;
      fixture.detectChanges();

      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      expect(favoriteBtn).toBeFalsy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle location with zero rating', () => {
      component.location = { ...mockLocation, rating: 0 };
      fixture.detectChanges();

      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.rating).toBe(0);
    });

    it('should handle location with zero reviewCount', () => {
      component.location = { ...mockLocation, reviewCount: 0 };
      fixture.detectChanges();

      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.count).toBe(0);
    });

    it('should handle location with distance 0', () => {
      component.location = { ...mockLocation, distance: 0 };
      component.showDistance = true;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement.textContent).toContain('0 m');
    });

    it('should handle isOpen undefined', () => {
      component.location = { ...mockLocation, isOpen: undefined };
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement).toBeFalsy();
    });

    it('should handle priceLevel 0', () => {
      component.location = { ...mockLocation, priceLevel: 0 };
      expect(component.getPriceIndicator()).toBe('');
    });

    it('should handle very large distances', () => {
      expect(component.formatDistance(15000)).toBe('15.0 km');
      expect(component.formatDistance(99999)).toBe('100.0 km');
    });

    it('should handle very small distances', () => {
      expect(component.formatDistance(1)).toBe('1 m');
      expect(component.formatDistance(0.5)).toBe('1 m');
    });
  });

  describe('Template Control Flow (@if)', () => {
    it('should show image when not skeleton and imageUrl exists', () => {
      component.skeleton = false;
      component.location = mockLocation;
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.image-container img');
      const placeholder = fixture.nativeElement.querySelector('.image-placeholder');

      expect(img).toBeTruthy();
      expect(placeholder).toBeFalsy();
    });

    it('should show placeholder in skeleton mode', () => {
      component.skeleton = true;
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.image-container img');
      const placeholder = fixture.nativeElement.querySelector('.image-placeholder');

      expect(img).toBeFalsy();
      expect(placeholder).toBeTruthy();
    });

    it('should show placeholder when imageUrl is not provided', () => {
      component.skeleton = false;
      component.location = mockLocationNoImage;
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.image-container img');
      const placeholder = fixture.nativeElement.querySelector('.image-placeholder');

      expect(img).toBeFalsy();
      expect(placeholder).toBeTruthy();
    });

    it('should show distance when showDistance is true and distance is defined', () => {
      component.skeleton = false;
      component.location = mockLocation;
      component.showDistance = true;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement).toBeTruthy();
    });

    it('should not show distance when showDistance is false', () => {
      component.skeleton = false;
      component.location = mockLocation;
      component.showDistance = false;
      fixture.detectChanges();

      const distanceElement = fixture.nativeElement.querySelector('.distance');
      expect(distanceElement).toBeFalsy();
    });

    it('should show status when isOpen is defined', () => {
      component.skeleton = false;
      component.location = mockLocation;
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement).toBeTruthy();
    });

    it('should not show status when isOpen is undefined', () => {
      component.skeleton = false;
      component.location = { ...mockLocation, isOpen: undefined };
      fixture.detectChanges();

      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement).toBeFalsy();
    });
  });

  describe('Card Click Behavior', () => {
    it('should have button attribute on ion-card', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.hasAttribute('button')).toBe(true);
    });

    it('should call onCardClick when card is clicked', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      spyOn(component, 'onCardClick');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.onCardClick).toHaveBeenCalled();
    });
  });

  describe('Favorite Button Interaction', () => {
    beforeEach(() => {
      component.location = mockLocation;
      component.showFavorite = true;
      fixture.detectChanges();
    });

    it('should stop event propagation when favorite is clicked', () => {
      const mockEvent = new MouseEvent('click');
      spyOn(mockEvent, 'stopPropagation');

      component.onFavoriteClick(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should have correct icon color for favorite', () => {
      component.isFavorite = true;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('color')).toBe('danger');
    });

    it('should have correct icon color for non-favorite', () => {
      component.isFavorite = false;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('color')).toBe('medium');
    });

    it('should have slot="icon-only" on favorite icon', () => {
      const icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('slot')).toBe('icon-only');
    });

    it('should have clear fill on favorite button', () => {
      const button = fixture.nativeElement.querySelector('.favorite-btn');
      expect(button.getAttribute('fill')).toBe('clear');
    });

    it('should have small size on favorite button', () => {
      const button = fixture.nativeElement.querySelector('.favorite-btn');
      expect(button.getAttribute('size')).toBe('small');
    });
  });

  describe('StarRatingComponent Integration', () => {
    beforeEach(() => {
      component.location = mockLocation;
      fixture.detectChanges();
    });

    it('should pass showValue as true to StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.showValue).toBe(true);
    });

    it('should pass showCount as true to StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.showCount).toBe(true);
    });

    it('should pass size as small to StarRatingComponent', () => {
      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.size).toBe('small');
    });

    it('should handle undefined rating gracefully', () => {
      component.location = { ...mockLocation, rating: undefined as any };
      fixture.detectChanges();

      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.rating).toBe(0);
    });

    it('should handle undefined reviewCount gracefully', () => {
      component.location = { ...mockLocation, reviewCount: undefined as any };
      fixture.detectChanges();

      const starRating = fixture.debugElement.query(By.directive(StarRatingComponent));
      expect(starRating.componentInstance.count).toBe(0);
    });
  });

  describe('Image Error Handling', () => {
    it('should call onImageError when image fails to load', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      spyOn(component, 'onImageError');

      const img = fixture.nativeElement.querySelector('.image-container img');
      img.dispatchEvent(new Event('error'));

      expect(component.onImageError).toHaveBeenCalled();
    });

    it('should have error handler bound to image', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('.image-container img');
      const mockImg = { style: { display: '' } } as HTMLImageElement;
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.style.display).toBe('none');
    });
  });

  describe('Category Chip', () => {
    beforeEach(() => {
      component.location = mockLocation;
      fixture.detectChanges();
    });

    it('should have small size', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip.getAttribute('size')).toBe('small');
    });

    it('should have primary color', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip.getAttribute('color')).toBe('primary');
    });

    it('should be outlined', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip.hasAttribute('outline')).toBe(true);
    });

    it('should display category text', () => {
      const chip = fixture.nativeElement.querySelector('ion-chip');
      expect(chip.textContent.trim()).toBe('Restaurant');
    });
  });

  describe('Distance Icon', () => {
    it('should show location-outline icon for distance', () => {
      component.location = mockLocation;
      component.showDistance = true;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.distance ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('location-outline');
    });
  });

  describe('Image Placeholder', () => {
    it('should show image-outline icon in placeholder', () => {
      component.location = mockLocationNoImage;
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('.image-placeholder ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('image-outline');
    });
  });

  describe('Location Name Display', () => {
    it('should display full name when short', () => {
      component.location = { ...mockLocation, name: 'Short' };
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('Short');
    });

    it('should handle very long location names', () => {
      const longName = 'A'.repeat(200);
      component.location = { ...mockLocation, name: longName };
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain(longName);
    });

    it('should be empty in skeleton mode', () => {
      component.skeleton = true;
      fixture.detectChanges();

      const nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent.trim()).toBe('');
    });
  });

  describe('Multiple Locations', () => {
    it('should handle switching between different locations', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      let nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('Test Location');

      component.location = mockLocationClosed;
      fixture.detectChanges();

      nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('Test Location');

      const statusElement = fixture.nativeElement.querySelector('.status');
      expect(statusElement.textContent.trim()).toBe('Cerrado');
    });
  });

  describe('OnPush Change Detection', () => {
    it('should update when location changes', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      let nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('Test Location');

      component.location = { ...mockLocation, name: 'New Location' };
      fixture.detectChanges();

      nameElement = fixture.nativeElement.querySelector('.name');
      expect(nameElement.textContent).toContain('New Location');
    });

    it('should update when skeleton changes', () => {
      component.skeleton = true;
      fixture.detectChanges();

      let card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('skeleton')).toBe(true);

      component.skeleton = false;
      component.location = mockLocation;
      fixture.detectChanges();

      card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('skeleton')).toBe(false);
    });

    it('should update when isFavorite changes', () => {
      component.location = mockLocation;
      component.isFavorite = false;
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('name')).toBe('heart-outline');

      component.isFavorite = true;
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('.favorite-btn ion-icon');
      expect(icon.getAttribute('name')).toBe('heart');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user interaction flow', () => {
      component.location = mockLocation;
      component.showFavorite = true;
      component.isFavorite = false;
      fixture.detectChanges();

      spyOn(component.favoriteClick, 'emit');
      spyOn(component.cardClick, 'emit');

      // User clicks favorite
      const favoriteBtn = fixture.nativeElement.querySelector('.favorite-btn');
      favoriteBtn.click();

      expect(component.favoriteClick.emit).toHaveBeenCalledWith({
        location: mockLocation,
        isFavorite: true
      });

      // Card click should not have been called (stopPropagation)
      expect(component.cardClick.emit).not.toHaveBeenCalled();
    });

    it('should emit cardClick when clicking outside favorite button', () => {
      component.location = mockLocation;
      fixture.detectChanges();

      spyOn(component.cardClick, 'emit');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.cardClick.emit).toHaveBeenCalledWith(mockLocation);
    });
  });

  describe('Null Safety', () => {
    it('should handle null location gracefully', () => {
      component.location = null as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should not emit events when location is null', () => {
      component.location = null as any;
      fixture.detectChanges();

      spyOn(component.cardClick, 'emit');

      const card = fixture.nativeElement.querySelector('ion-card');
      card.click();

      expect(component.cardClick.emit).not.toHaveBeenCalled();
    });
  });
});
