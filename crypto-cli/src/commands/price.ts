import ora from 'ora';
import { resolveCoinId, getCoinName, findClosestSymbol, getSupportedSymbols } from '../services/coinMap.js';
import { getCurrentPrice, getHistoricalPrice } from '../services/api.js';
import { buildCompareTimestamp, formatDateLabel } from '../utils/date.js';
import { renderPriceOnly, renderPriceComparison, renderError } from '../utils/display.js';
import { ApiError } from '../types.js';

export async function priceCommand(
  symbol: string,
  options: { compare?: string; time?: string; currency: string },
): Promise<void> {
  const coinId = resolveCoinId(symbol);
  if (!coinId) {
    const suggestion = findClosestSymbol(symbol);
    renderError(
      `Unknown coin "${symbol}".${suggestion ? ` Did you mean "${suggestion}"?` : ''}`,
    );
    renderError(`Supported: ${getSupportedSymbols().join(', ')}`);
    process.exit(1);
    return; // unreachable but helps TS
  }

  const coinName = getCoinName(coinId);
  const spinner = ora(`Fetching ${symbol.toUpperCase()} price...`).start();

  try {
    const currentPrice = await getCurrentPrice(coinId, options.currency);

    if (options.compare) {
      let targetTs: number;
      try {
        targetTs = buildCompareTimestamp(options.compare, options.time);
      } catch (err) {
        spinner.stop();
        renderError((err as Error).message);
        process.exit(1);
        return;
      }

      const historical = await getHistoricalPrice(
        coinId,
        targetTs,
        options.currency,
      );

      spinner.stop();

      renderPriceComparison({
        coinSymbol: symbol.toUpperCase(),
        coinName,
        currentPrice,
        historicalPrice: historical.price,
        compareDate: options.compare,
        compareTimeLabel: formatDateLabel(historical.actualTimestamp),
        currency: options.currency,
      });
    } else {
      spinner.stop();
      renderPriceOnly(symbol.toUpperCase(), coinName, currentPrice, options.currency);
    }
  } catch (error) {
    spinner.stop();

    if (error instanceof ApiError) {
      renderError(error.message);
    } else {
      renderError('An unexpected error occurred.');
    }
    process.exit(1);
  }
}
