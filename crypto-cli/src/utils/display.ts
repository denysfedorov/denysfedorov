import chalk from 'chalk';
import { formatPrice, calcDiff, formatDiff } from './format.js';
import type { DisplayParams } from '../types.js';

export function renderPriceOnly(
  coinSymbol: string,
  coinName: string,
  price: number,
  currency: string,
): void {
  console.log(
    `${chalk.bold(coinSymbol)} (${coinName}): ${chalk.cyan(formatPrice(price, currency))}`,
  );
}

export function renderPriceComparison(params: DisplayParams): void {
  const {
    coinSymbol,
    coinName,
    currentPrice,
    historicalPrice,
    compareDate,
    compareTimeLabel,
    currency,
  } = params;

  const diff = calcDiff(currentPrice, historicalPrice);
  const diffStr = formatDiff(diff, currency);

  const coloredDiff =
    diff.direction === 'up'
      ? chalk.green(diffStr)
      : diff.direction === 'down'
        ? chalk.red(diffStr)
        : chalk.gray(diffStr);

  const header = `${coinSymbol} (${coinName})`;
  const currentLine = `Current price:    ${formatPrice(currentPrice, currency)}`;
  const histLine = `Price on ${compareDate}:  ${formatPrice(historicalPrice, currency)}`;
  const diffLine = `Difference:       ${diffStr}`;
  const timeLine = `Compare time:     ${compareTimeLabel}`;

  // Calculate box width
  const lines = [header, currentLine, histLine, diffLine, timeLine];
  const maxLen = Math.max(...lines.map((l) => l.length)) + 4;

  const top = `┌${'─'.repeat(maxLen)}┐`;
  const mid = `├${'─'.repeat(maxLen)}┤`;
  const bot = `└${'─'.repeat(maxLen)}┘`;
  const pad = (s: string, raw?: string) => {
    const len = (raw ?? s).length;
    return `│  ${s}${' '.repeat(Math.max(0, maxLen - len - 2))}│`;
  };

  console.log(top);
  console.log(pad(chalk.bold(header), header));
  console.log(mid);
  console.log(pad(`Current price:    ${chalk.cyan(formatPrice(currentPrice, currency))}`, currentLine));
  console.log(pad(`Price on ${compareDate}:  ${formatPrice(historicalPrice, currency)}`, histLine));
  console.log(pad(`Difference:       ${coloredDiff}`, diffLine));
  console.log(pad(`Compare time:     ${compareTimeLabel}`, timeLine));
  console.log(bot);
}

export function renderError(message: string): void {
  console.error(chalk.red('✖ ') + message);
}
