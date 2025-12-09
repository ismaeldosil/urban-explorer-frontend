import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenStatusBadgeComponent, OpeningHours } from './open-status-badge.component';
import { IonicModule } from '@ionic/angular';

describe('OpenStatusBadgeComponent', () => {
  let component: OpenStatusBadgeComponent;
  let fixture: ComponentFixture<OpenStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenStatusBadgeComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(OpenStatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default status to unknown', () => {
      expect(component.status).toBe('unknown');
    });

    it('should default showIcon to true', () => {
      expect(component.showIcon).toBe(true);
    });

    it('should default showTime to false', () => {
      expect(component.showTime).toBe(false);
    });

    it('should default compact to false', () => {
      expect(component.compact).toBe(false);
    });
  });

  describe('statusIcon', () => {
    it('should return checkmark-circle for open', () => {
      component.status = 'open';
      expect(component.statusIcon).toBe('checkmark-circle');
    });

    it('should return close-circle for closed', () => {
      component.status = 'closed';
      expect(component.statusIcon).toBe('close-circle');
    });

    it('should return time for closing_soon', () => {
      component.status = 'closing_soon';
      expect(component.statusIcon).toBe('time');
    });

    it('should return time for opening_soon', () => {
      component.status = 'opening_soon';
      expect(component.statusIcon).toBe('time');
    });

    it('should return help-circle for unknown', () => {
      component.status = 'unknown';
      expect(component.statusIcon).toBe('help-circle');
    });
  });

  describe('statusText', () => {
    it('should return Abierto for open', () => {
      component.status = 'open';
      expect(component.statusText).toBe('Abierto');
    });

    it('should return Cerrado for closed', () => {
      component.status = 'closed';
      expect(component.statusText).toBe('Cerrado');
    });

    it('should return Cierra pronto for closing_soon', () => {
      component.status = 'closing_soon';
      expect(component.statusText).toBe('Cierra pronto');
    });

    it('should return Abre pronto for opening_soon', () => {
      component.status = 'opening_soon';
      expect(component.statusText).toBe('Abre pronto');
    });

    it('should return Sin info for unknown', () => {
      component.status = 'unknown';
      expect(component.statusText).toBe('Sin info');
    });
  });

  describe('timeText', () => {
    it('should return closing time text for closing_soon', () => {
      component.status = 'closing_soon';
      component.closingTime = '18:00';
      expect(component.timeText).toBe('· Cierra 18:00');
    });

    it('should return null for closing_soon without time', () => {
      component.status = 'closing_soon';
      component.closingTime = undefined;
      expect(component.timeText).toBeNull();
    });

    it('should return opening time text for opening_soon', () => {
      component.status = 'opening_soon';
      component.openingTime = '09:00';
      expect(component.timeText).toBe('· Abre 09:00');
    });

    it('should return null for opening_soon without time', () => {
      component.status = 'opening_soon';
      component.openingTime = undefined;
      expect(component.timeText).toBeNull();
    });

    it('should return closing time for open status', () => {
      component.status = 'open';
      component.closingTime = '22:00';
      expect(component.timeText).toBe('· Hasta 22:00');
    });

    it('should return opening time for closed status', () => {
      component.status = 'closed';
      component.openingTime = '10:00';
      expect(component.timeText).toBe('· Abre 10:00');
    });

    it('should return null for unknown status', () => {
      component.status = 'unknown';
      expect(component.timeText).toBeNull();
    });
  });

  describe('calculateStatus static method', () => {
    it('should return unknown for null hours', () => {
      const result = OpenStatusBadgeComponent.calculateStatus(null);
      expect(result.status).toBe('unknown');
    });

    it('should return unknown for empty hours', () => {
      const result = OpenStatusBadgeComponent.calculateStatus([]);
      expect(result.status).toBe('unknown');
    });

    it('should return closed when no hours for current day', () => {
      const hours: OpeningHours[] = [
        { day: 0, openTime: '09:00', closeTime: '17:00' },
      ];
      // If current day is not Sunday (0)
      const wednesday = new Date('2024-03-13T12:00:00'); // Wednesday
      const result = OpenStatusBadgeComponent.calculateStatus(hours, wednesday);
      expect(result.status).toBe('closed');
    });

    it('should return closed before opening time', () => {
      const today = new Date();
      const hours: OpeningHours[] = [
        { day: today.getDay(), openTime: '09:00', closeTime: '17:00' },
      ];
      const earlyMorning = new Date(today);
      earlyMorning.setHours(7, 0, 0, 0);
      const result = OpenStatusBadgeComponent.calculateStatus(hours, earlyMorning);
      expect(result.status).toBe('closed');
      expect(result.openingTime).toBe('09:00');
    });

    it('should return opening_soon when close to opening time', () => {
      const today = new Date();
      const hours: OpeningHours[] = [
        { day: today.getDay(), openTime: '09:00', closeTime: '17:00' },
      ];
      const almostOpen = new Date(today);
      almostOpen.setHours(8, 45, 0, 0);
      const result = OpenStatusBadgeComponent.calculateStatus(hours, almostOpen);
      expect(result.status).toBe('opening_soon');
    });

    it('should return open during business hours', () => {
      const today = new Date();
      const hours: OpeningHours[] = [
        { day: today.getDay(), openTime: '09:00', closeTime: '17:00' },
      ];
      const midday = new Date(today);
      midday.setHours(12, 0, 0, 0);
      const result = OpenStatusBadgeComponent.calculateStatus(hours, midday);
      expect(result.status).toBe('open');
      expect(result.closingTime).toBe('17:00');
    });

    it('should return closing_soon when close to closing time', () => {
      const today = new Date();
      const hours: OpeningHours[] = [
        { day: today.getDay(), openTime: '09:00', closeTime: '17:00' },
      ];
      const almostClosed = new Date(today);
      almostClosed.setHours(16, 45, 0, 0);
      const result = OpenStatusBadgeComponent.calculateStatus(hours, almostClosed);
      expect(result.status).toBe('closing_soon');
    });

    it('should return closed after closing time', () => {
      const today = new Date();
      const hours: OpeningHours[] = [
        { day: today.getDay(), openTime: '09:00', closeTime: '17:00' },
      ];
      const evening = new Date(today);
      evening.setHours(19, 0, 0, 0);
      const result = OpenStatusBadgeComponent.calculateStatus(hours, evening);
      expect(result.status).toBe('closed');
    });
  });
});
