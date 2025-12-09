import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityItemComponent, ActivityUser, ActivityLocation } from './activity-item.component';
import { IonicModule } from '@ionic/angular';

describe('ActivityItemComponent', () => {
  let component: ActivityItemComponent;
  let fixture: ComponentFixture<ActivityItemComponent>;

  const mockUser: ActivityUser = {
    id: 'user-1',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockLocation: ActivityLocation = {
    id: 'loc-1',
    name: 'Test Restaurant',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityItemComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default type to review', () => {
      expect(component.type).toBe('review');
    });
  });

  describe('getActivityText', () => {
    it('should return review text for review type', () => {
      component.type = 'review';
      expect(component.getActivityText()).toBe('dejó una reseña en');
    });

    it('should return favorite text for favorite type', () => {
      component.type = 'favorite';
      expect(component.getActivityText()).toBe('agregó a favoritos');
    });
  });

  describe('getActivityIcon', () => {
    it('should return chatbox icon for review type', () => {
      component.type = 'review';
      expect(component.getActivityIcon()).toBe('chatbox-outline');
    });

    it('should return heart icon for favorite type', () => {
      component.type = 'favorite';
      expect(component.getActivityIcon()).toBe('heart-outline');
    });
  });

  describe('formatDate', () => {
    it('should return empty string for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('');
    });

    it('should return "Hace un momento" for recent dates', () => {
      const now = new Date();
      expect(component.formatDate(now)).toBe('Hace un momento');
    });

    it('should return minutes for dates less than an hour ago', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(component.formatDate(tenMinutesAgo)).toBe('Hace 10 minutos');
    });

    it('should return "Hace 1 minuto" for singular minute', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      expect(component.formatDate(oneMinuteAgo)).toBe('Hace 1 minuto');
    });

    it('should return hours for dates less than a day ago', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
      expect(component.formatDate(fiveHoursAgo)).toBe('Hace 5 horas');
    });

    it('should return "Hace 1 hora" for singular hour', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(component.formatDate(oneHourAgo)).toBe('Hace 1 hora');
    });

    it('should return days for dates less than a week ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(component.formatDate(threeDaysAgo)).toBe('Hace 3 días');
    });

    it('should return "Hace 1 día" for singular day', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(component.formatDate(oneDayAgo)).toBe('Hace 1 día');
    });

    it('should return formatted date for older dates', () => {
      const oldDate = new Date('2023-01-15');
      const result = component.formatDate(oldDate);
      expect(result).toContain('2023');
    });

    it('should handle string dates', () => {
      const dateString = new Date().toISOString();
      expect(component.formatDate(dateString)).toBe('Hace un momento');
    });
  });

  describe('inputs', () => {
    it('should accept user input', () => {
      component.user = mockUser;
      expect(component.user).toEqual(mockUser);
    });

    it('should accept location input', () => {
      component.location = mockLocation;
      expect(component.location).toEqual(mockLocation);
    });

    it('should accept date input', () => {
      const date = new Date();
      component.date = date;
      expect(component.date).toEqual(date);
    });
  });
});
