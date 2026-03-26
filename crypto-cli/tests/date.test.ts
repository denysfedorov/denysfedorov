import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildCompareTimestamp, formatDateLabel } from '../src/utils/date.js';

describe('buildCompareTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set "now" to 2026-03-20 14:30:00 UTC
    vi.setSystemTime(new Date('2026-03-20T14:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a valid unix timestamp for a past date', () => {
    const ts = buildCompareTimestamp('2026-03-15');
    expect(ts).toBeTypeOf('number');
    expect(ts).toBeGreaterThan(0);
  });

  it('applies current time to the past date', () => {
    const ts = buildCompareTimestamp('2026-03-15');
    const date = new Date(ts * 1000);
    expect(date.getUTCHours()).toBe(14);
    expect(date.getUTCMinutes()).toBe(30);
  });

  it('applies explicit time with timezone offset', () => {
    const ts = buildCompareTimestamp('2026-03-15', '20:00+02:00');
    const date = new Date(ts * 1000);
    // 20:00 GMT+2 = 18:00 UTC
    expect(date.getUTCHours()).toBe(18);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('applies explicit UTC time', () => {
    const ts = buildCompareTimestamp('2026-03-15', '15:45Z');
    const date = new Date(ts * 1000);
    expect(date.getUTCHours()).toBe(15);
    expect(date.getUTCMinutes()).toBe(45);
  });

  it('applies plain time as UTC', () => {
    const ts = buildCompareTimestamp('2026-03-15', '09:00');
    const date = new Date(ts * 1000);
    expect(date.getUTCHours()).toBe(9);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('handles negative timezone offset', () => {
    const ts = buildCompareTimestamp('2026-03-15', '10:00-05:00');
    const date = new Date(ts * 1000);
    // 10:00 EST = 15:00 UTC
    expect(date.getUTCHours()).toBe(15);
    expect(date.getUTCMinutes()).toBe(0);
  });

  it('throws for invalid time format', () => {
    expect(() => buildCompareTimestamp('2026-03-15', 'abc')).toThrow(
      'Invalid time format',
    );
  });

  it('throws for future dates', () => {
    expect(() => buildCompareTimestamp('2026-12-01')).toThrow(
      'Date cannot be in the future',
    );
  });

  it("throws for today's date", () => {
    expect(() => buildCompareTimestamp('2026-03-20')).toThrow(
      "That's today",
    );
  });

  it('throws for invalid date format', () => {
    expect(() => buildCompareTimestamp('not-a-date')).toThrow(
      'Invalid date format',
    );
  });

  it('throws for non-zero-padded date', () => {
    expect(() => buildCompareTimestamp('2026-3-20')).toThrow(
      'Invalid date format',
    );
  });

  it('throws for invalid month', () => {
    expect(() => buildCompareTimestamp('2026-13-01')).toThrow(
      'Invalid date format',
    );
  });
});

describe('formatDateLabel', () => {
  it('formats a timestamp as a readable label', () => {
    const ts = 1710938400; // approx Mar 20, 2024 14:00 UTC
    const label = formatDateLabel(ts);
    expect(label).toContain('UTC');
    expect(label).toContain('2024');
  });
});
