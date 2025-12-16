import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CurrencyCode, DEFAULT_CURRENCY, formatCurrency as formatCurrencyUtil, formatCompactCurrency } from '@/lib/currency';
import { LocaleCode, DEFAULT_DATE_LOCALE, formatDate as formatDateUtil, formatRelativeTime, formatDisplayDate, formatDisplayDateTime } from '@/lib/date';

interface LocaleContextType {
  // Current settings
  locale: LocaleCode;
  currency: CurrencyCode;
  
  // Setters
  setLocale: (locale: LocaleCode) => void;
  setCurrency: (currency: CurrencyCode) => void;
  
  // Formatting functions
  formatCurrency: (amount: number, overrideCurrency?: CurrencyCode) => string;
  formatCompactCurrency: (amount: number, overrideCurrency?: CurrencyCode) => string;
  formatDate: (date: Date | string, formatString?: string) => string;
  formatRelativeTime: (date: Date | string, baseDate?: Date) => string;
  formatDisplayDate: (date: Date | string) => string;
  formatDisplayDateTime: (date: Date | string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: LocaleCode;
  defaultCurrency?: CurrencyCode;
}

export function LocaleProvider({ 
  children, 
  defaultLocale = DEFAULT_DATE_LOCALE,
  defaultCurrency = DEFAULT_CURRENCY 
}: LocaleProviderProps) {
  const [locale, setLocale] = useState<LocaleCode>(defaultLocale);
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  // Memoized formatting functions
  const formatCurrencyFn = useCallback(
    (amount: number, overrideCurrency?: CurrencyCode) => 
      formatCurrencyUtil(amount, overrideCurrency || currency, locale),
    [currency, locale]
  );

  const formatCompactCurrencyFn = useCallback(
    (amount: number, overrideCurrency?: CurrencyCode) => 
      formatCompactCurrency(amount, overrideCurrency || currency, locale),
    [currency, locale]
  );

  const formatDateFn = useCallback(
    (date: Date | string, formatString?: string) => 
      formatDateUtil(date, formatString, locale),
    [locale]
  );

  const formatRelativeTimeFn = useCallback(
    (date: Date | string, baseDate?: Date) => 
      formatRelativeTime(date, baseDate, locale),
    [locale]
  );

  const formatDisplayDateFn = useCallback(
    (date: Date | string) => formatDisplayDate(date, locale),
    [locale]
  );

  const formatDisplayDateTimeFn = useCallback(
    (date: Date | string) => formatDisplayDateTime(date, locale),
    [locale]
  );

  const value: LocaleContextType = {
    locale,
    currency,
    setLocale,
    setCurrency,
    formatCurrency: formatCurrencyFn,
    formatCompactCurrency: formatCompactCurrencyFn,
    formatDate: formatDateFn,
    formatRelativeTime: formatRelativeTimeFn,
    formatDisplayDate: formatDisplayDateFn,
    formatDisplayDateTime: formatDisplayDateTimeFn,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Export a standalone hook for components that just need simple formatting
// without the full context (useful for server components or utilities)
export { formatCurrencyUtil as formatCurrencyStandalone };
