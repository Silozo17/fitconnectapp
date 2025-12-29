import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://platform.fatsecret.com/rest/server.api';

// Supported FatSecret regions
const SUPPORTED_REGIONS = ['GB', 'US', 'AU', 'CA', 'IE', 'NZ', 'FR', 'DE', 'IT', 'ES', 'PL'];

// =====================================
// OAUTH 1.0 AUTHENTICATION
// =====================================

async function hmacSha1(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

async function generateOAuthParams(
  method: string,
  url: string,
  params: Record<string, string>
): Promise<Record<string, string>> {
  const consumerKey = Deno.env.get('FATSECRET_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('FATSECRET_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('FatSecret API credentials not configured');
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_version: '1.0',
  };

  const allParams = { ...params, ...oauthParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  const signatureBaseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&`;
  const signature = await hmacSha1(signingKey, signatureBaseString);

  return { ...allParams, oauth_signature: signature };
}

// =====================================
// TYPES
// =====================================

interface AutocompleteSuggestion {
  text: string;
  type: 'food' | 'brand' | 'generic';
}

// =====================================
// MAIN HANDLER
// =====================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 10, region = 'GB' } = await req.json();

    if (!query || typeof query !== 'string' || query.length < 1) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRegion = SUPPORTED_REGIONS.includes(region.toUpperCase()) 
      ? region.toUpperCase() 
      : 'GB';

    console.log(`FatSecret autocomplete: "${query}" (region: ${validRegion})`);

    // API parameters for foods.autocomplete.v2
    const apiParams: Record<string, string> = {
      method: 'foods.autocomplete.v2',
      expression: query,
      format: 'json',
      max_results: String(Math.min(maxResults, 20)),
      region: validRegion,
    };

    const signedParams = await generateOAuthParams('POST', API_URL, apiParams);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(signedParams),
    });

    if (!response.ok) {
      console.error('FatSecret autocomplete error:', response.status);
      return new Response(
        JSON.stringify({ suggestions: [], error: 'Autocomplete request failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('FatSecret API error:', data.error);
      return new Response(
        JSON.stringify({ suggestions: [], error: data.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse autocomplete results
    const suggestionsRaw = data.suggestions?.suggestion || [];
    const suggestionsArray = Array.isArray(suggestionsRaw) 
      ? suggestionsRaw 
      : (suggestionsRaw ? [suggestionsRaw] : []);

    const suggestions: AutocompleteSuggestion[] = suggestionsArray.map((s: string | { text: string }) => {
      const text = typeof s === 'string' ? s : s.text;
      
      // Detect if it's likely a brand name (contains parentheses or specific patterns)
      const isBrand = /\([^)]+\)/.test(text) || /^\w+\s+-\s+/.test(text);
      
      return {
        text,
        type: isBrand ? 'brand' : 'generic',
      } as AutocompleteSuggestion;
    });

    console.log(`Autocomplete returned ${suggestions.length} suggestions`);

    return new Response(
      JSON.stringify({ 
        suggestions,
        meta: {
          region: validRegion,
          query,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FatSecret autocomplete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Autocomplete failed';
    return new Response(
      JSON.stringify({ suggestions: [], error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
