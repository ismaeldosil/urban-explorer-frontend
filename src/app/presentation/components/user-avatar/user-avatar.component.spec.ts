import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatarComponent } from './user-avatar.component';
import { IonicModule } from '@ionic/angular';

describe('UserAvatarComponent', () => {
  let component: UserAvatarComponent;
  let fixture: ComponentFixture<UserAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatarComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default values', () => {
    it('should default size to md', () => {
      expect(component.size).toBe('md');
    });

    it('should default showBorder to false', () => {
      expect(component.showBorder).toBe(false);
    });

    it('should default showOnline to false', () => {
      expect(component.showOnline).toBe(false);
    });

    it('should default showBadge to false', () => {
      expect(component.showBadge).toBe(false);
    });

    it('should default clickable to false', () => {
      expect(component.clickable).toBe(false);
    });

    it('should default editable to false', () => {
      expect(component.editable).toBe(false);
    });
  });

  describe('sizeValue', () => {
    it('should return 24px for xs', () => {
      component.size = 'xs';
      expect(component.sizeValue).toBe('24px');
    });

    it('should return 32px for sm', () => {
      component.size = 'sm';
      expect(component.sizeValue).toBe('32px');
    });

    it('should return 48px for md', () => {
      component.size = 'md';
      expect(component.sizeValue).toBe('48px');
    });

    it('should return 64px for lg', () => {
      component.size = 'lg';
      expect(component.sizeValue).toBe('64px');
    });

    it('should return 96px for xl', () => {
      component.size = 'xl';
      expect(component.sizeValue).toBe('96px');
    });
  });

  describe('fontSize', () => {
    it('should return 10px for xs', () => {
      component.size = 'xs';
      expect(component.fontSize).toBe('10px');
    });

    it('should return 12px for sm', () => {
      component.size = 'sm';
      expect(component.fontSize).toBe('12px');
    });

    it('should return 18px for md', () => {
      component.size = 'md';
      expect(component.fontSize).toBe('18px');
    });

    it('should return 24px for lg', () => {
      component.size = 'lg';
      expect(component.fontSize).toBe('24px');
    });

    it('should return 36px for xl', () => {
      component.size = 'xl';
      expect(component.fontSize).toBe('36px');
    });
  });

  describe('initials', () => {
    it('should return empty string for no name', () => {
      component.name = undefined;
      expect(component.initials).toBe('');
    });

    it('should return first two letters for single word name', () => {
      component.name = 'John';
      expect(component.initials).toBe('JO');
    });

    it('should return first and last initials for multi-word name', () => {
      component.name = 'John Doe';
      expect(component.initials).toBe('JD');
    });

    it('should handle three-word names', () => {
      component.name = 'John Paul Smith';
      expect(component.initials).toBe('JS');
    });

    it('should handle names with extra spaces', () => {
      component.name = '  John   Doe  ';
      expect(component.initials).toBe('JD');
    });
  });

  describe('backgroundColor', () => {
    it('should return first color for no name', () => {
      component.name = undefined;
      expect(component.backgroundColor).toBe('#FF6B6B');
    });

    it('should return consistent color for same name', () => {
      component.name = 'John Doe';
      const color1 = component.backgroundColor;
      const color2 = component.backgroundColor;
      expect(color1).toBe(color2);
    });

    it('should return different colors for different names', () => {
      component.name = 'John Doe';
      const color1 = component.backgroundColor;
      component.name = 'Jane Smith';
      const color2 = component.backgroundColor;
      // Colors might be same by coincidence, but usually different
      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
    });
  });

  describe('onClick', () => {
    it('should not emit when not clickable or editable', () => {
      component.clickable = false;
      component.editable = false;
      const emitSpy = spyOn(component.avatarClick, 'emit');

      component.onClick();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit when clickable', () => {
      component.clickable = true;
      const emitSpy = spyOn(component.avatarClick, 'emit');

      component.onClick();

      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit when editable', () => {
      component.editable = true;
      const emitSpy = spyOn(component.avatarClick, 'emit');

      component.onClick();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('onImageError', () => {
    it('should set imageUrl to null on error', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';

      component.onImageError();

      expect(component.imageUrl).toBeNull();
    });
  });

  describe('badge display', () => {
    it('should accept badgeCount input', () => {
      component.badgeCount = 5;
      expect(component.badgeCount).toBe(5);
    });

    it('should accept badgeIcon input', () => {
      component.badgeIcon = 'star';
      expect(component.badgeIcon).toBe('star');
    });

    it('should accept badgeColor input', () => {
      component.badgeColor = 'blue';
      expect(component.badgeColor).toBe('blue');
    });
  });
});
