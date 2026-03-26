export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor() {
    super('Rate limited by CoinGecko. Wait 60 seconds and try again.', 429);
    this.name = 'RateLimitError';
  }
}

export class CoinNotFoundError extends ApiError {
  constructor(coinId: string) {
    super(`Coin "${coinId}" not found on CoinGecko.`, 404);
    this.name = 'CoinNotFoundError';
  }
}

export class NetworkError extends ApiError {
  constructor() {
    super("Can't reach CoinGecko. Check your internet connection.");
    this.name = 'NetworkError';
  }
}

export class NoPriceDataError extends ApiError {
  constructor(coinId: string, date?: string) {
    super(
      `No price data for ${coinId.toUpperCase()}${date ? ` on ${date}` : ''}. The coin may not have existed yet.`,
    );
    this.name = 'NoPriceDataError';
  }
}

export interface PriceDiff {
  absolute: number;
  percent: number;
  direction: 'up' | 'down' | 'flat';
}

export interface DisplayParams {
  coinSymbol: string;
  coinName: string;
  currentPrice: number;
  historicalPrice: number;
  compareDate: string;
  compareTimeLabel: string;
  currency: string;
}
