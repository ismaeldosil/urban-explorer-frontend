import { DomainError } from '../errors/domain-error';

export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    if (!email || !Email.isValid(email)) {
      throw new DomainError('Invalid email format', 'INVALID_EMAIL');
    }
    return new Email(email.toLowerCase().trim());
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
