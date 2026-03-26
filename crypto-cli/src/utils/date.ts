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

  let withTime: dayjs.Dayjs;

  if (timeStr) {
    const utcMinutes = parseTimeToUtcMinutes(timeStr);
    withTime = parsed.hour(Math.floor(utcMinutes / 60)).minute(utcMinutes % 60).second(0);
  } else {
    withTime = parsed.hour(now.hour()).minute(now.minute()).second(0);
  }

  return withTime.unix();
}

/**
 * Parse a time string like "20:00", "20:00+02:00", "18:00Z" into
 * total minutes from midnight UTC.
 */
function parseTimeToUtcMinutes(timeStr: string): number {
  // Match HH:MM with optional timezone offset like +02:00, -05:30, or Z
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
  // No timezone specified → treat as UTC

  // Wrap around midnight
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  return totalMinutes;
}

export function formatDateLabel(timestamp: number): string {
  return dayjs.unix(timestamp).utc().format('MMM D, YYYY [at] HH:mm [UTC]');
}
