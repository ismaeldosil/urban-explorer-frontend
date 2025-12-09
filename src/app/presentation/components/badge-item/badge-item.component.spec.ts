import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeItemComponent, Badge, BadgeRarity } from './badge-item.component';
import { IonicModule } from '@ionic/angular';

describe('BadgeItemComponent', () => {
  let component: BadgeItemComponent;
  let fixture: ComponentFixture<BadgeItemComponent>;

  const mockEarnedBadge: Badge = {
    id: 'badge-1',
    name: 'Explorer',
    description: 'Visited 10 places',
    icon: 'trophy',
    rarity: 'rare',
    earnedAt: new Date(),
  };

  const mockLockedBadge: Badge = {
    id: 'badge-2',
    name: 'Master Explorer',
    description: 'Visited 50 places',
    icon: 'trophy-outline',
    rarity: 'legendary',
    progress: 50,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeItemComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeItemComponent);
    component = fixture.componentInstance;
    component.badge = mockEarnedBadge;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default compact to false', () => {
      expect(component.compact).toBe(false);
    });
  });

  describe('onBadgeClick', () => {
    it('should emit badgeClick event with badge', () => {
      const emitSpy = spyOn(component.badgeClick, 'emit');

      component.onBadgeClick();

      expect(emitSpy).toHaveBeenCalledWith(mockEarnedBadge);
    });
  });

  describe('formatDate', () => {
    it('should return "hoy" for today', () => {
      expect(component.formatDate(new Date())).toBe('hoy');
    });

    it('should return "ayer" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(component.formatDate(yesterday)).toBe('ayer');
    });

    it('should return days for dates less than a week ago', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(component.formatDate(threeDaysAgo)).toBe('hace 3 días');
    });

    it('should return weeks for dates less than a month ago', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      expect(component.formatDate(twoWeeksAgo)).toBe('hace 2 semanas');
    });

    it('should return months for dates less than a year ago', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
      expect(component.formatDate(threeMonthsAgo)).toBe('hace 3 meses');
    });

    it('should return years for dates more than a year ago', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setDate(twoYearsAgo.getDate() - 730);
      expect(component.formatDate(twoYearsAgo)).toBe('hace 2 años');
    });
  });

  describe('badge inputs', () => {
    it('should accept earned badge', () => {
      component.badge = mockEarnedBadge;
      expect(component.badge.earnedAt).toBeDefined();
    });

    it('should accept locked badge with progress', () => {
      component.badge = mockLockedBadge;
      expect(component.badge.progress).toBe(50);
      expect(component.badge.earnedAt).toBeUndefined();
    });

    it('should handle different rarity levels', () => {
      const rarities: BadgeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

      rarities.forEach(rarity => {
        component.badge = { ...mockEarnedBadge, rarity };
        expect(component.badge.rarity).toBe(rarity);
      });
    });
  });

  describe('compact mode', () => {
    it('should accept compact input', () => {
      component.compact = true;
      expect(component.compact).toBe(true);
    });
  });
});
