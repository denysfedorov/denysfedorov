import { coingecko } from './providers/coingecko.js';
import { coincap } from './providers/coincap.js';
import { coinpaprika } from './providers/coinpaprika.js';
import { binance } from './providers/binance.js';
import { CoinNotFoundError, NoPriceDataError } from '../types.js';
import type { PriceProvider } from './providers/types.js';

// Ordered by preference: CoinGecko first, then fallbacks
const providers: PriceProvider[] = [coingecko, coinpaprika, coincap, binance];

export async function getCurrentPrice(
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

      // Don't try other providers if the coin simply doesn't exist
      if (error instanceof CoinNotFoundError) throw error;

      // Continue to next provider for rate limits, network errors, etc.
    }
  }

  throw new Error(
    `All providers failed:\n${errors.map((e) => `  ${e.provider}: ${e.message}`).join('\n')}`,
  );
}

export async function getHistoricalPrice(
  coinId: string,
  targetTimestamp: number,
  currency: string,
): Promise<{ price: number; actualTimestamp: number; provider: string }> {
  const errors: { provider: string; message: string }[] = [];

  for (const provider of providers) {
    try {
      const result = await provider.getHistoricalPrice(
        coinId,
        targetTimestamp,
        currency,
      );
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

export { providers };
