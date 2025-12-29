import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for OFF fallback queries (2 minutes)
const fallbackCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// Country code to Open Food Facts subdomain mapping
const COUNTRY_DOMAINS: Record<string, string> = {
  'GB': 'uk',
  'UK': 'uk',
  'PL': 'pl',
  'US': 'us',
  'DE': 'de',
  'FR': 'fr',
  'ES': 'es',
  'IT': 'it',
};

interface AutocompleteSuggestion {
  external_id: string;
  barcode: string | null;
  product_name: string;
  brand: string | null;
  calories_per_100g: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  image_url: string | null;
  food_type: 'product' | 'generic';
  allergens: string[];
  score?: number;
}

function normalizeAllergens(allergensTags: string[] | undefined): string[] {
  if (!allergensTags || !Array.isArray(allergensTags)) return [];
  
  return allergensTags.map(tag => {
    const parts = tag.split(':');
    return parts.length > 1 ? parts[1].toLowerCase() : tag.toLowerCase();
  }).filter(Boolean);
}

function normalizeProductForAutocomplete(product: any): AutocompleteSuggestion | null {
  if (!product || !product.product_name) return null;
  
  const nutriments = product.nutriments || {};
  
  return {
    external_id: product.code || product._id,
    barcode: product.code || null,
    product_name: product.product_name,
    brand: product.brands || null,
    calories_per_100g: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
    protein_g: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
    carbs_g: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
    fat_g: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
    image_url: product.image_front_small_url || product.image_url || null,
    food_type: 'product',
    allergens: normalizeAllergens(product.allergens_tags),
  };
}

async function searchOpenFoodFacts(query: string, region: string, maxResults: number): Promise<AutocompleteSuggestion[]> {
  const cacheKey = `off_${query.toLowerCase()}_${region}`;
  const cached = fallbackCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[OFF Autocomplete] Fallback cache hit for: ${query}`);
    return cached.data;
  }

  const subdomain = COUNTRY_DOMAINS[region.toUpperCase()] || 'world';
  const searchUrl = `https://${subdomain}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${maxResults}`;
  
  console.log(`[OFF Autocomplete] Fallback search: ${query} in ${subdomain}`);
  
  const response = await fetch(searchUrl, {
    headers: { 'User-Agent': 'FitConnect/1.0 (fitness app)' }
  });

  if (!response.ok) {
    console.error(`[OFF Autocomplete] Fallback API error: ${response.status}`);
    return [];
  }

  const data = await response.json();
  const products = data.products || [];
  
  const suggestions = products
    .map(normalizeProductForAutocomplete)
    .filter((s: AutocompleteSuggestion | null): s is AutocompleteSuggestion => s !== null);

  // Cache the results
  fallbackCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });
  
  return suggestions;
}

async function populateAutocompleteCache(suggestions: AutocompleteSuggestion[], country: string, supabaseClient: any) {
  if (suggestions.length === 0) return;
  
  console.log(`[OFF Autocomplete] Populating cache with ${suggestions.length} items from fallback`);
  
  const records = suggestions.map(s => ({
    external_id: s.external_id,
    barcode: s.barcode,
    product_name: s.product_name,
    brand: s.brand,
    country: country.toUpperCase(),
    language: 'en',
    search_text: [s.product_name, s.brand].filter(Boolean).join(' ').toLowerCase(),
    calories_per_100g: s.calories_per_100g,
    protein_g: s.protein_g,
    carbs_g: s.carbs_g,
    fat_g: s.fat_g,
    food_type: s.food_type,
    image_url: s.image_url,
    allergens: s.allergens,
  }));
  
  const { error } = await supabaseClient
    .from('foods_autocomplete')
    .upsert(records, { onConflict: 'external_id,country', ignoreDuplicates: true });
  
  if (error) {
    console.error('[OFF Autocomplete] Failed to populate cache:', error);
  }
}

function calculateRankingScore(item: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const nameLower = (item.product_name || '').toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  
  // Prefix match on product_name (highest priority)
  if (nameLower.startsWith(queryLower)) {
    score += 100;
  } else if (nameLower.includes(queryLower)) {
    score += 50;
  }
  
  // Brand match
  if (brandLower.startsWith(queryLower)) {
    score += 30;
  } else if (brandLower.includes(queryLower)) {
    score += 15;
  }
  
  // Popularity score
  score += (item.popularity_score || 0) * 0.1;
  
  // Prefer products with complete nutrition data
  if (item.calories_per_100g && item.protein_g) {
    score += 10;
  }
  
  return score;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, country = 'GB', language = 'en', limit = 10 } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [], source: 'none' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log(`[OFF Autocomplete] Query: "${query}" country: ${country}`);

    // Query local autocomplete cache first with ranking
    const searchPattern = `%${query.toLowerCase()}%`;
    
    const { data: cachedResults, error: dbError } = await supabaseClient
      .from('foods_autocomplete')
      .select('external_id, barcode, product_name, brand, calories_per_100g, protein_g, carbs_g, fat_g, image_url, food_type, allergens, popularity_score')
      .eq('country', country.toUpperCase())
      .or(`product_name.ilike.${searchPattern},brand.ilike.${searchPattern},search_text.ilike.${searchPattern}`)
      .order('popularity_score', { ascending: false })
      .limit(50); // Get more for ranking

    if (dbError) {
      console.error('[OFF Autocomplete] DB query error:', dbError);
    }

    if (cachedResults && cachedResults.length > 0) {
      console.log(`[OFF Autocomplete] Cache hit: ${cachedResults.length} results`);
      
      // Apply ranking and sort
      const rankedResults = cachedResults
        .map(item => ({
          ...item,
          score: calculateRankingScore(item, query)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return new Response(
        JSON.stringify({ 
          suggestions: rankedResults as AutocompleteSuggestion[],
          source: 'cache',
          total: cachedResults.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache miss - fallback to Open Food Facts API
    console.log(`[OFF Autocomplete] Cache miss, falling back to OFF API`);
    
    const offResults = await searchOpenFoodFacts(query, country, limit * 2);
    
    if (offResults.length > 0) {
      // Populate cache in background
      populateAutocompleteCache(offResults, country, supabaseClient).catch(e =>
        console.error('[OFF Autocomplete] Background cache population failed:', e)
      );
    }

    // Apply ranking to OFF results
    const rankedResults = offResults
      .map(item => ({
        ...item,
        score: calculateRankingScore(item, query)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return new Response(
      JSON.stringify({ 
        suggestions: rankedResults,
        source: 'openfoodfacts',
        total: offResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[OFF Autocomplete] Error:', error);
    return new Response(
      JSON.stringify({ suggestions: [], error: error instanceof Error ? error.message : 'Unknown error', source: 'error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
