import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryChipComponent, CategoryChipData } from './category-chip.component';
import { IonicModule } from '@ionic/angular';

describe('CategoryChipComponent', () => {
  let component: CategoryChipComponent;
  let fixture: ComponentFixture<CategoryChipComponent>;

  const mockCategory: CategoryChipData = {
    id: 'restaurant',
    name: 'Restaurants',
    icon: 'restaurant-outline',
    color: '#FF5722',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryChipComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryChipComponent);
    component = fixture.componentInstance;
    component.category = mockCategory;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should have category input', () => {
      expect(component.category).toBe(mockCategory);
    });

    it('should default selected to false', () => {
      expect(component.selected).toBe(false);
    });

    it('should default iconOnly to false', () => {
      expect(component.iconOnly).toBe(false);
    });

    it('should default showCount to false', () => {
      expect(component.showCount).toBe(false);
    });

    it('should default size to medium', () => {
      expect(component.size).toBe('medium');
    });
  });

  describe('onChipClick', () => {
    it('should emit category on click', () => {
      const emitSpy = spyOn(component.chipClick, 'emit');

      component.onChipClick();

      expect(emitSpy).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe('defaultColor', () => {
    it('should have default color', () => {
      expect(component.defaultColor).toBe('var(--ion-color-primary)');
    });
  });

  describe('size variants', () => {
    it('should accept small size', () => {
      component.size = 'small';
      expect(component.size).toBe('small');
    });

    it('should accept medium size', () => {
      component.size = 'medium';
      expect(component.size).toBe('medium');
    });

    it('should accept large size', () => {
      component.size = 'large';
      expect(component.size).toBe('large');
    });
  });

  describe('category without color', () => {
    it('should work with category without custom color', () => {
      const categoryWithoutColor: CategoryChipData = {
        id: 'cafe',
        name: 'Cafes',
        icon: 'cafe-outline',
      };

      component.category = categoryWithoutColor;
      fixture.detectChanges();

      expect(component.category.color).toBeUndefined();
    });
  });
});
