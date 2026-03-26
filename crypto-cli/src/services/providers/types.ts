export interface PriceProvider {
  name: string;
  getCurrentPrice(coinId: string, currency: string): Promise<number>;
  getHistoricalPrice(
    coinId: string,
    targetTimestamp: number,
    currency: string,
  ): Promise<{ price: number; actualTimestamp: number }>;
}
