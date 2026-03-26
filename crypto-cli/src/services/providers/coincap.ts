import axios from 'axios';
import { handleAxiosError } from '../httpErrors.js';
import { CoinNotFoundError, NoPriceDataError, ApiError } from '../../types.js';
import type { PriceProvider } from './types.js';

const BASE_URL = 'https://api.coincap.io/v2';

// CoinCap uses its own IDs (same as CoinGecko for most coins)
const COINCAP_IDS: Record<string, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  solana: 'solana',
  binancecoin: 'binance-coin',
  ripple: 'xrp',
  cardano: 'cardano',
  dogecoin: 'dogecoin',
  polkadot: 'polkadot',
  'avalanche-2': 'avalanche',
  'matic-network': 'polygon',
  chainlink: 'chainlink',
  uniswap: 'uniswap',
  cosmos: 'cosmos',
  litecoin: 'litecoin',
  'ethereum-classic': 'ethereum-classic',
  stellar: 'stellar',
  algorand: 'algorand',
  near: 'near-protocol',
  fantom: 'fantom',
  'internet-computer': 'internet-computer',
  filecoin: 'filecoin',
  'hedera-hashgraph': 'hedera-hashgraph',
  vechain: 'vechain',
  'the-sandbox': 'the-sandbox',
  decentraland: 'decentraland',
  'axie-infinity': 'axie-infinity',
  aave: 'aave',
  maker: 'maker',
  'curve-dao-token': 'curve-dao-token',
  'lido-dao': 'lido-dao',
  arbitrum: 'arbitrum',
  optimism: 'optimism',
  aptos: 'aptos',
  sui: 'sui',
  'sei-network': 'sei-network',
  'the-open-network': 'toncoin',
  tron: 'tron',
  'shiba-inu': 'shiba-inu',
  pepe: 'pepe',
};

function toCoinCapId(geckoId: string): string {
  return COINCAP_IDS[geckoId] ?? geckoId;
}

export const coincap: PriceProvider = {
  name: 'CoinCap',

  async getCurrentPrice(coinId: string, currency: string): Promise<number> {
    if (currency !== 'usd') {
      throw new ApiError('CoinCap only supports USD prices. Falling back.', 400);
    }

    const capId = toCoinCapId(coinId);
    try {
      const response = await axios.get(`${BASE_URL}/assets/${capId}`, {
        timeout: 10000,
      });
      const price = parseFloat(response.data?.data?.priceUsd);
      if (isNaN(price)) throw new CoinNotFoundError(coinId);
      return price;
    } catch (error) {
      handleAxiosError(error, 'CoinCap', coinId);
    }
  },

  async getHistoricalPrice(coinId: string, targetTimestamp: number, currency: string) {
    if (currency !== 'usd') {
      throw new ApiError('CoinCap only supports USD prices. Falling back.', 400);
    }

    const capId = toCoinCapId(coinId);
    const startMs = (targetTimestamp - 3600) * 1000;
    const endMs = (targetTimestamp + 3600) * 1000;

    try {
      const response = await axios.get(`${BASE_URL}/assets/${capId}/history`, {
        params: { interval: 'm15', start: startMs, end: endMs },
        timeout: 10000,
      });

      const dataPoints: { priceUsd: string; time: number }[] = response.data?.data;
      if (!dataPoints || dataPoints.length === 0) throw new NoPriceDataError(coinId);

      const targetMs = targetTimestamp * 1000;
      let closest = dataPoints[0];
      let closestDiff = Math.abs(dataPoints[0].time - targetMs);

      for (const point of dataPoints) {
        const diff = Math.abs(point.time - targetMs);
        if (diff < closestDiff) {
          closest = point;
          closestDiff = diff;
        }
      }

      return {
        price: parseFloat(closest.priceUsd),
        actualTimestamp: closest.time / 1000,
      };
    } catch (error) {
      handleAxiosError(error, 'CoinCap', coinId);
    }
  },
};
