// Supported currencies
export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'PLN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
};

// Fixed conversion rate for platform prices (GBP to PLN)
const GBP_TO_PLN_RATE = 5;

/**
 * Convert platform price from GBP to display currency based on country
 * Fixed rate: £1 = 5 PLN (for Poland only)
 * All other countries display in GBP
 * This applies to: platform subscriptions, boost fees
 */
export function convertPlatformPriceForDisplay(
  amountGBP: number,
  countryCode: string
): { amount: number; currency: CurrencyCode } {
  if (countryCode === 'pl') {
    return { amount: amountGBP * GBP_TO_PLN_RATE, currency: 'PLN' };
  }
  return { amount: amountGBP, currency: 'GBP' };
}

/**
 * @deprecated Use convertPlatformPriceForDisplay with country context instead
 * Convert boost fee from GBP to display currency (only PLN conversion supported)
 * Base values remain in GBP - this is display-only conversion
 */
export function convertBoostFeeForDisplay(
  amountGBP: number,
  displayCurrency: string
): number {
  if (displayCurrency === 'PLN') {
    return amountGBP * GBP_TO_PLN_RATE;
  }
  return amountGBP;
}

/**
 * @deprecated Use convertPlatformPriceForDisplay with country context instead
 * Get the display currency code for boost fees
 * Returns PLN if coach uses PLN, otherwise GBP
 */
export function getBoostDisplayCurrency(coachCurrency: string | null | undefined): CurrencyCode {
  if (coachCurrency === 'PLN') {
    return 'PLN';
  }
  return 'GBP';
}

// Default currency for UK launch
export const DEFAULT_CURRENCY: CurrencyCode = 'GBP';
export const DEFAULT_LOCALE = 'en-GB';

/**
 * Format a number as currency using Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  locale?: string
): string {
  const currencyConfig = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  const formatLocale = locale || currencyConfig.locale;

  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currencyConfig.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get the currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}

/**
 * Parse a currency string back to a number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format a number as a compact currency (e.g., £1.2K, £1.5M)
 */
export function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
  locale?: string
): string {
  const currencyConfig = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  const formatLocale = locale || currencyConfig.locale;

  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currencyConfig.code,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Get list of supported currencies for dropdowns
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}
