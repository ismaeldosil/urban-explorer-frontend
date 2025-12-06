import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { StatCardComponent } from './stat-card.component';

// TODO: Fix tests - Ionic card mocking
xdescribe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default icon', () => {
      expect(component.icon).toBe('stats-chart-outline');
    });

    it('should initialize with default value', () => {
      expect(component.value).toBe(0);
    });

    it('should initialize with default label', () => {
      expect(component.label).toBe('');
    });

    it('should initialize with default color', () => {
      expect(component.color).toBe('primary');
    });
  });

  describe('Input Properties', () => {
    it('should accept icon input', () => {
      component.icon = 'location-outline';
      expect(component.icon).toBe('location-outline');
    });

    it('should accept value input as number', () => {
      component.value = 42;
      expect(component.value).toBe(42);
    });

    it('should accept value input as string', () => {
      component.value = '100+';
      expect(component.value).toBe('100+');
    });

    it('should accept label input', () => {
      component.label = 'Total Locations';
      expect(component.label).toBe('Total Locations');
    });

    it('should accept color input - primary', () => {
      component.color = 'primary';
      expect(component.color).toBe('primary');
    });

    it('should accept color input - secondary', () => {
      component.color = 'secondary';
      expect(component.color).toBe('secondary');
    });

    it('should accept color input - success', () => {
      component.color = 'success';
      expect(component.color).toBe('success');
    });

    it('should accept color input - warning', () => {
      component.color = 'warning';
      expect(component.color).toBe('warning');
    });

    it('should accept color input - danger', () => {
      component.color = 'danger';
      expect(component.color).toBe('danger');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      component.icon = 'location-outline';
      component.value = 25;
      component.label = 'Locations';
      component.color = 'primary';
      fixture.detectChanges();
    });

    it('should render ion-card', () => {
      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card).toBeTruthy();
    });

    it('should render ion-card-content', () => {
      const cardContent = fixture.nativeElement.querySelector('ion-card-content');
      expect(cardContent).toBeTruthy();
    });

    it('should render icon container', () => {
      const iconContainer = fixture.nativeElement.querySelector('.icon-container');
      expect(iconContainer).toBeTruthy();
    });

    it('should render ion-icon with correct name', () => {
      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('location-outline');
    });

    it('should render stat value', () => {
      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue).toBeTruthy();
      expect(statValue.textContent).toBe('25');
    });

    it('should render stat label', () => {
      const statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel).toBeTruthy();
      expect(statLabel.textContent).toBe('Locations');
    });

    it('should render stat-info container', () => {
      const statInfo = fixture.nativeElement.querySelector('.stat-info');
      expect(statInfo).toBeTruthy();
    });

    it('should render stat-card-content container', () => {
      const content = fixture.nativeElement.querySelector('.stat-card-content');
      expect(content).toBeTruthy();
    });
  });

  describe('Color Variants - CSS Classes', () => {
    it('should apply primary color class', () => {
      component.color = 'primary';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--primary')).toBe(true);
    });

    it('should apply secondary color class', () => {
      component.color = 'secondary';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--secondary')).toBe(true);
    });

    it('should apply success color class', () => {
      component.color = 'success';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--success')).toBe(true);
    });

    it('should apply warning color class', () => {
      component.color = 'warning';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--warning')).toBe(true);
    });

    it('should apply danger color class', () => {
      component.color = 'danger';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--danger')).toBe(true);
    });

    it('should always have base stat-card class', () => {
      component.color = 'primary';
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card')).toBe(true);
    });

    it('should update class when color changes', () => {
      component.color = 'primary';
      fixture.detectChanges();

      let card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--primary')).toBe(true);

      component.color = 'danger';
      fixture.detectChanges();

      card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--danger')).toBe(true);
    });
  });

  describe('getIconBackground Method', () => {
    it('should return primary background color', () => {
      component.color = 'primary';
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-primary-rgb), 0.1)');
    });

    it('should return secondary background color', () => {
      component.color = 'secondary';
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-secondary-rgb), 0.1)');
    });

    it('should return success background color', () => {
      component.color = 'success';
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-success-rgb), 0.1)');
    });

    it('should return warning background color', () => {
      component.color = 'warning';
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-warning-rgb), 0.1)');
    });

    it('should return danger background color', () => {
      component.color = 'danger';
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-danger-rgb), 0.1)');
    });

    it('should default to primary for invalid color', () => {
      component.color = 'invalid' as any;
      expect(component.getIconBackground()).toBe('rgba(var(--ion-color-primary-rgb), 0.1)');
    });
  });

  describe('getIconColor Method', () => {
    it('should return primary icon color', () => {
      component.color = 'primary';
      expect(component.getIconColor()).toBe('var(--ion-color-primary)');
    });

    it('should return secondary icon color', () => {
      component.color = 'secondary';
      expect(component.getIconColor()).toBe('var(--ion-color-secondary)');
    });

    it('should return success icon color', () => {
      component.color = 'success';
      expect(component.getIconColor()).toBe('var(--ion-color-success)');
    });

    it('should return warning icon color', () => {
      component.color = 'warning';
      expect(component.getIconColor()).toBe('var(--ion-color-warning)');
    });

    it('should return danger icon color', () => {
      component.color = 'danger';
      expect(component.getIconColor()).toBe('var(--ion-color-danger)');
    });

    it('should default to primary for invalid color', () => {
      component.color = 'invalid' as any;
      expect(component.getIconColor()).toBe('var(--ion-color-primary)');
    });
  });

  describe('Icon Background Styling', () => {
    it('should apply background style to icon container', () => {
      component.color = 'primary';
      fixture.detectChanges();

      const iconContainer = fixture.nativeElement.querySelector('.icon-container');
      const style = iconContainer.getAttribute('style');

      expect(style).toContain('rgba(var(--ion-color-primary-rgb), 0.1)');
    });

    it('should update background when color changes', () => {
      component.color = 'success';
      fixture.detectChanges();

      const iconContainer = fixture.nativeElement.querySelector('.icon-container');
      const style = iconContainer.getAttribute('style');

      expect(style).toContain('rgba(var(--ion-color-success-rgb), 0.1)');
    });
  });

  describe('Icon Color Styling', () => {
    it('should apply color style to icon', () => {
      component.color = 'warning';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const style = icon.getAttribute('style');

      expect(style).toContain('var(--ion-color-warning)');
    });

    it('should update icon color when color changes', () => {
      component.color = 'danger';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const style = icon.getAttribute('style');

      expect(style).toContain('var(--ion-color-danger)');
    });
  });

  describe('Value Display', () => {
    it('should display numeric value', () => {
      component.value = 150;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('150');
    });

    it('should display string value', () => {
      component.value = '1.5K';
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('1.5K');
    });

    it('should display zero value', () => {
      component.value = 0;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('0');
    });

    it('should display negative value', () => {
      component.value = -5;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('-5');
    });

    it('should display large numbers', () => {
      component.value = 9999999;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('9999999');
    });

    it('should display formatted strings', () => {
      component.value = '99.9%';
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('99.9%');
    });

    it('should update when value changes', () => {
      component.value = 10;
      fixture.detectChanges();

      let statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('10');

      component.value = 20;
      fixture.detectChanges();

      statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('20');
    });
  });

  describe('Label Display', () => {
    it('should display label text', () => {
      component.label = 'Total Visits';
      fixture.detectChanges();

      const statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('Total Visits');
    });

    it('should display empty label', () => {
      component.label = '';
      fixture.detectChanges();

      const statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('');
    });

    it('should display long label text', () => {
      component.label = 'This is a very long label that might wrap';
      fixture.detectChanges();

      const statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('This is a very long label that might wrap');
    });

    it('should update when label changes', () => {
      component.label = 'First Label';
      fixture.detectChanges();

      let statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('First Label');

      component.label = 'Second Label';
      fixture.detectChanges();

      statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('Second Label');
    });
  });

  describe('Icon Display', () => {
    it('should display default icon', () => {
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('stats-chart-outline');
    });

    it('should display custom icon', () => {
      component.icon = 'heart-outline';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('heart-outline');
    });

    it('should update when icon changes', () => {
      component.icon = 'star-outline';
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('star-outline');

      component.icon = 'trophy-outline';
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('trophy-outline');
    });
  });

  describe('Complete Stat Card Examples', () => {
    it('should render locations stat card', () => {
      component.icon = 'location-outline';
      component.value = 42;
      component.label = 'Locations';
      component.color = 'primary';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const value = fixture.nativeElement.querySelector('.stat-value');
      const label = fixture.nativeElement.querySelector('.stat-label');
      const card = fixture.nativeElement.querySelector('ion-card');

      expect(icon.getAttribute('name')).toBe('location-outline');
      expect(value.textContent).toBe('42');
      expect(label.textContent).toBe('Locations');
      expect(card.classList.contains('stat-card--primary')).toBe(true);
    });

    it('should render reviews stat card', () => {
      component.icon = 'star';
      component.value = '4.8';
      component.label = 'Average Rating';
      component.color = 'warning';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const value = fixture.nativeElement.querySelector('.stat-value');
      const label = fixture.nativeElement.querySelector('.stat-label');
      const card = fixture.nativeElement.querySelector('ion-card');

      expect(icon.getAttribute('name')).toBe('star');
      expect(value.textContent).toBe('4.8');
      expect(label.textContent).toBe('Average Rating');
      expect(card.classList.contains('stat-card--warning')).toBe(true);
    });

    it('should render favorites stat card', () => {
      component.icon = 'heart';
      component.value = 15;
      component.label = 'Favorites';
      component.color = 'danger';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const value = fixture.nativeElement.querySelector('.stat-value');
      const label = fixture.nativeElement.querySelector('.stat-label');
      const card = fixture.nativeElement.querySelector('ion-card');

      expect(icon.getAttribute('name')).toBe('heart');
      expect(value.textContent).toBe('15');
      expect(label.textContent).toBe('Favorites');
      expect(card.classList.contains('stat-card--danger')).toBe(true);
    });
  });

  describe('OnPush Change Detection', () => {
    it('should update when value changes', () => {
      component.value = 10;
      fixture.detectChanges();

      let value = fixture.nativeElement.querySelector('.stat-value');
      expect(value.textContent).toBe('10');

      component.value = 50;
      fixture.detectChanges();

      value = fixture.nativeElement.querySelector('.stat-value');
      expect(value.textContent).toBe('50');
    });

    it('should update when label changes', () => {
      component.label = 'Label 1';
      fixture.detectChanges();

      let label = fixture.nativeElement.querySelector('.stat-label');
      expect(label.textContent).toBe('Label 1');

      component.label = 'Label 2';
      fixture.detectChanges();

      label = fixture.nativeElement.querySelector('.stat-label');
      expect(label.textContent).toBe('Label 2');
    });

    it('should update when icon changes', () => {
      component.icon = 'icon1';
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('icon1');

      component.icon = 'icon2';
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('icon2');
    });

    it('should update when color changes', () => {
      component.color = 'primary';
      fixture.detectChanges();

      let card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--primary')).toBe(true);

      component.color = 'success';
      fixture.detectChanges();

      card = fixture.nativeElement.querySelector('ion-card');
      expect(card.classList.contains('stat-card--success')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      component.value = '';
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('');
    });

    it('should handle decimal values', () => {
      component.value = 3.14159;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toContain('3.14159');
    });

    it('should handle special characters in label', () => {
      component.label = 'Rating (★)';
      fixture.detectChanges();

      const statLabel = fixture.nativeElement.querySelector('.stat-label');
      expect(statLabel.textContent).toBe('Rating (★)');
    });

    it('should handle emoji in value', () => {
      component.value = '🔥 100';
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe('🔥 100');
    });

    it('should handle very large string values', () => {
      const largeValue = 'A'.repeat(100);
      component.value = largeValue;
      fixture.detectChanges();

      const statValue = fixture.nativeElement.querySelector('.stat-value');
      expect(statValue.textContent).toBe(largeValue);
    });

    it('should handle undefined value gracefully', () => {
      component.value = undefined as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null value gracefully', () => {
      component.value = null as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('CSS Structure', () => {
    beforeEach(() => {
      component.icon = 'location-outline';
      component.value = 25;
      component.label = 'Locations';
      fixture.detectChanges();
    });

    it('should have stat-card class', () => {
      const card = fixture.nativeElement.querySelector('.stat-card');
      expect(card).toBeTruthy();
    });

    it('should have stat-card-content class', () => {
      const content = fixture.nativeElement.querySelector('.stat-card-content');
      expect(content).toBeTruthy();
    });

    it('should have icon-container class', () => {
      const container = fixture.nativeElement.querySelector('.icon-container');
      expect(container).toBeTruthy();
    });

    it('should have stat-info class', () => {
      const info = fixture.nativeElement.querySelector('.stat-info');
      expect(info).toBeTruthy();
    });

    it('should have stat-value class', () => {
      const value = fixture.nativeElement.querySelector('.stat-value');
      expect(value).toBeTruthy();
    });

    it('should have stat-label class', () => {
      const label = fixture.nativeElement.querySelector('.stat-label');
      expect(label).toBeTruthy();
    });
  });

  describe('Multiple Cards Rendering', () => {
    it('should maintain independence when multiple cards exist', () => {
      const fixture1 = TestBed.createComponent(StatCardComponent);
      const component1 = fixture1.componentInstance;
      component1.value = 100;
      component1.color = 'primary';
      fixture1.detectChanges();

      const fixture2 = TestBed.createComponent(StatCardComponent);
      const component2 = fixture2.componentInstance;
      component2.value = 200;
      component2.color = 'danger';
      fixture2.detectChanges();

      const value1 = fixture1.nativeElement.querySelector('.stat-value');
      const value2 = fixture2.nativeElement.querySelector('.stat-value');

      expect(value1.textContent).toBe('100');
      expect(value2.textContent).toBe('200');
    });
  });
});
