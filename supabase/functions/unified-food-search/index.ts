import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnifiedFoodResult {
  external_id: string;
  barcode: string | null;
  product_name: string;
  brand: string | null;
  calories_per_100g: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g?: number | null;
  sugar_g?: number | null;
  sodium_mg?: number | null;
  serving_size_g?: number | null;
  food_type: 'product' | 'generic';
  source: 'openfoodfacts' | 'calorieninjas';
  allergens: string[];
  image_url: string | null;
  score?: number;
}

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

// Determine if query looks like a generic food search
function isGenericFoodQuery(query: string): boolean {
  const queryLower = query.toLowerCase().trim();
  
  // Check for brand indicators
  const brandIndicators = ['®', '™', 'brand', 'by '];
  if (brandIndicators.some(indicator => queryLower.includes(indicator))) {
    return false;
  }
  
  // Simple words without numbers are likely generic
  const hasNumbers = /\d/.test(query);
  const wordCount = queryLower.split(/\s+/).length;
  
  // Short, simple queries (1-2 words, no numbers) are likely generic
  if (wordCount <= 2 && !hasNumbers) {
    return true;
  }
  
  return false;
}

// Calculate ranking score for search results
function calculateRankingScore(item: UnifiedFoodResult, query: string, prioritizeGeneric: boolean): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const nameLower = (item.product_name || '').toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  
  // Food type priority
  if (prioritizeGeneric && item.food_type === 'generic') {
    score += 200;
  } else if (!prioritizeGeneric && item.food_type === 'product') {
    score += 50;
  }
  
  // Prefix match on product_name (high priority)
  if (nameLower.startsWith(queryLower)) {
    score += 100;
  } else if (nameLower.includes(queryLower)) {
    score += 50;
  }
  
  // Brand match
  if (brandLower && brandLower.includes(queryLower)) {
    score += 20;
  }
  
  // Prefer complete nutrition data
  if (item.calories_per_100g && item.protein_g && item.carbs_g && item.fat_g) {
    score += 15;
  }
  
  return score;
}

// Deduplicate results by similar names
function deduplicateResults(results: UnifiedFoodResult[]): UnifiedFoodResult[] {
  const seen = new Map<string, UnifiedFoodResult>();
  
  for (const item of results) {
    // Create a simplified key for deduplication
    const key = item.product_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!seen.has(key)) {
      seen.set(key, item);
    } else {
      // Prefer item with more complete data or generic foods
      const existing = seen.get(key)!;
      const existingComplete = !!(existing.calories_per_100g && existing.protein_g);
      const newComplete = !!(item.calories_per_100g && item.protein_g);
      
      if (newComplete && !existingComplete) {
        seen.set(key, item);
      } else if (item.food_type === 'generic' && existing.food_type !== 'generic') {
        seen.set(key, item);
      }
    }
  }
  
  return Array.from(seen.values());
}

// Call CalorieNinjas edge function
async function searchCalorieNinjas(
  supabaseUrl: string,
  query: string,
  limit: number
): Promise<UnifiedFoodResult[]> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/calorieninjas-search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({ query, limit }),
      }
    );
    
    if (!response.ok) {
      console.error(`[Unified Search] CalorieNinjas error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('[Unified Search] CalorieNinjas fetch error:', error);
    return [];
  }
}

// Search local autocomplete cache
async function searchLocalCache(
  supabaseClient: any,
  query: string,
  country: string,
  limit: number,
  offset: number
): Promise<{ results: UnifiedFoodResult[]; total: number }> {
  const searchPattern = `%${query.toLowerCase()}%`;
  
  const { count: totalCount } = await supabaseClient
    .from('foods_autocomplete')
    .select('*', { count: 'exact', head: true })
    .eq('country', country.toUpperCase())
    .or(`product_name.ilike.${searchPattern},brand.ilike.${searchPattern},search_text.ilike.${searchPattern}`);

  const { data, error } = await supabaseClient
    .from('foods_autocomplete')
    .select('external_id, barcode, product_name, brand, calories_per_100g, protein_g, carbs_g, fat_g, image_url, food_type, allergens, popularity_score, source')
    .eq('country', country.toUpperCase())
    .or(`product_name.ilike.${searchPattern},brand.ilike.${searchPattern},search_text.ilike.${searchPattern}`)
    .order('popularity_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[Unified Search] Cache query error:', error);
    return { results: [], total: 0 };
  }

  const results: UnifiedFoodResult[] = (data || []).map((item: any) => ({
    ...item,
    source: item.source || 'openfoodfacts',
    allergens: item.allergens || [],
  }));

  return { results, total: totalCount || 0 };
}

// Search Open Food Facts API (fallback)
async function searchOpenFoodFacts(
  query: string,
  country: string,
  limit: number
): Promise<UnifiedFoodResult[]> {
  const subdomain = COUNTRY_DOMAINS[country.toUpperCase()] || 'world';
  const searchUrl = `https://${subdomain}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${limit}`;
  
  try {
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'FitConnect/1.0 (fitness app)' }
    });

    if (!response.ok) {
      console.error(`[Unified Search] OFF API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const products = data.products || [];
    
    return products
      .filter((p: any) => p.product_name)
      .map((product: any) => {
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
          food_type: 'product' as const,
          source: 'openfoodfacts' as const,
          allergens: (product.allergens_tags || []).map((tag: string) => {
            const parts = tag.split(':');
            return parts.length > 1 ? parts[1].toLowerCase() : tag.toLowerCase();
          }),
        };
      });
  } catch (error) {
    console.error('[Unified Search] OFF fetch error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, country = 'GB', limit = 10, offset = 0 } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [], total: 0, hasMore: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    console.log(`[Unified Search] Query: "${query}" country: ${country} limit: ${limit} offset: ${offset}`);

    const isGeneric = isGenericFoodQuery(query);
    let allResults: UnifiedFoodResult[] = [];
    let totalCount = 0;

    // On first page, fetch from both sources in parallel
    if (offset === 0) {
      const [calorieNinjasResults, cacheData] = await Promise.all([
        searchCalorieNinjas(supabaseUrl, query, limit),
        searchLocalCache(supabaseClient, query, country, limit * 2, 0),
      ]);

      allResults = [...calorieNinjasResults, ...cacheData.results];
      
      // If cache had few results, try OFF API
      if (cacheData.results.length < 5) {
        const offResults = await searchOpenFoodFacts(query, country, limit);
        allResults = [...allResults, ...offResults];
      }
      
      totalCount = Math.max(calorieNinjasResults.length + cacheData.total, allResults.length);
    } else {
      // For pagination, only query cache (CalorieNinjas doesn't support pagination well)
      const cacheData = await searchLocalCache(supabaseClient, query, country, limit, offset);
      allResults = cacheData.results;
      totalCount = cacheData.total;
    }

    // Deduplicate results
    const deduped = deduplicateResults(allResults);

    // Score and sort results
    const scored = deduped.map(item => ({
      ...item,
      score: calculateRankingScore(item, query, isGeneric),
    }));

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Apply limit
    const finalResults = scored.slice(0, limit);
    const hasMore = offset + limit < totalCount || scored.length > limit;

    console.log(`[Unified Search] Returning ${finalResults.length} results (${finalResults.filter(r => r.food_type === 'generic').length} generic, ${finalResults.filter(r => r.food_type === 'product').length} branded)`);

    return new Response(
      JSON.stringify({ 
        results: finalResults,
        total: totalCount,
        hasMore,
        isGenericQuery: isGeneric,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[Unified Search] Error:', error);
    return new Response(
      JSON.stringify({ 
        results: [], 
        error: error instanceof Error ? error.message : 'Unknown error',
        total: 0,
        hasMore: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
