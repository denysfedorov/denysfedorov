import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export function buildCompareTimestamp(
  dateStr: string,
  timeStr?: string,
): number {
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

  if (timeStr) {
    const result = parseTimeToUtc(timeStr);
    const adjusted = parsed
      .add(result.dayDelta, 'day')
      .hour(result.hour)
      .minute(result.minute)
      .second(0);
    return adjusted.unix();
  }

  const withCurrentTime = parsed.hour(now.hour()).minute(now.minute()).second(0);
  return withCurrentTime.unix();
}

interface ParsedTime {
  hour: number;
  minute: number;
  dayDelta: number; // -1, 0, or +1 for cross-midnight offsets
}

/**
 * Parse a time string like "20:00", "20:00+02:00", "18:00Z" into
 * UTC hour/minute with a day delta for cross-midnight cases.
 */
function parseTimeToUtc(timeStr: string): ParsedTime {
  const match = timeStr.match(
    /^(\d{1,2}):(\d{2})(?:(Z)|([+-])(\d{1,2}):(\d{2}))?$/,
  );
  if (!match) {
    throw new Error(
      'Invalid time format. Use HH:MM, HH:MM+02:00, or HH:MMZ.',
    );
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours > 23 || minutes > 59) {
    throw new Error('Invalid time. Hours must be 0-23, minutes 0-59.');
  }

  let totalMinutes = hours * 60 + minutes;

  if (match[3] === 'Z') {
    // Already UTC
  } else if (match[4]) {
    const sign = match[4] === '+' ? -1 : 1; // +02:00 means subtract to get UTC
    const offsetH = parseInt(match[5], 10);
    const offsetM = parseInt(match[6], 10);
    totalMinutes += sign * (offsetH * 60 + offsetM);
  }

  // Handle cross-midnight day boundaries
  let dayDelta = 0;
  if (totalMinutes < 0) {
    dayDelta = -1;
    totalMinutes += 1440;
  } else if (totalMinutes >= 1440) {
    dayDelta = 1;
    totalMinutes -= 1440;
  }

  return {
    hour: Math.floor(totalMinutes / 60),
    minute: totalMinutes % 60,
    dayDelta,
  };
}

export function formatDateLabel(timestamp: number): string {
  return dayjs.unix(timestamp).utc().format('MMM D, YYYY [at] HH:mm [UTC]');
}
