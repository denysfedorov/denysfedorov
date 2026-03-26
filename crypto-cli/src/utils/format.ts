import type { PriceDiff } from '../types.js';

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcDiff(current: number, historical: number): PriceDiff {
  const absolute = current - historical;
  const percent = ((current - historical) / historical) * 100;
  const roundedPercent = Math.round(percent * 100) / 100;

  let direction: 'up' | 'down' | 'flat';
  if (roundedPercent > 0) {
    direction = 'up';
  } else if (roundedPercent < 0) {
    direction = 'down';
  } else {
    direction = 'flat';
  }

  return { absolute, percent, direction };
}

export function formatDiff(diff: PriceDiff, currency: string): string {
  const absFmt = formatPrice(Math.abs(diff.absolute), currency);
  const pctFmt = `${Math.abs(diff.percent).toFixed(2)}%`;

  switch (diff.direction) {
    case 'up':
      return `+${absFmt} (+${pctFmt}) ▲`;
    case 'down':
      return `-${absFmt} (-${pctFmt}) ▼`;
    case 'flat':
      return `${formatPrice(0, currency)} (0.00%) ─`;
  }
}
