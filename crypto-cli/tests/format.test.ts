import { describe, it, expect } from 'vitest';
import { formatPrice, calcDiff, formatDiff } from '../src/utils/format.js';

describe('formatPrice', () => {
  it('formats USD prices with $ symbol', () => {
    const result = formatPrice(67432.18, 'usd');
    expect(result).toBe('$67,432.18');
  });

  it('formats EUR prices', () => {
    const result = formatPrice(1234.56, 'eur');
    expect(result).toContain('1,234.56');
  });

  it('handles zero', () => {
    const result = formatPrice(0, 'usd');
    expect(result).toBe('$0.00');
  });
});

describe('calcDiff', () => {
  it('calculates upward difference', () => {
    const diff = calcDiff(100, 80);
    expect(diff.absolute).toBe(20);
    expect(diff.percent).toBe(25);
    expect(diff.direction).toBe('up');
  });

  it('calculates downward difference', () => {
    const diff = calcDiff(80, 100);
    expect(diff.absolute).toBe(-20);
    expect(diff.percent).toBe(-20);
    expect(diff.direction).toBe('down');
  });

  it('detects flat difference', () => {
    const diff = calcDiff(100, 100);
    expect(diff.absolute).toBe(0);
    expect(diff.percent).toBe(0);
    expect(diff.direction).toBe('flat');
  });
});

describe('formatDiff', () => {
  it('formats upward diff with arrow', () => {
    const diff = calcDiff(100, 80);
    const result = formatDiff(diff, 'usd');
    expect(result).toContain('+');
    expect(result).toContain('▲');
    expect(result).toContain('25.00%');
  });

  it('formats downward diff with arrow', () => {
    const diff = calcDiff(80, 100);
    const result = formatDiff(diff, 'usd');
    expect(result).toContain('-');
    expect(result).toContain('▼');
    expect(result).toContain('20.00%');
  });

  it('formats flat diff', () => {
    const diff = calcDiff(100, 100);
    const result = formatDiff(diff, 'usd');
    expect(result).toContain('─');
    expect(result).toContain('0.00%');
  });
});
