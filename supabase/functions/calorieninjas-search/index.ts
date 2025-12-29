import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalorieNinjasItem {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

interface NormalizedFood {
  external_id: string;
  barcode: null;
  product_name: string;
  brand: null;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  serving_size_g: number;
  food_type: 'generic';
  source: 'calorieninjas';
  allergens: string[];
  image_url: null;
  score?: number;
}

function normalizeToPerHundredGrams(item: CalorieNinjasItem): NormalizedFood {
  const servingSize = item.serving_size_g || 100;
  const factor = 100 / servingSize;
  
  // Create a unique external ID based on the food name
  const externalId = `cn_${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  
  return {
    external_id: externalId,
    barcode: null,
    product_name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    brand: null,
    calories_per_100g: Math.round(item.calories * factor),
    protein_g: Math.round((item.protein_g * factor) * 10) / 10,
    carbs_g: Math.round((item.carbohydrates_total_g * factor) * 10) / 10,
    fat_g: Math.round((item.fat_total_g * factor) * 10) / 10,
    fiber_g: Math.round((item.fiber_g * factor) * 10) / 10,
    sugar_g: Math.round((item.sugar_g * factor) * 10) / 10,
    sodium_mg: Math.round(item.sodium_mg * factor),
    serving_size_g: servingSize,
    food_type: 'generic',
    source: 'calorieninjas',
    allergens: [],
    image_url: null,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10 } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ results: [], source: 'calorieninjas', total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('CALORIENINJAS_API_KEY');
    if (!apiKey) {
      console.error('[CalorieNinjas] API key not configured');
      return new Response(
        JSON.stringify({ results: [], source: 'calorieninjas', error: 'API key not configured', total: 0 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[CalorieNinjas] Searching for: "${query}"`);

    // CalorieNinjas accepts natural language queries like "100g chicken breast" or "1 apple"
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error(`[CalorieNinjas] API error: ${response.status}`);
      return new Response(
        JSON.stringify({ results: [], source: 'calorieninjas', error: `API error: ${response.status}`, total: 0 }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const items: CalorieNinjasItem[] = data.items || [];
    
    console.log(`[CalorieNinjas] Found ${items.length} items for "${query}"`);

    // Normalize all items to per-100g values
    const normalizedResults = items
      .slice(0, limit)
      .map(normalizeToPerHundredGrams);

    return new Response(
      JSON.stringify({ 
        results: normalizedResults,
        source: 'calorieninjas',
        total: items.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[CalorieNinjas] Error:', error);
    return new Response(
      JSON.stringify({ 
        results: [], 
        error: error instanceof Error ? error.message : 'Unknown error',
        source: 'calorieninjas',
        total: 0
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
