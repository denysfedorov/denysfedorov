import { describe, it, expect, vi } from 'vitest';
import { getCurrentPrice, getHistoricalPrice } from '../src/services/api.js';
import { CoinNotFoundError, NoPriceDataError, RateLimitError, NetworkError } from '../src/types.js';
import type { PriceProvider } from '../src/services/providers/types.js';

function mockProvider(name: string, overrides?: Partial<PriceProvider>): PriceProvider {
  return {
    name,
    getCurrentPrice: vi.fn().mockRejectedValue(new NetworkError()),
    getHistoricalPrice: vi.fn().mockRejectedValue(new NetworkError()),
    ...overrides,
  };
}

describe('getCurrentPrice fallback', () => {
  it('returns result from first successful provider', async () => {
    const p1 = mockProvider('P1', {
      getCurrentPrice: vi.fn().mockResolvedValue(100),
    });
    const p2 = mockProvider('P2');

    const result = await getCurrentPrice('bitcoin', 'usd', [p1, p2]);
    expect(result).toEqual({ price: 100, provider: 'P1' });
    expect(p2.getCurrentPrice).not.toHaveBeenCalled();
  });

  it('falls back to second provider on network error', async () => {
    const p1 = mockProvider('P1'); // throws NetworkError
    const p2 = mockProvider('P2', {
      getCurrentPrice: vi.fn().mockResolvedValue(200),
    });

    const result = await getCurrentPrice('bitcoin', 'usd', [p1, p2]);
    expect(result).toEqual({ price: 200, provider: 'P2' });
  });

  it('falls back on rate limit error', async () => {
    const p1 = mockProvider('P1', {
      getCurrentPrice: vi.fn().mockRejectedValue(new RateLimitError()),
    });
    const p2 = mockProvider('P2', {
      getCurrentPrice: vi.fn().mockResolvedValue(300),
    });

    const result = await getCurrentPrice('bitcoin', 'usd', [p1, p2]);
    expect(result).toEqual({ price: 300, provider: 'P2' });
  });

  it('stops immediately on CoinNotFoundError', async () => {
    const p1 = mockProvider('P1', {
      getCurrentPrice: vi.fn().mockRejectedValue(new CoinNotFoundError('xyz')),
    });
    const p2 = mockProvider('P2', {
      getCurrentPrice: vi.fn().mockResolvedValue(100),
    });

    await expect(
      getCurrentPrice('xyz', 'usd', [p1, p2]),
    ).rejects.toThrow(CoinNotFoundError);
    expect(p2.getCurrentPrice).not.toHaveBeenCalled();
  });

  it('throws combined error when all providers fail', async () => {
    const p1 = mockProvider('P1');
    const p2 = mockProvider('P2');

    await expect(
      getCurrentPrice('bitcoin', 'usd', [p1, p2]),
    ).rejects.toThrow('All providers failed');
  });
});

describe('getHistoricalPrice fallback', () => {
  it('falls back on error, returns second provider', async () => {
    const p1 = mockProvider('P1'); // throws NetworkError
    const p2 = mockProvider('P2', {
      getHistoricalPrice: vi.fn().mockResolvedValue({ price: 50, actualTimestamp: 1000 }),
    });

    const result = await getHistoricalPrice('bitcoin', 1000, 'usd', [p1, p2]);
    expect(result).toEqual({ price: 50, actualTimestamp: 1000, provider: 'P2' });
  });

  it('stops immediately on NoPriceDataError', async () => {
    const p1 = mockProvider('P1', {
      getHistoricalPrice: vi.fn().mockRejectedValue(new NoPriceDataError('bitcoin')),
    });
    const p2 = mockProvider('P2', {
      getHistoricalPrice: vi.fn().mockResolvedValue({ price: 50, actualTimestamp: 1000 }),
    });

    await expect(
      getHistoricalPrice('bitcoin', 1000, 'usd', [p1, p2]),
    ).rejects.toThrow(NoPriceDataError);
    expect(p2.getHistoricalPrice).not.toHaveBeenCalled();
  });

  it('stops immediately on CoinNotFoundError', async () => {
    const p1 = mockProvider('P1', {
      getHistoricalPrice: vi.fn().mockRejectedValue(new CoinNotFoundError('xyz')),
    });
    const p2 = mockProvider('P2');

    await expect(
      getHistoricalPrice('xyz', 1000, 'usd', [p1, p2]),
    ).rejects.toThrow(CoinNotFoundError);
    expect(p2.getHistoricalPrice).not.toHaveBeenCalled();
  });
});
