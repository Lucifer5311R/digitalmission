import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isRequired,
  isInRange,
} from '../../src/utils/validators';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.name@domain.co')).toBe(true);
    expect(isValidEmail('a@b.c')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @domain.com')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts passwords with 6 or more characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('abcdefgh')).toBe(true);
  });

  it('rejects passwords shorter than 6', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('abc')).toBe(false);
  });
});

describe('isRequired', () => {
  it('returns true for non-empty strings', () => {
    expect(isRequired('hello')).toBe(true);
    expect(isRequired('  hello  ')).toBe(true);
  });

  it('returns false for empty or whitespace-only strings', () => {
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
    expect(isRequired('\t')).toBe(false);
  });
});

describe('isInRange', () => {
  it('returns true when value is in range', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it('returns false when value is out of range', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
    expect(isInRange(-1, 0, 5)).toBe(false);
  });
});
