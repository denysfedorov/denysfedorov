import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { getSupportedSymbols, resolveCoinId, getCoinName } from '../services/coinMap.js';
import { getCurrentPrice, getHistoricalPrice } from '../services/api.js';
import { buildCompareTimestamp, formatDateLabel } from '../utils/date.js';
import { renderPriceOnly, renderPriceComparison, renderError } from '../utils/display.js';
import { ApiError } from '../types.js';
import ora from 'ora';

const POPULAR_COINS = ['btc', 'eth', 'sol', 'bnb', 'xrp', 'ada', 'doge', 'dot', 'avax', 'link'];

async function promptCoin(): Promise<string> {
  const symbol = await select({
    message: 'Select a cryptocurrency:',
    choices: [
      ...POPULAR_COINS.map((s) => {
        const id = resolveCoinId(s)!;
        return { name: `${s.toUpperCase()} (${getCoinName(id)})`, value: s };
      }),
      { name: 'Other (type manually)', value: '__other__' },
    ],
  });

  if (symbol === '__other__') {
    const custom = await input({
      message: `Enter coin symbol (${getSupportedSymbols().length} supported):`,
      validate: (val) => {
        if (!val.trim()) return 'Please enter a symbol.';
        if (!resolveCoinId(val.trim())) return `Unknown symbol "${val}". Supported: ${getSupportedSymbols().join(', ')}`;
        return true;
      },
    });
    return custom.trim().toLowerCase();
  }

  return symbol;
}

async function promptCurrency(): Promise<string> {
  return select({
    message: 'Select currency:',
    choices: [
      { name: 'USD ($)', value: 'usd' },
      { name: 'EUR (€)', value: 'eur' },
      { name: 'GBP (£)', value: 'gbp' },
      { name: 'JPY (¥)', value: 'jpy' },
      { name: 'CAD (C$)', value: 'cad' },
      { name: 'AUD (A$)', value: 'aud' },
    ],
    default: 'usd',
  });
}

async function promptCompare(): Promise<string | null> {
  const wantCompare = await confirm({
    message: 'Compare with a historical date?',
    default: false,
  });

  if (!wantCompare) return null;

  const dateStr = await input({
    message: 'Enter date (YYYY-MM-DD):',
    validate: (val) => {
      try {
        buildCompareTimestamp(val.trim());
        return true;
      } catch (err) {
        return (err as Error).message;
      }
    },
  });

  return dateStr.trim();
}

async function runOnce(): Promise<void> {
  const symbol = await promptCoin();
  const currency = await promptCurrency();
  const compareDate = await promptCompare();

  const coinId = resolveCoinId(symbol)!;
  const coinName = getCoinName(coinId);
  const spinner = ora(`Fetching ${symbol.toUpperCase()} price...`).start();

  try {
    const current = await getCurrentPrice(coinId, currency);

    if (compareDate) {
      const targetTs = buildCompareTimestamp(compareDate);
      const historical = await getHistoricalPrice(coinId, targetTs, currency);
      spinner.stop();

      renderPriceComparison({
        coinSymbol: symbol.toUpperCase(),
        coinName,
        currentPrice: current.price,
        historicalPrice: historical.price,
        compareDate,
        compareTimeLabel: formatDateLabel(historical.actualTimestamp),
        currency,
        provider:
          current.provider === historical.provider
            ? current.provider
            : `${current.provider} (current), ${historical.provider} (historical)`,
      });
    } else {
      spinner.stop();
      renderPriceOnly(symbol.toUpperCase(), coinName, current.price, currency, current.provider);
    }
  } catch (error) {
    spinner.stop();
    if (error instanceof ApiError) {
      renderError(error.message);
    } else {
      renderError((error as Error).message);
    }
  }
}

export async function interactiveMode(): Promise<void> {
  console.log(chalk.bold('\n  Crypto Price Checker\n'));

  let running = true;
  while (running) {
    await runOnce();
    console.log();
    running = await confirm({ message: 'Check another coin?', default: true });
  }

  console.log(chalk.gray('\nGoodbye!\n'));
}
