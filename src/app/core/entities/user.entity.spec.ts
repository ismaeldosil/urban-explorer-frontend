import { UserEntity, UserProps } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { DomainError } from '../errors/domain-error';

describe('UserEntity', () => {
  const validEmail = Email.create('test@example.com');
  const now = new Date();

  const createValidProps = (overrides?: Partial<Omit<UserProps, 'email'> & { email?: Email }>) => ({
    id: 'user-1',
    email: validEmail,
    username: 'testuser',
    emailVerified: true,
    ...overrides,
  });

  describe('create', () => {
    it('should create a valid user entity', () => {
      const user = UserEntity.create(createValidProps());

      expect(user.id).toBe('user-1');
      expect(user.email).toBe(validEmail);
      expect(user.username).toBe('testuser');
      expect(user.emailVerified).toBe(true);
    });

    it('should set createdAt and updatedAt to current date if not provided', () => {
      const user = UserEntity.create(createValidProps());

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided createdAt and updatedAt dates', () => {
      const user = UserEntity.create(createValidProps({ createdAt: now, updatedAt: now }));

      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
    });
  });

  describe('username validation', () => {
    it('should throw error for username shorter than 3 characters', () => {
      expect(() => UserEntity.create(createValidProps({ username: 'ab' }))).toThrowError();
    });

    it('should throw error for empty username', () => {
      expect(() => UserEntity.create(createValidProps({ username: '' }))).toThrowError();
    });

    it('should accept username with exactly 3 characters', () => {
      const user = UserEntity.create(createValidProps({ username: 'abc' }));
      expect(user.username).toBe('abc');
    });

    it('should throw error for username longer than 20 characters', () => {
      const longUsername = 'a'.repeat(21);
      expect(() => UserEntity.create(createValidProps({ username: longUsername }))).toThrowError();
    });

    it('should accept username with exactly 20 characters', () => {
      const username = 'a'.repeat(20);
      const user = UserEntity.create(createValidProps({ username }));
      expect(user.username).toBe(username);
    });

    it('should throw error for username with invalid characters', () => {
      expect(() => UserEntity.create(createValidProps({ username: 'test user' }))).toThrowError();
      expect(() => UserEntity.create(createValidProps({ username: 'test@user' }))).toThrowError();
      expect(() => UserEntity.create(createValidProps({ username: 'test-user' }))).toThrowError();
      expect(() => UserEntity.create(createValidProps({ username: 'test.user' }))).toThrowError();
    });

    it('should accept username with letters, numbers, and underscores', () => {
      const user1 = UserEntity.create(createValidProps({ username: 'Test_User123' }));
      const user2 = UserEntity.create(createValidProps({ username: 'abc_123' }));
      const user3 = UserEntity.create(createValidProps({ username: 'ABC' }));
      const user4 = UserEntity.create(createValidProps({ username: '123abc' }));

      expect(user1.username).toBe('Test_User123');
      expect(user2.username).toBe('abc_123');
      expect(user3.username).toBe('ABC');
      expect(user4.username).toBe('123abc');
    });
  });

  describe('optional properties', () => {
    it('should handle undefined avatarUrl', () => {
      const user = UserEntity.create(createValidProps({ avatarUrl: undefined }));
      expect(user.avatarUrl).toBeUndefined();
    });

    it('should handle avatarUrl when provided', () => {
      const user = UserEntity.create(createValidProps({ avatarUrl: 'https://example.com/avatar.jpg' }));
      expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should handle undefined bio', () => {
      const user = UserEntity.create(createValidProps({ bio: undefined }));
      expect(user.bio).toBeUndefined();
    });

    it('should handle bio when provided', () => {
      const user = UserEntity.create(createValidProps({ bio: 'Hello, I am a test user' }));
      expect(user.bio).toBe('Hello, I am a test user');
    });

    it('should handle undefined location', () => {
      const user = UserEntity.create(createValidProps({ location: undefined }));
      expect(user.location).toBeUndefined();
    });

    it('should handle location when provided', () => {
      const user = UserEntity.create(createValidProps({ location: 'New York, USA' }));
      expect(user.location).toBe('New York, USA');
    });
  });

  describe('updateProfile', () => {
    it('should update username', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({ username: 'newusername' });

      expect(updatedUser.username).toBe('newusername');
      expect(user.username).toBe('testuser'); // Original unchanged
    });

    it('should update bio', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({ bio: 'New bio' });

      expect(updatedUser.bio).toBe('New bio');
    });

    it('should update location', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({ location: 'Los Angeles' });

      expect(updatedUser.location).toBe('Los Angeles');
    });

    it('should update avatarUrl', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({ avatarUrl: 'https://new-avatar.com/img.jpg' });

      expect(updatedUser.avatarUrl).toBe('https://new-avatar.com/img.jpg');
    });

    it('should update multiple fields at once', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({
        username: 'newuser',
        bio: 'New bio',
        location: 'New location',
        avatarUrl: 'https://new.com/avatar.jpg',
      });

      expect(updatedUser.username).toBe('newuser');
      expect(updatedUser.bio).toBe('New bio');
      expect(updatedUser.location).toBe('New location');
      expect(updatedUser.avatarUrl).toBe('https://new.com/avatar.jpg');
    });

    it('should update updatedAt timestamp', () => {
      const user = UserEntity.create(createValidProps({ createdAt: now, updatedAt: now }));
      const updatedUser = user.updateProfile({ bio: 'New bio' });

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it('should preserve other properties when updating', () => {
      const user = UserEntity.create(createValidProps({
        bio: 'Original bio',
        location: 'Original location',
        avatarUrl: 'https://original.com/avatar.jpg',
      }));

      const updatedUser = user.updateProfile({ bio: 'New bio' });

      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.location).toBe('Original location');
      expect(updatedUser.avatarUrl).toBe('https://original.com/avatar.jpg');
    });

    it('should return a new UserEntity instance', () => {
      const user = UserEntity.create(createValidProps());
      const updatedUser = user.updateProfile({ bio: 'New bio' });

      expect(updatedUser).not.toBe(user);
    });

    it('should throw error if new username is invalid', () => {
      const user = UserEntity.create(createValidProps());
      expect(() => user.updateProfile({ username: 'ab' })).toThrowError();
    });
  });

  describe('getInitials', () => {
    it('should return first two characters of username in uppercase', () => {
      const user = UserEntity.create(createValidProps({ username: 'testuser' }));
      expect(user.getInitials()).toBe('TE');
    });

    it('should work with short username', () => {
      const user = UserEntity.create(createValidProps({ username: 'abc' }));
      expect(user.getInitials()).toBe('AB');
    });

    it('should handle mixed case username', () => {
      const user = UserEntity.create(createValidProps({ username: 'JohnDoe' }));
      expect(user.getInitials()).toBe('JO');
    });

    it('should handle numeric username', () => {
      const user = UserEntity.create(createValidProps({ username: '123user' }));
      expect(user.getInitials()).toBe('12');
    });
  });
});
