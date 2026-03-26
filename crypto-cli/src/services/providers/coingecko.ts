import axios from 'axios';
import { handleAxiosError } from '../httpErrors.js';
import { CoinNotFoundError, NoPriceDataError } from '../../types.js';
import type { PriceProvider } from './types.js';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const coingecko: PriceProvider = {
  name: 'CoinGecko',

  async getCurrentPrice(coinId: string, currency: string): Promise<number> {
    try {
      const response = await axios.get(`${BASE_URL}/simple/price`, {
        params: { ids: coinId, vs_currencies: currency },
        timeout: 10000,
      });
      const price = response.data?.[coinId]?.[currency];
      if (price === undefined) throw new CoinNotFoundError(coinId);
      return price;
    } catch (error) {
      handleAxiosError(error, 'CoinGecko', coinId);
    }
  },

  async getHistoricalPrice(coinId: string, targetTimestamp: number, currency: string) {
    try {
      const response = await axios.get(
        `${BASE_URL}/coins/${coinId}/market_chart/range`,
        {
          params: {
            vs_currency: currency,
            from: targetTimestamp - 3600,
            to: targetTimestamp + 3600,
          },
          timeout: 10000,
        },
      );

      const prices: [number, number][] = response.data?.prices;
      if (!prices || prices.length === 0) throw new NoPriceDataError(coinId);

      return findClosestPrice(prices, targetTimestamp);
    } catch (error) {
      handleAxiosError(error, 'CoinGecko', coinId);
    }
  },
};

function findClosestPrice(prices: [number, number][], targetTimestamp: number) {
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

  return { price: closest[1], actualTimestamp: closest[0] / 1000 };
}
