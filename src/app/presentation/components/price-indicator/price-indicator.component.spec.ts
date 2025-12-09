import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceIndicatorComponent, PriceLevel } from './price-indicator.component';
import { IonicModule } from '@ionic/angular';

describe('PriceIndicatorComponent', () => {
  let component: PriceIndicatorComponent;
  let fixture: ComponentFixture<PriceIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceIndicatorComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default level to 2', () => {
      expect(component.level).toBe(2);
    });

    it('should default maxLevel to 4', () => {
      expect(component.maxLevel).toBe(4);
    });

    it('should default symbol to $', () => {
      expect(component.symbol).toBe('$');
    });

    it('should default size to md', () => {
      expect(component.size).toBe('md');
    });

    it('should default showLabel to false', () => {
      expect(component.showLabel).toBe(false);
    });
  });

  describe('priceSymbols', () => {
    it('should return array of numbers from 1 to maxLevel', () => {
      component.maxLevel = 4;
      expect(component.priceSymbols).toEqual([1, 2, 3, 4]);
    });

    it('should respect custom maxLevel', () => {
      component.maxLevel = 3;
      expect(component.priceSymbols).toEqual([1, 2, 3]);
    });
  });

  describe('sizeClass', () => {
    it('should return size-sm for sm size', () => {
      component.size = 'sm';
      expect(component.sizeClass).toBe('size-sm');
    });

    it('should return size-md for md size', () => {
      component.size = 'md';
      expect(component.sizeClass).toBe('size-md');
    });

    it('should return size-lg for lg size', () => {
      component.size = 'lg';
      expect(component.sizeClass).toBe('size-lg');
    });
  });

  describe('priceLabel', () => {
    it('should return Económico for level 1', () => {
      component.level = 1;
      expect(component.priceLabel).toBe('Económico');
    });

    it('should return Moderado for level 2', () => {
      component.level = 2;
      expect(component.priceLabel).toBe('Moderado');
    });

    it('should return Costoso for level 3', () => {
      component.level = 3;
      expect(component.priceLabel).toBe('Costoso');
    });

    it('should return Muy costoso for level 4', () => {
      component.level = 4;
      expect(component.priceLabel).toBe('Muy costoso');
    });
  });

  describe('fromAmount static method', () => {
    it('should return 1 for USD amounts less than 15', () => {
      expect(PriceIndicatorComponent.fromAmount(10, 'USD')).toBe(1);
      expect(PriceIndicatorComponent.fromAmount(14.99, 'USD')).toBe(1);
    });

    it('should return 2 for USD amounts between 15 and 30', () => {
      expect(PriceIndicatorComponent.fromAmount(15, 'USD')).toBe(2);
      expect(PriceIndicatorComponent.fromAmount(25, 'USD')).toBe(2);
    });

    it('should return 3 for USD amounts between 30 and 60', () => {
      expect(PriceIndicatorComponent.fromAmount(30, 'USD')).toBe(3);
      expect(PriceIndicatorComponent.fromAmount(50, 'USD')).toBe(3);
    });

    it('should return 4 for USD amounts 60 and above', () => {
      expect(PriceIndicatorComponent.fromAmount(60, 'USD')).toBe(4);
      expect(PriceIndicatorComponent.fromAmount(100, 'USD')).toBe(4);
    });

    it('should use default thresholds for non-USD currency', () => {
      expect(PriceIndicatorComponent.fromAmount(400, 'EUR')).toBe(1);
      expect(PriceIndicatorComponent.fromAmount(800, 'EUR')).toBe(2);
      expect(PriceIndicatorComponent.fromAmount(1500, 'EUR')).toBe(3);
      expect(PriceIndicatorComponent.fromAmount(3000, 'EUR')).toBe(4);
    });
  });
});
