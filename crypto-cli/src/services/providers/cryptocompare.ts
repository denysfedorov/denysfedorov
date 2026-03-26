import axios from 'axios';
import { handleAxiosError } from '../httpErrors.js';
import { CoinNotFoundError, NoPriceDataError } from '../../types.js';
import type { PriceProvider } from './types.js';

const BASE_URL = 'https://min-api.cryptocompare.com/data';

// CryptoCompare uses uppercase symbols directly
const SYMBOL_MAP: Record<string, string> = {
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

function toSymbol(geckoId: string): string | null {
  return SYMBOL_MAP[geckoId] ?? null;
}

function toCurrency(currency: string): string {
  return currency.toUpperCase();
}

export const cryptocompare: PriceProvider = {
  name: 'CryptoCompare',

  async getCurrentPrice(coinId: string, currency: string): Promise<number> {
    const fsym = toSymbol(coinId);
    if (!fsym) throw new CoinNotFoundError(coinId);

    try {
      const response = await axios.get(`${BASE_URL}/price`, {
        params: { fsym, tsyms: toCurrency(currency) },
        timeout: 10000,
      });

      const price = response.data?.[toCurrency(currency)];
      if (price === undefined || price === 0) throw new CoinNotFoundError(coinId);
      return price;
    } catch (error) {
      handleAxiosError(error, 'CryptoCompare', coinId);
    }
  },

  async getHistoricalPrice(coinId: string, targetTimestamp: number, currency: string) {
    const fsym = toSymbol(coinId);
    if (!fsym) throw new CoinNotFoundError(coinId);

    try {
      // pricehistorical gives the daily close price for a specific timestamp
      const response = await axios.get(`${BASE_URL}/pricehistorical`, {
        params: {
          fsym,
          tsyms: toCurrency(currency),
          ts: targetTimestamp,
        },
        timeout: 10000,
      });

      const price = response.data?.[fsym]?.[toCurrency(currency)];
      if (price === undefined || price === 0) throw new NoPriceDataError(coinId);

      return {
        price,
        actualTimestamp: targetTimestamp,
      };
    } catch (error) {
      handleAxiosError(error, 'CryptoCompare', coinId);
    }
  },
};
