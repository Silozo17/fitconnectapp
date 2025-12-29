import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache with TTL (2 minutes for search results)
const searchCache = new Map<string, { data: any; timestamp: number }>();
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

interface NormalizedFood {
  external_id: string;
  barcode: string | null;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  image_url: string | null;
  allergens: string[];
  dietary_preferences: string[];
  food_type: 'product' | 'generic';
}

function normalizeAllergens(allergensTags: string[] | undefined): string[] {
  if (!allergensTags || !Array.isArray(allergensTags)) return [];
  
  return allergensTags.map(tag => {
    // Tags are in format "en:gluten", "en:milk", etc.
    const parts = tag.split(':');
    return parts.length > 1 ? parts[1].toLowerCase() : tag.toLowerCase();
  }).filter(Boolean);
}

function extractDietaryPreferences(product: any): string[] {
  const preferences: string[] = [];
  
  if (product.labels_tags) {
    const labels = product.labels_tags as string[];
    if (labels.some(l => l.includes('vegan'))) preferences.push('vegan');
    if (labels.some(l => l.includes('vegetarian'))) preferences.push('vegetarian');
    if (labels.some(l => l.includes('gluten-free'))) preferences.push('gluten-free');
    if (labels.some(l => l.includes('organic'))) preferences.push('organic');
    if (labels.some(l => l.includes('halal'))) preferences.push('halal');
    if (labels.some(l => l.includes('kosher'))) preferences.push('kosher');
  }
  
  return preferences;
}

function normalizeProduct(product: any): NormalizedFood | null {
  if (!product || !product.product_name) return null;
  
  const nutriments = product.nutriments || {};
  
  return {
    external_id: product.code || product._id,
    barcode: product.code || null,
    name: product.product_name,
    brand_name: product.brands || null,
    serving_description: product.serving_size || '100g',
    serving_size_g: parseFloat(product.serving_quantity) || 100,
    calories_per_100g: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
    protein_g: Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10,
    carbs_g: Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10,
    fat_g: Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10,
    fiber_g: Math.round((nutriments.fiber_100g || nutriments.fiber || 0) * 10) / 10,
    sugar_g: nutriments.sugars_100g ? Math.round(nutriments.sugars_100g * 10) / 10 : null,
    sodium_mg: nutriments.sodium_100g ? Math.round(nutriments.sodium_100g * 1000) : null,
    saturated_fat_g: nutriments['saturated-fat_100g'] ? Math.round(nutriments['saturated-fat_100g'] * 10) / 10 : null,
    image_url: product.image_front_small_url || product.image_url || null,
    allergens: normalizeAllergens(product.allergens_tags),
    dietary_preferences: extractDietaryPreferences(product),
    food_type: 'product',
  };
}

async function populateAutocompleteCache(foods: NormalizedFood[], country: string, supabaseClient: any) {
  if (foods.length === 0) return;
  
  console.log(`[OFF Search] Populating autocomplete cache with ${foods.length} items`);
  
  const records = foods.map(food => ({
    external_id: food.external_id,
    barcode: food.barcode,
    product_name: food.name,
    brand: food.brand_name,
    country: country.toUpperCase(),
    language: 'en',
    search_text: [food.name, food.brand_name].filter(Boolean).join(' ').toLowerCase(),
    calories_per_100g: food.calories_per_100g,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fat_g: food.fat_g,
    food_type: food.food_type,
    image_url: food.image_url,
    allergens: food.allergens,
  }));
  
  // Upsert to avoid duplicates
  const { error } = await supabaseClient
    .from('foods_autocomplete')
    .upsert(records, { onConflict: 'external_id,country', ignoreDuplicates: true });
  
  if (error) {
    console.error('[OFF Search] Failed to populate autocomplete cache:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20, region = 'GB' } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ foods: [], error: 'Query must be at least 2 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first
    const cacheKey = `${query.toLowerCase()}_${region}_${maxResults}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`[OFF Search] Cache hit for: ${query}`);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get country subdomain
    const subdomain = COUNTRY_DOMAINS[region.toUpperCase()] || 'world';
    const searchUrl = `https://${subdomain}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${maxResults}`;
    
    console.log(`[OFF Search] Searching: ${query} in ${subdomain}`);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'FitConnect/1.0 (fitness app)',
      }
    });

    if (!response.ok) {
      console.error(`[OFF Search] API error: ${response.status}`);
      throw new Error(`Open Food Facts API error: ${response.status}`);
    }

    const data = await response.json();
    const products = data.products || [];
    
    const normalizedFoods = products
      .map(normalizeProduct)
      .filter((food: NormalizedFood | null): food is NormalizedFood => food !== null);

    console.log(`[OFF Search] Found ${normalizedFoods.length} products`);

    // Populate autocomplete cache in background
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Don't await - let it run in background
    populateAutocompleteCache(normalizedFoods, region, supabaseClient).catch(e => 
      console.error('[OFF Search] Background cache population failed:', e)
    );

    const result = {
      foods: normalizedFoods,
      meta: {
        region,
        total_results: data.count || normalizedFoods.length,
        source: 'openfoodfacts'
      }
    };

    // Store in cache
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    // Clean old cache entries
    for (const [key, value] of searchCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL_MS) {
        searchCache.delete(key);
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[OFF Search] Error:', error);
    return new Response(
      JSON.stringify({ foods: [], error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
