import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  getElapsedTime,
  padZero,
} from '../../src/utils/formatters';

describe('formatDuration', () => {
  it('returns "0m" for null', () => {
    expect(formatDuration(null)).toBe('0m');
  });

  it('returns "0m" for 0', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('returns minutes only when less than 60', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('returns hours only when minutes are 0', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('returns hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });

  it('handles large values', () => {
    expect(formatDuration(600)).toBe('10h');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('formatTime', () => {
  it('formats a time string with hours and minutes', () => {
    const result = formatTime('2024-01-15T14:30:00Z');
    // Result depends on locale, but should contain digits and colon
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDateTime', () => {
  it('combines date and time formatting', () => {
    const result = formatDateTime('2024-01-15T14:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent times', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(date)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(date)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const date = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(formatRelativeTime(date)).toBe('2d ago');
  });

  it('returns formatted date for older than 7 days', () => {
    const date = new Date(Date.now() - 10 * 86400000).toISOString();
    const result = formatRelativeTime(date);
    // Should fall back to formatDate
    expect(result).not.toContain('ago');
  });
});

describe('getElapsedTime', () => {
  it('returns hours, minutes, seconds', () => {
    const startTime = new Date(Date.now() - 3661000).toISOString(); // 1h 1m 1s ago
    const { hours, minutes, seconds } = getElapsedTime(startTime);
    expect(hours).toBe(1);
    expect(minutes).toBe(1);
    expect(seconds).toBeGreaterThanOrEqual(0);
  });

  it('returns 0s for just now', () => {
    const startTime = new Date().toISOString();
    const { hours, minutes, seconds } = getElapsedTime(startTime);
    expect(hours).toBe(0);
    expect(minutes).toBe(0);
    expect(seconds).toBeLessThanOrEqual(1);
  });
});

describe('padZero', () => {
  it('pads single digit with zero', () => {
    expect(padZero(5)).toBe('05');
  });

  it('does not pad double digits', () => {
    expect(padZero(12)).toBe('12');
  });

  it('pads zero', () => {
    expect(padZero(0)).toBe('00');
  });
});
