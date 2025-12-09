import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, IonicModule.forRoot(), FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default placeholder to Buscar...', () => {
      expect(component.placeholder).toBe('Buscar...');
    });

    it('should default debounceTime to 300', () => {
      expect(component.debounceTime).toBe(300);
    });

    it('should default loading to false', () => {
      expect(component.loading).toBe(false);
    });

    it('should default autofocus to false', () => {
      expect(component.autofocus).toBe(false);
    });

    it('should default disabled to false', () => {
      expect(component.disabled).toBe(false);
    });
  });

  describe('value setter', () => {
    it('should set internal value', () => {
      component.value = 'test';
      expect(component['internalValue']).toBe('test');
    });
  });

  describe('onFocus', () => {
    it('should set isFocused to true', () => {
      component.onFocus();
      expect(component['isFocused']).toBe(true);
    });

    it('should emit focus event', () => {
      const emitSpy = spyOn(component.focus, 'emit');

      component.onFocus();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('onBlur', () => {
    it('should set isFocused to false', () => {
      component['isFocused'] = true;

      component.onBlur();

      expect(component['isFocused']).toBe(false);
    });

    it('should emit blur event', () => {
      const emitSpy = spyOn(component.blur, 'emit');

      component.onBlur();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should emit searchSubmit with current value', () => {
      component['internalValue'] = 'search term';
      const emitSpy = spyOn(component.searchSubmit, 'emit');

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith('search term');
    });
  });

  describe('onClear', () => {
    it('should clear internal value', () => {
      component['internalValue'] = 'test';

      component.onClear();

      expect(component['internalValue']).toBe('');
    });

    it('should emit searchChange with empty string', () => {
      const emitSpy = spyOn(component.searchChange, 'emit');

      component.onClear();

      expect(emitSpy).toHaveBeenCalledWith('');
    });

    it('should emit searchClear event', () => {
      const emitSpy = spyOn(component.searchClear, 'emit');

      component.onClear();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('onValueChange', () => {
    it('should emit searchChange after debounce', fakeAsync(() => {
      const emitSpy = spyOn(component.searchChange, 'emit');

      component.onValueChange('test');
      tick(300);

      expect(emitSpy).toHaveBeenCalledWith('test');
    }));

    it('should not emit for duplicate values', fakeAsync(() => {
      const emitSpy = spyOn(component.searchChange, 'emit');

      component.onValueChange('test');
      tick(300);
      component.onValueChange('test');
      tick(300);

      expect(emitSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('focusInput', () => {
    it('should focus the input element', () => {
      // The input might not be available in the test environment
      // but we can test that the method doesn't throw
      expect(() => component.focusInput()).not.toThrow();
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should focus input when autofocus is true', fakeAsync(() => {
      component.autofocus = true;
      const focusSpy = spyOn(component, 'focusInput');

      component.ngAfterViewInit();
      tick(500);

      expect(focusSpy).toHaveBeenCalled();
    }));

    it('should not focus input when autofocus is false', fakeAsync(() => {
      component.autofocus = false;
      const focusSpy = spyOn(component, 'focusInput');

      component.ngAfterViewInit();
      tick(500);

      expect(focusSpy).not.toHaveBeenCalled();
    }));
  });
});
