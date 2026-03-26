import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export function buildCompareTimestamp(dateStr: string): number {
  const parsed = dayjs.utc(dateStr, 'YYYY-MM-DD', true);

  if (!parsed.isValid()) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  const now = dayjs.utc();

  if (parsed.isAfter(now, 'day')) {
    throw new Error('Date cannot be in the future.');
  }

  if (parsed.isSame(now, 'day')) {
    throw new Error("That's today — nothing to compare. Pick a past date.");
  }

  const withCurrentTime = parsed
    .hour(now.hour())
    .minute(now.minute())
    .second(0);

  return withCurrentTime.unix();
}

export function formatDateLabel(timestamp: number): string {
  return dayjs.unix(timestamp).utc().format('MMM D, YYYY [at] HH:mm [UTC]');
}
