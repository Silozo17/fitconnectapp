import { format, formatDistance, formatRelative, parseISO, Locale } from 'date-fns';
import { enGB, enUS } from 'date-fns/locale';

export type LocaleCode = 'en-GB' | 'en-US' | 'en-NZ' | 'en-AE' | 'de-DE' | 'fr-FR' | 'es-ES';

// Default locale for UK launch
export const DEFAULT_DATE_LOCALE: LocaleCode = 'en-GB';

// Map locale codes to date-fns locales
const DATE_FNS_LOCALES: Record<string, Locale> = {
  'en-GB': enGB,
  'en-US': enUS,
  // Add more locales as needed when expanding internationally
};

/**
 * Get date-fns locale object from locale code
 */
function getDateFnsLocale(locale: LocaleCode = DEFAULT_DATE_LOCALE): Locale {
  return DATE_FNS_LOCALES[locale] || DATE_FNS_LOCALES[DEFAULT_DATE_LOCALE];
}

/**
 * Format a date using locale-aware formatting
 */
export function formatDate(
  date: Date | string,
  formatString: string = 'PP',
  locale: LocaleCode = DEFAULT_DATE_LOCALE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: getDateFnsLocale(locale) });
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date | string,
  baseDate: Date = new Date(),
  locale: LocaleCode = DEFAULT_DATE_LOCALE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, baseDate, { 
    addSuffix: true, 
    locale: getDateFnsLocale(locale) 
  });
}

/**
 * Format a date relative to today (e.g., "yesterday", "last Friday")
 */
export function formatRelativeDate(
  date: Date | string,
  baseDate: Date = new Date(),
  locale: LocaleCode = DEFAULT_DATE_LOCALE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatRelative(dateObj, baseDate, { locale: getDateFnsLocale(locale) });
}

/**
 * Common date format patterns
 */
export const DATE_FORMATS = {
  // UK formats
  shortDate: 'dd/MM/yyyy',      // 25/12/2024
  longDate: 'dd MMMM yyyy',     // 25 December 2024
  shortDateTime: 'dd/MM/yyyy HH:mm', // 25/12/2024 14:30
  longDateTime: 'dd MMMM yyyy HH:mm', // 25 December 2024 14:30
  time: 'HH:mm',                // 14:30
  timeWithSeconds: 'HH:mm:ss',  // 14:30:45
  dayMonth: 'dd MMM',           // 25 Dec
  monthYear: 'MMMM yyyy',       // December 2024
  dayOfWeek: 'EEEE',            // Wednesday
  shortDayOfWeek: 'EEE',        // Wed
  iso: "yyyy-MM-dd'T'HH:mm:ss", // ISO 8601
} as const;

/**
 * Format date for display in UI (locale-aware)
 */
export function formatDisplayDate(
  date: Date | string,
  locale: LocaleCode = DEFAULT_DATE_LOCALE
): string {
  return formatDate(date, DATE_FORMATS.shortDate, locale);
}

/**
 * Format datetime for display in UI (locale-aware)
 */
export function formatDisplayDateTime(
  date: Date | string,
  locale: LocaleCode = DEFAULT_DATE_LOCALE
): string {
  return formatDate(date, DATE_FORMATS.shortDateTime, locale);
}
