import axios from 'axios';
import { handleAxiosError } from '../httpErrors.js';
import { CoinNotFoundError, NoPriceDataError, ApiError } from '../../types.js';
import type { PriceProvider } from './types.js';

const BASE_URL = 'https://api.binance.com/api/v3';

// Binance uses trading pairs like BTCUSDT
const BINANCE_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  binancecoin: 'BNB',
  ripple: 'XRP',
  cardano: 'ADA',
  dogecoin: 'DOGE',
  polkadot: 'DOT',
  'avalanche-2': 'AVAX',
  'matic-network': 'MATIC',
  chainlink: 'LINK',
  uniswap: 'UNI',
  cosmos: 'ATOM',
  litecoin: 'LTC',
  'ethereum-classic': 'ETC',
  stellar: 'XLM',
  algorand: 'ALGO',
  near: 'NEAR',
  fantom: 'FTM',
  'internet-computer': 'ICP',
  filecoin: 'FIL',
  'hedera-hashgraph': 'HBAR',
  vechain: 'VET',
  'the-sandbox': 'SAND',
  decentraland: 'MANA',
  'axie-infinity': 'AXS',
  aave: 'AAVE',
  maker: 'MKR',
  'curve-dao-token': 'CRV',
  'lido-dao': 'LDO',
  arbitrum: 'ARB',
  optimism: 'OP',
  aptos: 'APT',
  sui: 'SUI',
  'sei-network': 'SEI',
  'the-open-network': 'TON',
  tron: 'TRX',
  'shiba-inu': 'SHIB',
  pepe: 'PEPE',
};

const BINANCE_QUOTE: Record<string, string> = {
  usd: 'USDT',
  eur: 'EUR',
  gbp: 'GBP',
  try: 'TRY',
  brl: 'BRL',
};

function toBinanceSymbol(geckoId: string, currency: string): string | null {
  const base = BINANCE_SYMBOLS[geckoId];
  const quote = BINANCE_QUOTE[currency] ?? currency.toUpperCase();
  if (!base) return null;
  return `${base}${quote}`;
}

export const binance: PriceProvider = {
  name: 'Binance',

  async getCurrentPrice(coinId: string, currency: string): Promise<number> {
    const symbol = toBinanceSymbol(coinId, currency);
    if (!symbol) throw new CoinNotFoundError(coinId);

    try {
      const response = await axios.get(`${BASE_URL}/ticker/price`, {
        params: { symbol },
        timeout: 10000,
      });
      const price = parseFloat(response.data?.price);
      if (isNaN(price)) throw new CoinNotFoundError(coinId);
      return price;
    } catch (error) {
      handleAxiosError(error, 'Binance', coinId);
    }
  },

  async getHistoricalPrice(coinId: string, targetTimestamp: number, currency: string) {
    const symbol = toBinanceSymbol(coinId, currency);
    if (!symbol) throw new CoinNotFoundError(coinId);

    const targetMs = targetTimestamp * 1000;

    try {
      // Use klines (candlestick) data — 1h interval, closest to target time
      const response = await axios.get(`${BASE_URL}/klines`, {
        params: {
          symbol,
          interval: '1h',
          startTime: targetMs - 3600000,
          endTime: targetMs + 3600000,
          limit: 3,
        },
        timeout: 10000,
      });

      const klines: unknown[][] = response.data;
      if (!klines || klines.length === 0) throw new NoPriceDataError(coinId);

      // Each kline: [openTime, open, high, low, close, ...]
      // Find the kline closest to target time and use its close price
      let closest = klines[0];
      let closestDiff = Math.abs((closest[0] as number) - targetMs);

      for (const kline of klines) {
        const diff = Math.abs((kline[0] as number) - targetMs);
        if (diff < closestDiff) {
          closest = kline;
          closestDiff = diff;
        }
      }

      return {
        price: parseFloat(closest[4] as string), // close price
        actualTimestamp: (closest[0] as number) / 1000,
      };
    } catch (error) {
      handleAxiosError(error, 'Binance', coinId);
    }
  },
};
