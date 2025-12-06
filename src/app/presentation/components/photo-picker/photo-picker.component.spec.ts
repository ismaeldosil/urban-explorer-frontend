import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { PhotoPickerComponent, PhotoItem } from './photo-picker.component';

describe('PhotoPickerComponent', () => {
  let component: PhotoPickerComponent;
  let fixture: ComponentFixture<PhotoPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoPickerComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoPickerComponent);
    component = fixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty photos signal', () => {
      expect(component['photos']()).toEqual([]);
    });

    it('should initialize maxPhotos to 10', () => {
      expect(component['maxPhotos']).toBe(10);
    });
  });

  describe('Output Events', () => {
    it('should have photosChange output emitter', () => {
      expect(component.photosChange).toBeDefined();
    });

    it('should emit photosChange when photo is added', () => {
      jest.spyOn(component.photosChange, 'emit');

      component.addPhoto();

      expect(component.photosChange.emit).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(String)])
      );
    });

    it('should emit photosChange when photo is removed', () => {
      component.addPhoto();
      const photoId = component['photos']()[0].id;

      jest.spyOn(component.photosChange, 'emit');

      component.removePhoto(photoId);

      expect(component.photosChange.emit).toHaveBeenCalledWith([]);
    });

    it('should emit correct photo URLs', () => {
      jest.spyOn(component.photosChange, 'emit');

      component.addPhoto();
      component.addPhoto();

      const photos = component['photos']();
      const expectedUrls = photos.map(p => p.url);

      expect(component.photosChange.emit).toHaveBeenCalledWith(expectedUrls);
    });

    it('should emit photosChange when photos are cleared', () => {
      component.addPhoto();
      component.addPhoto();

      jest.spyOn(component.photosChange, 'emit');

      component.clearPhotos();

      expect(component.photosChange.emit).toHaveBeenCalledWith([]);
    });
  });

  describe('addPhoto Method', () => {
    it('should add a photo to the photos signal', () => {
      component.addPhoto();

      expect(component['photos']().length).toBe(1);
    });

    it('should add multiple photos', () => {
      component.addPhoto();
      component.addPhoto();
      component.addPhoto();

      expect(component['photos']().length).toBe(3);
    });

    it('should not add photo when maxPhotos is reached', () => {
      // Add 10 photos (max)
      for (let i = 0; i < 10; i++) {
        component.addPhoto();
      }

      expect(component['photos']().length).toBe(10);

      // Try to add one more
      component.addPhoto();

      expect(component['photos']().length).toBe(10);
    });

    it('should create photo with unique ID', () => {
      component.addPhoto();
      component.addPhoto();

      const photos = component['photos']();
      expect(photos[0].id).not.toBe(photos[1].id);
    });

    it('should create photo with valid URL', () => {
      component.addPhoto();

      const photo = component['photos']()[0];
      expect(photo.url).toContain('https://via.placeholder.com');
    });

    it('should create photo with incremental placeholder number', () => {
      component.addPhoto();
      component.addPhoto();

      const photos = component['photos']();
      expect(photos[0].url).toContain('Photo+1');
      expect(photos[1].url).toContain('Photo+2');
    });

    it('should emit photosChange after adding photo', () => {
      jest.spyOn(component.photosChange, 'emit');

      component.addPhoto();

      expect(component.photosChange.emit).toHaveBeenCalled();
    });

    it('should not emit photosChange when maxPhotos is reached', () => {
      // Fill to max
      for (let i = 0; i < 10; i++) {
        component.addPhoto();
      }

      jest.spyOn(component.photosChange, 'emit');

      // Try to add one more
      component.addPhoto();

      expect(component.photosChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('removePhoto Method', () => {
    beforeEach(() => {
      component.addPhoto();
      component.addPhoto();
      component.addPhoto();
    });

    it('should remove photo by ID', () => {
      const photoId = component['photos']()[1].id;

      component.removePhoto(photoId);

      expect(component['photos']().length).toBe(2);
      expect(component['photos']().find(p => p.id === photoId)).toBeUndefined();
    });

    it('should remove first photo', () => {
      const firstPhotoId = component['photos']()[0].id;

      component.removePhoto(firstPhotoId);

      expect(component['photos']().length).toBe(2);
      expect(component['photos']()[0].id).not.toBe(firstPhotoId);
    });

    it('should remove last photo', () => {
      const lastPhotoId = component['photos']()[2].id;

      component.removePhoto(lastPhotoId);

      expect(component['photos']().length).toBe(2);
      expect(component['photos']().every(p => p.id !== lastPhotoId)).toBe(true);
    });

    it('should emit photosChange after removing photo', () => {
      const photoId = component['photos']()[0].id;
      jest.spyOn(component.photosChange, 'emit');

      component.removePhoto(photoId);

      expect(component.photosChange.emit).toHaveBeenCalled();
    });

    it('should handle removing non-existent photo ID', () => {
      const initialLength = component['photos']().length;

      component.removePhoto('non-existent-id');

      expect(component['photos']().length).toBe(initialLength);
    });

    it('should emit correct URLs after removal', () => {
      const photos = component['photos']();
      const photoIdToRemove = photos[1].id;
      const expectedUrls = photos.filter(p => p.id !== photoIdToRemove).map(p => p.url);

      jest.spyOn(component.photosChange, 'emit');

      component.removePhoto(photoIdToRemove);

      expect(component.photosChange.emit).toHaveBeenCalledWith(expectedUrls);
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

      expect(component['photos']().length).toBe(3);
      expect(component['photos']()[0].url).toBe(urls[0]);
      expect(component['photos']()[1].url).toBe(urls[1]);
      expect(component['photos']()[2].url).toBe(urls[2]);
    });

    it('should generate unique IDs for set photos', () => {
      const urls = ['url1.jpg', 'url2.jpg'];

      component.setPhotos(urls);

      const photos = component['photos']();
      expect(photos[0].id).not.toBe(photos[1].id);
    });

    it('should set empty photos array', () => {
      component.addPhoto();
      component.setPhotos([]);

      expect(component['photos']().length).toBe(0);
    });

    it('should replace existing photos', () => {
      component.addPhoto();
      component.addPhoto();

      const newUrls = ['https://new.com/photo1.jpg'];
      component.setPhotos(newUrls);

      expect(component['photos']().length).toBe(1);
      expect(component['photos']()[0].url).toBe(newUrls[0]);
    });

    it('should handle setting more than maxPhotos', () => {
      const urls = Array(15).fill('').map((_, i) => `https://example.com/photo${i}.jpg`);

      component.setPhotos(urls);

      expect(component['photos']().length).toBe(15);
    });
  });

  describe('clearPhotos Method', () => {
    it('should clear all photos', () => {
      component.addPhoto();
      component.addPhoto();
      component.addPhoto();

      component.clearPhotos();

      expect(component['photos']().length).toBe(0);
    });

    it('should emit photosChange when clearing', () => {
      component.addPhoto();
      jest.spyOn(component.photosChange, 'emit');

      component.clearPhotos();

      expect(component.photosChange.emit).toHaveBeenCalledWith([]);
    });

    it('should handle clearing empty photos array', () => {
      expect(() => component.clearPhotos()).not.toThrow();
      expect(component['photos']().length).toBe(0);
    });
  });

  describe('Template Rendering - Empty State', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render add photo button when no photos', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeTruthy();
    });

    it('should display camera icon in add button', () => {
      const icon = fixture.nativeElement.querySelector('.add-photo-btn ion-icon');
      expect(icon).toBeTruthy();
      expect(icon.getAttribute('name')).toBe('camera-outline');
    });

    it('should display "Agregar foto" text', () => {
      const button = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(button.textContent).toContain('Agregar foto');
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

    it('should display images with alt text', () => {
      const images = fixture.nativeElement.querySelectorAll('.photo-item img');
      const photos = component['photos']();

      images.forEach((img: HTMLImageElement, index: number) => {
        expect(img.getAttribute('alt')).toBe(`Photo ${photos[index].id}`);
      });
    });

    it('should display remove buttons on each photo', () => {
      const removeButtons = fixture.nativeElement.querySelectorAll('.remove-btn');
      expect(removeButtons.length).toBe(3);
    });

    it('should display close-circle icon on remove buttons', () => {
      const icons = fixture.nativeElement.querySelectorAll('.remove-btn ion-icon');

      icons.forEach((icon: HTMLElement) => {
        expect(icon.getAttribute('name')).toBe('close-circle');
      });
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

      const items = grid.querySelectorAll('.photo-item, .add-photo-btn');
      expect(items.length).toBe(4); // 3 photos + 1 add button
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

    it('should still show remove buttons at max capacity', () => {
      const removeButtons = fixture.nativeElement.querySelectorAll('.remove-btn');
      expect(removeButtons.length).toBe(10);
    });
  });

  describe('User Interactions - Add Photo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call addPhoto when add button is clicked', () => {
      jest.spyOn(component, 'addPhoto');

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

    it('should show photo count after adding first photo', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      addButton.click();
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount).toBeTruthy();
      expect(photoCount.textContent.trim()).toBe('1 / 10 fotos');
    });

    it('should add multiple photos sequentially', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');

      addButton.click();
      fixture.detectChanges();
      addButton.click();
      fixture.detectChanges();
      addButton.click();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(3);
    });
  });

  describe('User Interactions - Remove Photo', () => {
    beforeEach(() => {
      component.setPhotos([
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg'
      ]);
      fixture.detectChanges();
    });

    it('should call removePhoto when remove button is clicked', () => {
      jest.spyOn(component, 'removePhoto');

      const removeButton = fixture.nativeElement.querySelector('.remove-btn');
      removeButton.click();

      expect(component.removePhoto).toHaveBeenCalled();
    });

    it('should remove photo from view when remove button is clicked', () => {
      const removeButton = fixture.nativeElement.querySelector('.remove-btn');
      removeButton.click();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(2);
    });

    it('should update photo count after removing photo', () => {
      const removeButton = fixture.nativeElement.querySelector('.remove-btn');
      removeButton.click();
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount.textContent.trim()).toBe('2 / 10 fotos');
    });

    it('should show add button after removing photo from max', () => {
      const urls = Array(10).fill('').map((_, i) => `https://example.com/photo${i}.jpg`);
      component.setPhotos(urls);
      fixture.detectChanges();

      let addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeFalsy();

      const removeButton = fixture.nativeElement.querySelector('.remove-btn');
      removeButton.click();
      fixture.detectChanges();

      addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton).toBeTruthy();
    });

    it('should hide photo count when all photos are removed', () => {
      const removeButtons = fixture.nativeElement.querySelectorAll('.remove-btn');

      removeButtons[0].click();
      fixture.detectChanges();
      removeButtons[1].click();
      fixture.detectChanges();
      removeButtons[2].click();
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount).toBeFalsy();
    });
  });

  describe('Button Types', () => {
    beforeEach(() => {
      component.setPhotos(['https://example.com/photo1.jpg']);
      fixture.detectChanges();
    });

    it('should have type="button" on add photo button', () => {
      const addButton = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addButton.getAttribute('type')).toBe('button');
    });

    it('should have type="button" on remove buttons', () => {
      const removeButton = fixture.nativeElement.querySelector('.remove-btn');
      expect(removeButton.getAttribute('type')).toBe('button');
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

    it('should have remove-btn class on remove buttons', () => {
      const removeBtn = fixture.nativeElement.querySelector('.remove-btn');
      expect(removeBtn).toBeTruthy();
    });

    it('should have add-photo-btn class on add button', () => {
      const addBtn = fixture.nativeElement.querySelector('.add-photo-btn');
      expect(addBtn).toBeTruthy();
    });

    it('should have photo-count class on count display', () => {
      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount).toBeTruthy();
    });
  });

  describe('OnPush Change Detection', () => {
    it('should update view when signal changes', () => {
      fixture.detectChanges();

      component.addPhoto();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(1);
    });

    it('should react to signal updates from setPhotos', () => {
      fixture.detectChanges();

      component.setPhotos(['url1.jpg', 'url2.jpg']);
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(2);
    });

    it('should update immediately after clearPhotos', () => {
      component.setPhotos(['url1.jpg', 'url2.jpg']);
      fixture.detectChanges();

      component.clearPhotos();
      fixture.detectChanges();

      const photoItems = fixture.nativeElement.querySelectorAll('.photo-item');
      expect(photoItems.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid add operations', () => {
      for (let i = 0; i < 5; i++) {
        component.addPhoto();
      }

      expect(component['photos']().length).toBe(5);
    });

    it('should handle rapid remove operations', () => {
      component.setPhotos(['url1.jpg', 'url2.jpg', 'url3.jpg']);
      const photos = component['photos']();

      component.removePhoto(photos[0].id);
      component.removePhoto(photos[1].id);

      expect(component['photos']().length).toBe(1);
    });

    it('should handle setPhotos with duplicate URLs', () => {
      const urls = ['same.jpg', 'same.jpg', 'same.jpg'];
      component.setPhotos(urls);

      expect(component['photos']().length).toBe(3);
      expect(component['photos']().every(p => p.url === 'same.jpg')).toBe(true);
    });

    it('should handle empty string URLs', () => {
      component.setPhotos(['', '', '']);

      expect(component['photos']().length).toBe(3);
    });

    it('should handle very long URLs in setPhotos', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.jpg';
      component.setPhotos([longUrl]);

      expect(component['photos']()[0].url).toBe(longUrl);
    });

    it('should maintain photo order', () => {
      const urls = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
      component.setPhotos(urls);

      const photos = component['photos']();
      expect(photos[0].url).toBe('photo1.jpg');
      expect(photos[1].url).toBe('photo2.jpg');
      expect(photos[2].url).toBe('photo3.jpg');
    });

    it('should handle alternating add and remove', () => {
      component.addPhoto();
      component.addPhoto();

      const firstId = component['photos']()[0].id;
      component.removePhoto(firstId);

      component.addPhoto();

      expect(component['photos']().length).toBe(2);
    });
  });

  describe('Photo Count Display', () => {
    it('should show 1 / 10 for single photo', () => {
      component.setPhotos(['photo1.jpg']);
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount.textContent.trim()).toBe('1 / 10 fotos');
    });

    it('should show 5 / 10 for five photos', () => {
      component.setPhotos(['p1.jpg', 'p2.jpg', 'p3.jpg', 'p4.jpg', 'p5.jpg']);
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount.textContent.trim()).toBe('5 / 10 fotos');
    });

    it('should show 10 / 10 when full', () => {
      const urls = Array(10).fill('').map((_, i) => `photo${i}.jpg`);
      component.setPhotos(urls);
      fixture.detectChanges();

      const photoCount = fixture.nativeElement.querySelector('.photo-count');
      expect(photoCount.textContent.trim()).toBe('10 / 10 fotos');
    });
  });
});
