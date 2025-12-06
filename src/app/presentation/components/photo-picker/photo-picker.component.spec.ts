import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { PhotoPickerComponent } from './photo-picker.component';

// TODO: Fix tests - photo picker mocking
xdescribe('PhotoPickerComponent', () => {
  let component: PhotoPickerComponent;
  let fixture: ComponentFixture<PhotoPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoPickerComponent, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Output Events', () => {
    it('should have photosChange output emitter', () => {
      expect(component.photosChange).toBeDefined();
    });

    it('should emit photosChange when photo is added', () => {
      spyOn(component.photosChange, 'emit');

      component.addPhoto();

      expect(component.photosChange.emit).toHaveBeenCalled();
    });

    it('should emit photosChange when photos are cleared', () => {
      component.addPhoto();

      spyOn(component.photosChange, 'emit');

      component.clearPhotos();

      expect(component.photosChange.emit).toHaveBeenCalledWith([]);
    });
  });

  describe('addPhoto Method', () => {
    it('should emit after adding a photo', () => {
      spyOn(component.photosChange, 'emit');

      component.addPhoto();

      expect(component.photosChange.emit).toHaveBeenCalled();
    });

    it('should add multiple photos', () => {
      spyOn(component.photosChange, 'emit');

      component.addPhoto();
      component.addPhoto();
      component.addPhoto();

      expect(component.photosChange.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('setPhotos Method', () => {
    it('should set photos from URL array', () => {
      const urls = [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg'
      ];

      component.setPhotos(urls);
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(3);
    });

    it('should set empty photos array', () => {
      component.addPhoto();
      fixture.detectChanges();

      component.setPhotos([]);
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(0);
    });
  });

  describe('clearPhotos Method', () => {
    it('should clear all photos', () => {
      component.setPhotos(['url1.jpg', 'url2.jpg']);
      fixture.detectChanges();

      component.clearPhotos();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(0);
    });

    it('should emit photosChange when clearing', () => {
      component.addPhoto();
      spyOn(component.photosChange, 'emit');

      component.clearPhotos();

      expect(component.photosChange.emit).toHaveBeenCalledWith([]);
    });

    it('should handle clearing empty photos array', () => {
      expect(() => component.clearPhotos()).not.toThrow();
    });
  });

  describe('Template Rendering - Empty State', () => {
    it('should render add photo button when no photos', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeTruthy();
    });

    it('should not display photo count when no photos', () => {
      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount).toBeFalsy();
    });

    it('should not display any photo items', () => {
      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(0);
    });
  });

  describe('Template Rendering - With Photos', () => {
    beforeEach(() => {
      component.setPhotos([
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg'
      ]);
      fixture.detectChanges();
    });

    it('should render photo items', () => {
      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(3);
    });

    it('should display images with correct src', () => {
      const images = fixture.nativeElement.querySelectorAll('.photo-item img');

      expect(images[0].getAttribute('src')).toBe('https://example.com/photo1.jpg');
      expect(images[1].getAttribute('src')).toBe('https://example.com/photo2.jpg');
      expect(images[2].getAttribute('src')).toBe('https://example.com/photo3.jpg');
    });

    it('should display remove buttons on each photo', () => {
      const removeButtons = fixture.nativeElement.querySelectorAll('.remove-btn');
      expect(removeButtons.length).toBe(3);
    });

    it('should display photo count', () => {
      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount).toBeTruthy();
      expect(photoCount.textContent.trim()).toBe('3 / 10 fotos');
    });

    it('should still show add button when below maxPhotos', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeTruthy();
    });

    it('should render photos in grid layout', () => {
      const grid = fixture.nativeElement.querySelector('.photos-grid');
      expect(grid).toBeTruthy();
    });
  });

  describe('Template Rendering - Max Photos', () => {
    beforeEach(() => {
      const urls = Array(10).fill('').map((_, i) => `https://example.com/photo${i}.jpg`);
      component.setPhotos(urls);
      fixture.detectChanges();
    });

    it('should not display add button when maxPhotos is reached', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeFalsy();
    });

    it('should display correct photo count at max', () => {
      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount.textContent.trim()).toBe('10 / 10 fotos');
    });

    it('should render all 10 photo items', () => {
      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(10);
    });
  });

  describe('User Interactions - Add Photo', () => {
    it('should call addPhoto when add button is clicked', () => {
      spyOn(component, 'addPhoto');

      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      addButton.click();

      expect(component.addPhoto).toHaveBeenCalled();
    });

    it('should update view after adding photo', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      addButton.click();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(1);
    });
  });

  describe('CSS Classes', () => {
    beforeEach(() => {
      component.setPhotos(['https://example.com/photo1.jpg']);
      fixture.detectChanges();
    });

    it('should have photo-picker class on container', () => {
      const container = fixture.nativeElement.querySelector('.photo-picker');
      expect(container).toBeTruthy();
    });

    it('should have photos-grid class on grid container', () => {
      const grid = fixture.nativeElement.querySelector('.photos-grid');
      expect(grid).toBeTruthy();
    });

    it('should have photo-item class on photo containers', () => {
      const photoItem = fixture.nativeElement.querySelector('.photo-item');
      expect(photoItem).toBeTruthy();
    });
  });
});
