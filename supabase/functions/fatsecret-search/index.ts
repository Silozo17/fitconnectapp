import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token cache to avoid unnecessary OAuth calls
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    console.log('Using cached FatSecret access token');
    return cachedToken.token;
  }

  const clientId = Deno.env.get('FATSECRET_CLIENT_ID');
  const clientSecret = Deno.env.get('FATSECRET_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('FatSecret API credentials not configured');
  }

  console.log('Fetching new FatSecret access token...');

  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'basic',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('FatSecret OAuth error:', errorText);
    throw new Error(`FatSecret OAuth failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the token (expires_in is in seconds, subtract 60s buffer)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  console.log('FatSecret access token obtained successfully');
  return data.access_token;
}

interface FatSecretServing {
  serving_id: string;
  serving_description: string;
  serving_url?: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  number_of_units?: string;
  measurement_description?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  fiber?: string;
}

interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url?: string;
  brand_name?: string;
  servings?: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

interface NormalizedFood {
  fatsecret_id: string;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

function normalizeFood(food: FatSecretFood): NormalizedFood | null {
  try {
    // Get the servings - could be single object or array
    const servingsData = food.servings?.serving;
    if (!servingsData) return null;

    const servings = Array.isArray(servingsData) ? servingsData : [servingsData];
    
    // Prefer 100g serving, otherwise use the first available
    let serving = servings.find(s => 
      s.serving_description?.toLowerCase().includes('100 g') ||
      s.serving_description?.toLowerCase() === '100g'
    );
    
    if (!serving) {
      serving = servings[0];
    }

    if (!serving) return null;

    // Parse serving size in grams
    let servingSizeG = 100;
    if (serving.metric_serving_amount && serving.metric_serving_unit?.toLowerCase() === 'g') {
      servingSizeG = parseFloat(serving.metric_serving_amount) || 100;
    }

    // Get nutritional values (per serving)
    const calories = parseFloat(serving.calories || '0');
    const protein = parseFloat(serving.protein || '0');
    const carbs = parseFloat(serving.carbohydrate || '0');
    const fat = parseFloat(serving.fat || '0');
    const fiber = parseFloat(serving.fiber || '0');

    // Normalize to per 100g
    const multiplier = 100 / servingSizeG;

    return {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: serving.serving_description || `${servingSizeG}g`,
      serving_size_g: servingSizeG,
      calories_per_100g: Math.round(calories * multiplier * 10) / 10,
      protein_g: Math.round(protein * multiplier * 10) / 10,
      carbs_g: Math.round(carbs * multiplier * 10) / 10,
      fat_g: Math.round(fat * multiplier * 10) / 10,
      fiber_g: Math.round(fiber * multiplier * 10) / 10,
    };
  } catch (error) {
    console.error('Error normalizing food:', food.food_name, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 20 } = await req.json();

    if (!query || typeof query !== 'string' || query.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`FatSecret search: "${query}" (max ${maxResults} results)`);

    const accessToken = await getAccessToken();

    // Call FatSecret foods.search API (v2 for detailed serving info)
    const searchUrl = new URL('https://platform.fatsecret.com/rest/server.api');
    searchUrl.searchParams.set('method', 'foods.search.v3');
    searchUrl.searchParams.set('search_expression', query);
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('max_results', String(maxResults));
    searchUrl.searchParams.set('include_food_attributes', 'true');

    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('FatSecret search error:', errorText);
      throw new Error(`FatSecret search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    // Extract foods from response
    const foodsRaw = searchData.foods_search?.results?.food || [];
    const foodsArray = Array.isArray(foodsRaw) ? foodsRaw : [foodsRaw];

    // Normalize foods to our format
    const foods: NormalizedFood[] = foodsArray
      .map(normalizeFood)
      .filter((f): f is NormalizedFood => f !== null);

    console.log(`FatSecret search returned ${foods.length} normalized results`);

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FatSecret search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
