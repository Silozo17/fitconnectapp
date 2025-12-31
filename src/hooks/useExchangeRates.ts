import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyCode, CURRENCIES } from "@/lib/currency";
import { useCountry } from "@/hooks/useCountry";

interface ExchangeRatesResponse {
  rates: Record<string, number>;
  timestamp: string;
  base: string;
  cached?: boolean;
  fallback?: boolean;
}

interface ConvertedPrice {
  amount: number;
  currency: CurrencyCode;
  originalAmount: number;
  originalCurrency: CurrencyCode;
  wasConverted: boolean;
}

// Map countries to their preferred currencies
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  gb: 'GBP',
  uk: 'GBP',
  pl: 'PLN',
  us: 'USD',
  ie: 'EUR',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  it: 'EUR',
  au: 'AUD',
  ca: 'CAD',
};

export function getViewerCurrency(countryCode: string | null): CurrencyCode {
  if (!countryCode) return 'GBP';
  const normalizedCode = countryCode.toLowerCase();
  return COUNTRY_TO_CURRENCY[normalizedCode] || 'GBP';
}

async function fetchExchangeRates(base: string = 'GBP'): Promise<ExchangeRatesResponse> {
  const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
    body: {},
  });
  
  if (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates
    return {
      rates: { GBP: 1, USD: 1.27, EUR: 1.17, AUD: 1.93, CAD: 1.72, PLN: 5.03 },
      timestamp: new Date().toISOString(),
      base: 'GBP',
      fallback: true,
    };
  }
  
  return data;
}

export function useExchangeRates() {
  const { countryCode } = useCountry();
  const viewerCurrency = getViewerCurrency(countryCode);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: () => fetchExchangeRates('GBP'),
    staleTime: 30 * 60 * 1000, // 30 minutes - rates update daily, not every 5 min
    gcTime: 60 * 60 * 1000, // 1 hour cache
    retry: 2,
    refetchOnWindowFocus: false, // Stable UX - don't refetch on focus
  });
  
  /**
   * Convert a price from one currency to another using live rates
   */
  const convertPrice = (
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): number => {
    if (fromCurrency === toCurrency || !data?.rates) {
      return amount;
    }
    
    const rates = data.rates;
    
    // Convert to GBP first (base currency), then to target
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    // amount in fromCurrency -> GBP -> toCurrency
    const amountInGBP = amount / fromRate;
    const convertedAmount = amountInGBP * toRate;
    
    return Math.round(convertedAmount * 100) / 100;
  };
  
  /**
   * Convert a user-generated price for display to a viewer in a different country
   * Returns both the converted amount and original for transparency
   */
  const convertForViewer = (
    amount: number,
    creatorCurrency: CurrencyCode
  ): ConvertedPrice => {
    const shouldConvert = creatorCurrency !== viewerCurrency && data?.rates;
    
    if (!shouldConvert) {
      return {
        amount,
        currency: creatorCurrency,
        originalAmount: amount,
        originalCurrency: creatorCurrency,
        wasConverted: false,
      };
    }
    
    const convertedAmount = convertPrice(amount, creatorCurrency, viewerCurrency);
    
    return {
      amount: convertedAmount,
      currency: viewerCurrency,
      originalAmount: amount,
      originalCurrency: creatorCurrency,
      wasConverted: true,
    };
  };
  
  return {
    rates: data?.rates || null,
    isLoading,
    error,
    viewerCurrency,
    convertPrice,
    convertForViewer,
    isFallback: data?.fallback || false,
  };
}
