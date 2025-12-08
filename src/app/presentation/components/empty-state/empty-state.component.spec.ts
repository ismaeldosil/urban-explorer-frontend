import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { EmptyStateComponent } from './empty-state.component';

// TODO: Fix tests - Ionic component rendering
xdescribe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default icon', () => {
      expect(component.icon).toBe('information-circle-outline');
    });

    it('should initialize with empty title', () => {
      expect(component.title).toBe('');
    });

    it('should initialize with empty description', () => {
      expect(component.description).toBe('');
    });

    it('should initialize with undefined buttonText', () => {
      expect(component.buttonText).toBeUndefined();
    });

    it('should initialize with default buttonColor', () => {
      expect(component.buttonColor).toBe('primary');
    });
  });

  describe('Input Properties', () => {
    it('should accept icon input', () => {
      component.icon = 'search-outline';
      expect(component.icon).toBe('search-outline');
    });

    it('should accept title input', () => {
      component.title = 'No Results Found';
      expect(component.title).toBe('No Results Found');
    });

    it('should accept description input', () => {
      component.description = 'Try adjusting your search criteria';
      expect(component.description).toBe('Try adjusting your search criteria');
    });

    it('should accept buttonText input', () => {
      component.buttonText = 'Reset Filters';
      expect(component.buttonText).toBe('Reset Filters');
    });

    it('should accept buttonColor input', () => {
      component.buttonColor = 'secondary';
      expect(component.buttonColor).toBe('secondary');
    });

    it('should handle long title text', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines in the UI';
      component.title = longTitle;
      expect(component.title).toBe(longTitle);
    });

    it('should handle long description text', () => {
      const longDescription = 'This is a very long description that provides detailed information to the user about the empty state and what they can do next.';
      component.description = longDescription;
      expect(component.description).toBe(longDescription);
    });
  });

  describe('Output Events', () => {
    it('should have buttonClick output emitter', () => {
      expect(component.buttonClick).toBeDefined();
    });

    it('should emit buttonClick when onButtonClick is called', () => {
      spyOn(component.buttonClick, 'emit');

      component.onButtonClick();

      expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should emit void value', () => {
      spyOn(component.buttonClick, 'emit');

      component.onButtonClick();

      expect(component.buttonClick.emit).toHaveBeenCalledWith();
    });

    it('should emit event multiple times if called multiple times', () => {
      spyOn(component.buttonClick, 'emit');

      component.onButtonClick();
      component.onButtonClick();
      component.onButtonClick();

      expect(component.buttonClick.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Template Rendering - Basic Elements', () => {
    beforeEach(() => {
      component.icon = 'search-outline';
      component.title = 'No Results';
      component.description = 'Try a different search';
      fixture.detectChanges();
    });

    it('should render empty-state container', () => {
      const container = fixture.nativeElement.querySelector('.empty-state');
      expect(container).toBeTruthy();
    });

    it('should render empty-state-content', () => {
      const content = fixture.nativeElement.querySelector('.empty-state-content');
      expect(content).toBeTruthy();
    });

    it('should render icon-container', () => {
      const iconContainer = fixture.nativeElement.querySelector('.icon-container');
      expect(iconContainer).toBeTruthy();
    });

    it('should render ion-icon with correct name', () => {
      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('search-outline');
    });

    it('should render title element', () => {
      const title = fixture.nativeElement.querySelector('.title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('No Results');
    });

    it('should render description element', () => {
      const description = fixture.nativeElement.querySelector('.description');
      expect(description).toBeTruthy();
      expect(description.textContent).toBe('Try a different search');
    });

    it('should render title as h3 element', () => {
      const title = fixture.nativeElement.querySelector('h3.title');
      expect(title).toBeTruthy();
    });

    it('should render description as p element', () => {
      const description = fixture.nativeElement.querySelector('p.description');
      expect(description).toBeTruthy();
    });
  });

  describe('Template Rendering - Without Button', () => {
    beforeEach(() => {
      component.icon = 'folder-open-outline';
      component.title = 'No Items';
      component.description = 'There are no items to display';
      component.buttonText = undefined;
      fixture.detectChanges();
    });

    it('should not render button when buttonText is undefined', () => {
      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeFalsy();
    });

    it('should not render button when buttonText is empty string', () => {
      component.buttonText = '';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeFalsy();
    });

    it('should still render all other elements without button', () => {
      const icon = fixture.nativeElement.querySelector('ion-icon');
      const title = fixture.nativeElement.querySelector('.title');
      const description = fixture.nativeElement.querySelector('.description');

      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(description).toBeTruthy();
    });
  });

  describe('Template Rendering - With Button', () => {
    beforeEach(() => {
      component.icon = 'add-circle-outline';
      component.title = 'No Locations';
      component.description = 'Start exploring by adding your first location';
      component.buttonText = 'Add Location';
      component.buttonColor = 'primary';
      fixture.detectChanges();
    });

    it('should render button when buttonText is provided', () => {
      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeTruthy();
    });

    it('should display button text', () => {
      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.textContent.trim()).toBe('Add Location');
    });

    it('should apply button color', () => {
      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('primary');
    });

    it('should apply different button colors', () => {
      component.buttonColor = 'secondary';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('secondary');
    });

    it('should call onButtonClick when button is clicked', () => {
      spyOn(component, 'onButtonClick');

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();

      expect(component.onButtonClick).toHaveBeenCalled();
    });

    it('should emit buttonClick event when button is clicked', () => {
      spyOn(component.buttonClick, 'emit');

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();

      expect(component.buttonClick.emit).toHaveBeenCalled();
    });
  });

  describe('Icon Variations', () => {
    it('should render default icon', () => {
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('information-circle-outline');
    });

    it('should render search icon', () => {
      component.icon = 'search-outline';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('search-outline');
    });

    it('should render folder icon', () => {
      component.icon = 'folder-open-outline';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('folder-open-outline');
    });

    it('should render location icon', () => {
      component.icon = 'location-outline';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('location-outline');
    });

    it('should update icon when changed', () => {
      component.icon = 'heart-outline';
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('heart-outline');

      component.icon = 'star-outline';
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('star-outline');
    });
  });

  describe('Complete Empty State Scenarios', () => {
    it('should render "No Search Results" state', () => {
      component.icon = 'search-outline';
      component.title = 'No results found';
      component.description = 'Try adjusting your search or filters';
      component.buttonText = 'Clear Filters';
      component.buttonColor = 'primary';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const title = fixture.nativeElement.querySelector('.title');
      const description = fixture.nativeElement.querySelector('.description');
      const button = fixture.nativeElement.querySelector('ion-button');

      expect(icon.getAttribute('name')).toBe('search-outline');
      expect(title.textContent).toBe('No results found');
      expect(description.textContent).toBe('Try adjusting your search or filters');
      expect(button.textContent.trim()).toBe('Clear Filters');
    });

    it('should render "No Favorites" state', () => {
      component.icon = 'heart-outline';
      component.title = 'No favorites yet';
      component.description = 'Start saving your favorite locations';
      component.buttonText = 'Explore Locations';
      component.buttonColor = 'danger';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const title = fixture.nativeElement.querySelector('.title');
      const description = fixture.nativeElement.querySelector('.description');
      const button = fixture.nativeElement.querySelector('ion-button');

      expect(icon.getAttribute('name')).toBe('heart-outline');
      expect(title.textContent).toBe('No favorites yet');
      expect(description.textContent).toBe('Start saving your favorite locations');
      expect(button.textContent.trim()).toBe('Explore Locations');
      expect(button.getAttribute('color')).toBe('danger');
    });

    it('should render "Empty List" state without button', () => {
      component.icon = 'list-outline';
      component.title = 'Nothing here';
      component.description = 'This list is currently empty';
      fixture.detectChanges();

      const icon = fixture.nativeElement.querySelector('ion-icon');
      const title = fixture.nativeElement.querySelector('.title');
      const description = fixture.nativeElement.querySelector('.description');
      const button = fixture.nativeElement.querySelector('ion-button');

      expect(icon.getAttribute('name')).toBe('list-outline');
      expect(title.textContent).toBe('Nothing here');
      expect(description.textContent).toBe('This list is currently empty');
      expect(button).toBeFalsy();
    });
  });

  describe('CSS Classes', () => {
    beforeEach(() => {
      component.title = 'Test';
      component.description = 'Test Description';
      fixture.detectChanges();
    });

    it('should have empty-state class on container', () => {
      const container = fixture.nativeElement.querySelector('.empty-state');
      expect(container).toBeTruthy();
    });

    it('should have empty-state-content class', () => {
      const content = fixture.nativeElement.querySelector('.empty-state-content');
      expect(content).toBeTruthy();
    });

    it('should have icon-container class', () => {
      const iconContainer = fixture.nativeElement.querySelector('.icon-container');
      expect(iconContainer).toBeTruthy();
    });

    it('should have title class on h3', () => {
      const title = fixture.nativeElement.querySelector('.title');
      expect(title).toBeTruthy();
    });

    it('should have description class on p', () => {
      const description = fixture.nativeElement.querySelector('.description');
      expect(description).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      component.title = 'Test Title';
      component.description = 'Test Description';
      component.buttonText = 'Click Me';
      fixture.detectChanges();
    });

    it('should handle button click', () => {
      spyOn(component.buttonClick, 'emit');

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();

      expect(component.buttonClick.emit).toHaveBeenCalled();
    });

    it('should handle multiple button clicks', () => {
      spyOn(component.buttonClick, 'emit');

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();
      button.click();
      button.click();

      expect(component.buttonClick.emit).toHaveBeenCalledTimes(3);
    });

    it('should trigger onButtonClick method', () => {
      const spy = spyOn(component, 'onButtonClick');

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('OnPush Change Detection', () => {
    it('should update when icon changes', () => {
      component.icon = 'search-outline';
      fixture.detectChanges();

      let icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('search-outline');

      component.icon = 'heart-outline';
      fixture.detectChanges();

      icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon.getAttribute('name')).toBe('heart-outline');
    });

    it('should update when title changes', () => {
      component.title = 'First Title';
      fixture.detectChanges();

      let title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toBe('First Title');

      component.title = 'Second Title';
      fixture.detectChanges();

      title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toBe('Second Title');
    });

    it('should update when description changes', () => {
      component.description = 'First Description';
      fixture.detectChanges();

      let description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toBe('First Description');

      component.description = 'Second Description';
      fixture.detectChanges();

      description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toBe('Second Description');
    });

    it('should show button when buttonText is set', () => {
      component.buttonText = undefined;
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeFalsy();

      component.buttonText = 'Click Me';
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeTruthy();
    });

    it('should hide button when buttonText is unset', () => {
      component.buttonText = 'Click Me';
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeTruthy();

      component.buttonText = undefined;
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('ion-button');
      expect(button).toBeFalsy();
    });

    it('should update button color', () => {
      component.buttonText = 'Click Me';
      component.buttonColor = 'primary';
      fixture.detectChanges();

      let button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('primary');

      component.buttonColor = 'success';
      fixture.detectChanges();

      button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('success');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      component.title = '';
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toBe('');
    });

    it('should handle empty description', () => {
      component.description = '';
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toBe('');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      component.title = longTitle;
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toBe(longTitle);
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      component.description = longDescription;
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toBe(longDescription);
    });

    it('should handle special characters in title', () => {
      component.title = 'Title with <special> & "characters"';
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toContain('Title with');
    });

    it('should handle emoji in title', () => {
      component.title = 'No results 😔';
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.title');
      expect(title.textContent).toBe('No results 😔');
    });

    it('should handle emoji in description', () => {
      component.description = 'Try again 🔍';
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toBe('Try again 🔍');
    });

    it('should handle newlines in description', () => {
      component.description = 'Line 1\nLine 2';
      fixture.detectChanges();

      const description = fixture.nativeElement.querySelector('.description');
      expect(description.textContent).toContain('Line 1');
    });

    it('should handle undefined icon', () => {
      component.icon = undefined as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null title', () => {
      component.title = null as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle null description', () => {
      component.description = null as any;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Button Color Variants', () => {
    beforeEach(() => {
      component.buttonText = 'Action Button';
      fixture.detectChanges();
    });

    it('should apply primary color', () => {
      component.buttonColor = 'primary';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('primary');
    });

    it('should apply secondary color', () => {
      component.buttonColor = 'secondary';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('secondary');
    });

    it('should apply success color', () => {
      component.buttonColor = 'success';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('success');
    });

    it('should apply warning color', () => {
      component.buttonColor = 'warning';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('warning');
    });

    it('should apply danger color', () => {
      component.buttonColor = 'danger';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.getAttribute('color')).toBe('danger');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.icon = 'search-outline';
      component.title = 'No Results';
      component.description = 'Try a different search';
      component.buttonText = 'Clear Search';
      fixture.detectChanges();
    });

    it('should use semantic heading for title', () => {
      const heading = fixture.nativeElement.querySelector('h3.title');
      expect(heading).toBeTruthy();
    });

    it('should use paragraph for description', () => {
      const paragraph = fixture.nativeElement.querySelector('p.description');
      expect(paragraph).toBeTruthy();
    });

    it('should provide meaningful button text', () => {
      const button = fixture.nativeElement.querySelector('ion-button');
      expect(button.textContent.trim()).toBe('Clear Search');
    });

    it('should use ion-icon which supports accessibility', () => {
      const icon = fixture.nativeElement.querySelector('ion-icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('Multiple Instances', () => {
    it('should maintain independence between multiple instances', () => {
      const fixture1 = TestBed.createComponent(EmptyStateComponent);
      const component1 = fixture1.componentInstance;
      component1.title = 'Title 1';
      fixture1.detectChanges();

      const fixture2 = TestBed.createComponent(EmptyStateComponent);
      const component2 = fixture2.componentInstance;
      component2.title = 'Title 2';
      fixture2.detectChanges();

      const title1 = fixture1.nativeElement.querySelector('.title');
      const title2 = fixture2.nativeElement.querySelector('.title');

      expect(title1.textContent).toBe('Title 1');
      expect(title2.textContent).toBe('Title 2');
    });
  });

  describe('Integration with Parent Component', () => {
    it('should emit event that parent can handle', () => {
      component.buttonText = 'Test Button';
      fixture.detectChanges();

      let emittedValue: any;
      component.buttonClick.subscribe((value) => {
        emittedValue = value;
      });

      const button = fixture.nativeElement.querySelector('ion-button');
      button.click();

      expect(emittedValue).toBeUndefined(); // Emits void
    });
  });
});
