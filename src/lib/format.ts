/**
 * Formats currency in South African Rand (ZAR)
 * Format requirement: "R 1 234,50" (Space thousands separator, comma decimal, NEVER $)
 */
export function formatRand(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return 'R 0,00';
  }

  const num = Number(value);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  
  // Format integer part with spaces every 3 digits
  const spacedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${isNegative ? '-' : ''}R ${spacedInt},${decPart}`;
}

/**
 * Formats cases and loose units, e.g. "2 cases + 7" or "0 cases + 14"
 */
export function formatStockUnits(cases: number, looseUnits: number): string {
  const c = Math.max(0, Math.floor(cases));
  const u = Math.max(0, Math.floor(looseUnits));
  return `${c} case${c === 1 ? '' : 's'} + ${u}`;
}

/**
 * Formats short time for timestamps, e.g. "19:42" or "14:05"
 */
export function formatTime(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formats friendly day/date, e.g. "Sunday, 27 Sept"
 */
export function formatDate(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Time of day greeting for Cecil
 */
export function getTimeOfDayGreeting(ownerName: string = 'Cecil'): {
  greeting: string;
  icon: string;
} {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { greeting: `Good morning, ${ownerName}`, icon: '☀️' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: `Good afternoon, ${ownerName}`, icon: '⛅' };
  } else {
    return { greeting: `Good evening, ${ownerName}`, icon: '🌙' };
  }
}
