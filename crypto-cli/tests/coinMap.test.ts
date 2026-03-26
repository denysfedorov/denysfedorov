import { describe, it, expect } from 'vitest';
import {
  resolveCoinId,
  getSupportedSymbols,
  findClosestSymbol,
} from '../src/services/coinMap.js';

describe('resolveCoinId', () => {
  it('resolves btc to bitcoin', () => {
    expect(resolveCoinId('btc')).toBe('bitcoin');
  });

  it('is case insensitive', () => {
    expect(resolveCoinId('BTC')).toBe('bitcoin');
    expect(resolveCoinId('Eth')).toBe('ethereum');
  });

  it('returns null for unknown symbols', () => {
    expect(resolveCoinId('xyz')).toBeNull();
    expect(resolveCoinId('')).toBeNull();
  });

  it('resolves various coins', () => {
    expect(resolveCoinId('sol')).toBe('solana');
    expect(resolveCoinId('ada')).toBe('cardano');
    expect(resolveCoinId('doge')).toBe('dogecoin');
  });
});

describe('getSupportedSymbols', () => {
  it('returns a non-empty sorted array', () => {
    const symbols = getSupportedSymbols();
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols).toContain('btc');
    expect(symbols).toContain('eth');
    // Check sorted
    const sorted = [...symbols].sort();
    expect(symbols).toEqual(sorted);
  });
});

describe('findClosestSymbol', () => {
  it('finds prefix matches', () => {
    expect(findClosestSymbol('bt')).toBe('btc');
  });

  it('finds close misspellings', () => {
    expect(findClosestSymbol('btcc')).toBe('btc');
    expect(findClosestSymbol('ethh')).toBe('eth');
  });

  it('returns null for completely unrelated input', () => {
    expect(findClosestSymbol('zzzzzzz')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(findClosestSymbol('')).toBeNull();
    expect(findClosestSymbol('  ')).toBeNull();
  });
});
