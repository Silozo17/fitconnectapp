import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback rates if API fails (approximate rates as of 2024)
const FALLBACK_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  AUD: 1.93,
  CAD: 1.72,
  PLN: 5.03,
};

interface CachedRates {
  rates: Record<string, number>;
  timestamp: string;
  base: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const base = url.searchParams.get('base') || 'GBP';
    
    console.log(`Fetching exchange rates for base currency: ${base}`);
    
    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check cache first (1 hour TTL)
    const cacheKey = `exchange_rates_${base}`;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: cachedData } = await supabase
      .from('system_cache')
      .select('value, updated_at')
      .eq('key', cacheKey)
      .gte('updated_at', oneHourAgo)
      .maybeSingle();
    
    if (cachedData?.value) {
      console.log('Returning cached exchange rates');
      const cached = cachedData.value as CachedRates;
      return new Response(JSON.stringify({
        rates: cached.rates,
        timestamp: cached.timestamp,
        base: cached.base,
        cached: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Fetch fresh rates from Frankfurter API (free, no API key required)
    const currencies = ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'PLN'].filter(c => c !== base);
    const apiUrl = `https://api.frankfurter.app/latest?from=${base}&to=${currencies.join(',')}`;
    
    console.log(`Fetching from Frankfurter API: ${apiUrl}`);
    
    let rates: Record<string, number>;
    let timestamp: string;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      rates = { [base]: 1, ...data.rates };
      timestamp = new Date().toISOString();
      
      console.log('Successfully fetched live rates:', rates);
      
      // Cache the rates
      await supabase
        .from('system_cache')
        .upsert({
          key: cacheKey,
          value: { rates, timestamp, base },
          updated_at: timestamp,
        }, { onConflict: 'key' });
      
    } catch (apiError) {
      console.warn('Failed to fetch live rates, using fallback:', apiError);
      
      // Convert fallback rates to requested base
      if (base === 'GBP') {
        rates = FALLBACK_RATES;
      } else {
        const baseRate = FALLBACK_RATES[base] || 1;
        rates = {};
        for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
          rates[currency] = rate / baseRate;
        }
      }
      timestamp = new Date().toISOString();
    }
    
    return new Response(JSON.stringify({
      rates,
      timestamp,
      base,
      cached: false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-exchange-rates:', error);
    
    // Return fallback rates on any error
    return new Response(JSON.stringify({
      rates: FALLBACK_RATES,
      timestamp: new Date().toISOString(),
      base: 'GBP',
      cached: false,
      fallback: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
