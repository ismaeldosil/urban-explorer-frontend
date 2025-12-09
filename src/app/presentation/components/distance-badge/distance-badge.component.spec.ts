import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistanceBadgeComponent } from './distance-badge.component';
import { IonicModule } from '@ionic/angular';

describe('DistanceBadgeComponent', () => {
  let component: DistanceBadgeComponent;
  let fixture: ComponentFixture<DistanceBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistanceBadgeComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(DistanceBadgeComponent);
    component = fixture.componentInstance;
    component.distanceKm = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formattedDistance', () => {
    it('should return empty string for null distance', () => {
      component.distanceKm = null as any;
      expect(component.formattedDistance).toBe('');
    });

    it('should return empty string for undefined distance', () => {
      component.distanceKm = undefined as any;
      expect(component.formattedDistance).toBe('');
    });

    it('should return meters for distances less than 0.1 km', () => {
      component.distanceKm = 0.05;
      expect(component.formattedDistance).toBe('50 m');
    });

    it('should return meters rounded to 50 for distances between 0.1 and 1 km', () => {
      component.distanceKm = 0.55;
      expect(component.formattedDistance).toBe('550 m');
    });

    it('should round to nearest 50 meters', () => {
      component.distanceKm = 0.320;
      expect(component.formattedDistance).toBe('300 m');
    });

    it('should return km with one decimal for distances between 1 and 10 km', () => {
      component.distanceKm = 5.5;
      expect(component.formattedDistance).toBe('5.5 km');
    });

    it('should return rounded km for distances 10 km and above', () => {
      component.distanceKm = 15.7;
      expect(component.formattedDistance).toBe('16 km');
    });

    it('should handle exactly 1 km', () => {
      component.distanceKm = 1;
      expect(component.formattedDistance).toBe('1.0 km');
    });

    it('should handle exactly 10 km', () => {
      component.distanceKm = 10;
      expect(component.formattedDistance).toBe('10 km');
    });
  });

  describe('showIcon', () => {
    it('should show icon by default', () => {
      expect(component.showIcon).toBe(true);
    });

    it('should respect showIcon input', () => {
      component.showIcon = false;
      expect(component.showIcon).toBe(false);
    });
  });

  describe('compact mode', () => {
    it('should not be compact by default', () => {
      expect(component.compact).toBe(false);
    });

    it('should respect compact input', () => {
      component.compact = true;
      expect(component.compact).toBe(true);
    });
  });
});
