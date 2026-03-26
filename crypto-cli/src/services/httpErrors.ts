import { AxiosError } from 'axios';
import {
  RateLimitError,
  CoinNotFoundError,
  NetworkError,
  ApiError,
} from '../types.js';

export function handleAxiosError(
  error: unknown,
  providerName: string,
  coinId?: string,
): never {
  if (error instanceof ApiError) throw error;

  if (error instanceof AxiosError) {
    if (
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      throw new NetworkError();
    }
    const status = error.response.status;
    if (status === 429) throw new RateLimitError();
    if (status === 404) throw new CoinNotFoundError(coinId ?? 'unknown');
    throw new ApiError(
      `${providerName} API error (HTTP ${status}). Try again later.`,
      status,
    );
  }
  throw error;
}
