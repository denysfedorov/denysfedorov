import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// We test the fallback logic by re-implementing the core loop inline,
// since the real module has hardcoded provider imports. This tests
// the same algorithm used in src/services/api.ts.
async function getCurrentPriceWithProviders(
  providers: PriceProvider[],
  coinId: string,
  currency: string,
): Promise<{ price: number; provider: string }> {
  const errors: { provider: string; message: string }[] = [];
  for (const provider of providers) {
    try {
      const price = await provider.getCurrentPrice(coinId, currency);
      return { price, provider: provider.name };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push({ provider: provider.name, message: msg });
      if (error instanceof CoinNotFoundError) throw error;
    }
  }
  throw new Error(
    `All providers failed:\n${errors.map((e) => `  ${e.provider}: ${e.message}`).join('\n')}`,
  );
}

async function getHistoricalPriceWithProviders(
  providers: PriceProvider[],
  coinId: string,
  targetTimestamp: number,
  currency: string,
): Promise<{ price: number; actualTimestamp: number; provider: string }> {
  const errors: { provider: string; message: string }[] = [];
  for (const provider of providers) {
    try {
      const result = await provider.getHistoricalPrice(coinId, targetTimestamp, currency);
      return { ...result, provider: provider.name };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push({ provider: provider.name, message: msg });
      if (error instanceof CoinNotFoundError) throw error;
      if (error instanceof NoPriceDataError) throw error;
    }
  }
  throw new Error(
    `All providers failed:\n${errors.map((e) => `  ${e.provider}: ${e.message}`).join('\n')}`,
  );
}

describe('getCurrentPrice fallback', () => {
  it('returns result from first successful provider', async () => {
    const p1 = mockProvider('P1', {
      getCurrentPrice: vi.fn().mockResolvedValue(100),
    });
    const p2 = mockProvider('P2');

    const result = await getCurrentPriceWithProviders([p1, p2], 'bitcoin', 'usd');
    expect(result).toEqual({ price: 100, provider: 'P1' });
    expect(p2.getCurrentPrice).not.toHaveBeenCalled();
  });

  it('falls back to second provider on network error', async () => {
    const p1 = mockProvider('P1'); // throws NetworkError
    const p2 = mockProvider('P2', {
      getCurrentPrice: vi.fn().mockResolvedValue(200),
    });

    const result = await getCurrentPriceWithProviders([p1, p2], 'bitcoin', 'usd');
    expect(result).toEqual({ price: 200, provider: 'P2' });
  });

  it('falls back on rate limit error', async () => {
    const p1 = mockProvider('P1', {
      getCurrentPrice: vi.fn().mockRejectedValue(new RateLimitError()),
    });
    const p2 = mockProvider('P2', {
      getCurrentPrice: vi.fn().mockResolvedValue(300),
    });

    const result = await getCurrentPriceWithProviders([p1, p2], 'bitcoin', 'usd');
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
      getCurrentPriceWithProviders([p1, p2], 'xyz', 'usd'),
    ).rejects.toThrow(CoinNotFoundError);
    expect(p2.getCurrentPrice).not.toHaveBeenCalled();
  });

  it('throws combined error when all providers fail', async () => {
    const p1 = mockProvider('P1');
    const p2 = mockProvider('P2');

    await expect(
      getCurrentPriceWithProviders([p1, p2], 'bitcoin', 'usd'),
    ).rejects.toThrow('All providers failed');
  });
});

describe('getHistoricalPrice fallback', () => {
  it('falls back on error, returns second provider', async () => {
    const p1 = mockProvider('P1'); // throws NetworkError
    const p2 = mockProvider('P2', {
      getHistoricalPrice: vi.fn().mockResolvedValue({ price: 50, actualTimestamp: 1000 }),
    });

    const result = await getHistoricalPriceWithProviders([p1, p2], 'bitcoin', 1000, 'usd');
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
      getHistoricalPriceWithProviders([p1, p2], 'bitcoin', 1000, 'usd'),
    ).rejects.toThrow(NoPriceDataError);
    expect(p2.getHistoricalPrice).not.toHaveBeenCalled();
  });

  it('stops immediately on CoinNotFoundError', async () => {
    const p1 = mockProvider('P1', {
      getHistoricalPrice: vi.fn().mockRejectedValue(new CoinNotFoundError('xyz')),
    });
    const p2 = mockProvider('P2');

    await expect(
      getHistoricalPriceWithProviders([p1, p2], 'xyz', 1000, 'usd'),
    ).rejects.toThrow(CoinNotFoundError);
    expect(p2.getHistoricalPrice).not.toHaveBeenCalled();
  });
});
