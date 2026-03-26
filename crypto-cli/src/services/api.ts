import axios, { AxiosError } from 'axios';
import {
  RateLimitError,
  CoinNotFoundError,
  NetworkError,
  NoPriceDataError,
  ApiError,
} from '../types.js';

const BASE_URL = 'https://api.coingecko.com/api/v3';

function handleAxiosError(error: unknown, coinId?: string): never {
  if (error instanceof AxiosError) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || !error.response) {
      throw new NetworkError();
    }
    const status = error.response.status;
    if (status === 429) throw new RateLimitError();
    if (status === 404) throw new CoinNotFoundError(coinId ?? 'unknown');
    throw new ApiError(`CoinGecko API error (HTTP ${status}). Try again later.`, status);
  }
  throw error;
}

export async function getCurrentPrice(
  coinId: string,
  currency: string,
): Promise<number> {
  try {
    const response = await axios.get(`${BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: currency,
      },
    });

    const price = response.data?.[coinId]?.[currency];
    if (price === undefined) {
      throw new CoinNotFoundError(coinId);
    }

    return price;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    handleAxiosError(error, coinId);
  }
}

export async function getHistoricalPrice(
  coinId: string,
  targetTimestamp: number,
  currency: string,
): Promise<{ price: number; actualTimestamp: number }> {
  try {
    const response = await axios.get(
      `${BASE_URL}/coins/${coinId}/market_chart/range`,
      {
        params: {
          vs_currency: currency,
          from: targetTimestamp - 3600,
          to: targetTimestamp + 3600,
        },
      },
    );

    const prices: [number, number][] = response.data?.prices;
    if (!prices || prices.length === 0) {
      throw new NoPriceDataError(coinId);
    }

    const targetMs = targetTimestamp * 1000;
    let closest = prices[0];
    let closestDiff = Math.abs(prices[0][0] - targetMs);

    for (const point of prices) {
      const diff = Math.abs(point[0] - targetMs);
      if (diff < closestDiff) {
        closest = point;
        closestDiff = diff;
      }
    }

    return {
      price: closest[1],
      actualTimestamp: closest[0] / 1000,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    handleAxiosError(error, coinId);
  }
}
