import axios from 'axios';
import { handleAxiosError } from '../httpErrors.js';
import { CoinNotFoundError, NoPriceDataError, ApiError } from '../../types.js';
import type { PriceProvider } from './types.js';

const BASE_URL = 'https://api.coinpaprika.com/v1';

// CoinPaprika uses IDs like "btc-bitcoin", "eth-ethereum"
const PAPRIKA_IDS: Record<string, string> = {
  bitcoin: 'btc-bitcoin',
  ethereum: 'eth-ethereum',
  solana: 'sol-solana',
  binancecoin: 'bnb-binance-coin',
  ripple: 'xrp-xrp',
  cardano: 'ada-cardano',
  dogecoin: 'doge-dogecoin',
  polkadot: 'dot-polkadot',
  'avalanche-2': 'avax-avalanche',
  'matic-network': 'matic-polygon',
  chainlink: 'link-chainlink',
  uniswap: 'uni-uniswap',
  cosmos: 'atom-cosmos',
  litecoin: 'ltc-litecoin',
  'ethereum-classic': 'etc-ethereum-classic',
  stellar: 'xlm-stellar',
  algorand: 'algo-algorand',
  near: 'near-near-protocol',
  fantom: 'ftm-fantom',
  'internet-computer': 'icp-internet-computer',
  filecoin: 'fil-filecoin',
  'hedera-hashgraph': 'hbar-hedera',
  vechain: 'vet-vechain',
  'the-sandbox': 'sand-the-sandbox',
  decentraland: 'mana-decentraland',
  'axie-infinity': 'axs-axie-infinity',
  aave: 'aave-aave',
  maker: 'mkr-maker',
  'curve-dao-token': 'crv-curve-dao-token',
  'lido-dao': 'ldo-lido-dao',
  arbitrum: 'arb-arbitrum',
  optimism: 'op-optimism',
  aptos: 'apt-aptos',
  sui: 'sui-sui',
  'sei-network': 'sei-sei',
  'the-open-network': 'ton-toncoin',
  tron: 'trx-tron',
  'shiba-inu': 'shib-shiba-inu',
  pepe: 'pepe-pepe',
};

function toPaprikaId(geckoId: string): string {
  return PAPRIKA_IDS[geckoId] ?? geckoId;
}

export const coinpaprika: PriceProvider = {
  name: 'CoinPaprika',

  async getCurrentPrice(coinId: string, currency: string): Promise<number> {
    if (currency !== 'usd') {
      throw new ApiError('CoinPaprika free tier only supports USD. Falling back.', 400);
    }

    const papId = toPaprikaId(coinId);
    try {
      const response = await axios.get(`${BASE_URL}/tickers/${papId}`, {
        timeout: 10000,
      });
      const price = response.data?.quotes?.USD?.price;
      if (price === undefined) throw new CoinNotFoundError(coinId);
      return price;
    } catch (error) {
      handleAxiosError(error, 'CoinPaprika', coinId);
    }
  },

  async getHistoricalPrice(coinId: string, targetTimestamp: number, currency: string) {
    if (currency !== 'usd') {
      throw new ApiError('CoinPaprika free tier only supports USD. Falling back.', 400);
    }

    const papId = toPaprikaId(coinId);
    const targetDate = new Date(targetTimestamp * 1000).toISOString().split('T')[0];

    try {
      // CoinPaprika historical tickers — daily granularity on free tier
      const response = await axios.get(
        `${BASE_URL}/tickers/${papId}/historical`,
        {
          params: {
            start: `${targetDate}T00:00:00Z`,
            interval: '1d',
            limit: 1,
          },
          timeout: 10000,
        },
      );

      const data: { timestamp: string; price: number }[] = response.data;
      if (!data || data.length === 0) throw new NoPriceDataError(coinId);

      return {
        price: data[0].price,
        actualTimestamp: new Date(data[0].timestamp).getTime() / 1000,
      };
    } catch (error) {
      handleAxiosError(error, 'CoinPaprika', coinId);
    }
  },
};
