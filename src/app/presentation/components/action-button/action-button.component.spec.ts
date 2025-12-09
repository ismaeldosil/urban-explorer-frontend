import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionButtonComponent, ActionButtonVariant, ActionButtonSize } from './action-button.component';
import { IonicModule } from '@ionic/angular';

describe('ActionButtonComponent', () => {
  let component: ActionButtonComponent;
  let fixture: ComponentFixture<ActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionButtonComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default variant to primary', () => {
      expect(component.variant).toBe('primary');
    });

    it('should default size to md', () => {
      expect(component.size).toBe('md');
    });

    it('should default iconPosition to start', () => {
      expect(component.iconPosition).toBe('start');
    });

    it('should default iconOnly to false', () => {
      expect(component.iconOnly).toBe(false);
    });

    it('should default fullWidth to false', () => {
      expect(component.fullWidth).toBe(false);
    });

    it('should default disabled to false', () => {
      expect(component.disabled).toBe(false);
    });

    it('should default loading to false', () => {
      expect(component.loading).toBe(false);
    });
  });

  describe('variantClass', () => {
    it('should return variant-primary for primary', () => {
      component.variant = 'primary';
      expect(component.variantClass).toBe('variant-primary');
    });

    it('should return variant-secondary for secondary', () => {
      component.variant = 'secondary';
      expect(component.variantClass).toBe('variant-secondary');
    });

    it('should return variant-outline for outline', () => {
      component.variant = 'outline';
      expect(component.variantClass).toBe('variant-outline');
    });

    it('should return variant-ghost for ghost', () => {
      component.variant = 'ghost';
      expect(component.variantClass).toBe('variant-ghost');
    });

    it('should return variant-danger for danger', () => {
      component.variant = 'danger';
      expect(component.variantClass).toBe('variant-danger');
    });
  });

  describe('sizeClass', () => {
    it('should return size-sm for sm', () => {
      component.size = 'sm';
      expect(component.sizeClass).toBe('size-sm');
    });

    it('should return size-md for md', () => {
      component.size = 'md';
      expect(component.sizeClass).toBe('size-md');
    });

    it('should return size-lg for lg', () => {
      component.size = 'lg';
      expect(component.sizeClass).toBe('size-lg');
    });
  });

  describe('handleClick', () => {
    it('should emit buttonClick when not disabled or loading', () => {
      const emitSpy = spyOn(component.buttonClick, 'emit');
      const mockEvent = new MouseEvent('click');

      component.handleClick(mockEvent);

      expect(emitSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should not emit buttonClick when disabled', () => {
      const emitSpy = spyOn(component.buttonClick, 'emit');
      const mockEvent = new MouseEvent('click');
      component.disabled = true;

      component.handleClick(mockEvent);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit buttonClick when loading', () => {
      const emitSpy = spyOn(component.buttonClick, 'emit');
      const mockEvent = new MouseEvent('click');
      component.loading = true;

      component.handleClick(mockEvent);

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('inputs', () => {
    it('should accept icon input', () => {
      component.icon = 'add';
      expect(component.icon).toBe('add');
    });

    it('should accept iconPosition end', () => {
      component.iconPosition = 'end';
      expect(component.iconPosition).toBe('end');
    });
  });

  describe('variant types', () => {
    it('should handle all variant types', () => {
      const variants: ActionButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger'];

      variants.forEach(variant => {
        component.variant = variant;
        expect(component.variantClass).toBe(`variant-${variant}`);
      });
    });
  });

  describe('size types', () => {
    it('should handle all size types', () => {
      const sizes: ActionButtonSize[] = ['sm', 'md', 'lg'];

      sizes.forEach(size => {
        component.size = size;
        expect(component.sizeClass).toBe(`size-${size}`);
      });
    });
  });
});
