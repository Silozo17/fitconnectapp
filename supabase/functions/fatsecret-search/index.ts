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

// v1 API returns food_description as text like:
// "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
// "Per 1 medium - Calories: 95kcal | Fat: 0.31g | Carbs: 25.13g | Protein: 0.47g"
interface FatSecretFoodV1 {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url?: string;
  brand_name?: string;
  food_description: string;
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

function parseDescription(description: string): { 
  servingPart: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  isPer100g: boolean;
} | null {
  try {
    // Format: "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
    // Or: "Per 1 medium - Calories: 95kcal | Fat: 0.31g | Carbs: 25.13g | Protein: 0.47g"
    
    const parts = description.split(' - ');
    if (parts.length < 2) return null;
    
    const servingPart = parts[0]; // "Per 100g" or "Per 1 medium"
    const nutritionPart = parts.slice(1).join(' - '); // The rest
    
    // Check if this is per 100g
    const isPer100g = /per\s+100\s*g/i.test(servingPart);
    
    // Extract values using regex
    const caloriesMatch = nutritionPart.match(/Calories:\s*([\d.]+)\s*kcal/i);
    const fatMatch = nutritionPart.match(/Fat:\s*([\d.]+)\s*g/i);
    const carbsMatch = nutritionPart.match(/Carbs:\s*([\d.]+)\s*g/i);
    const proteinMatch = nutritionPart.match(/Protein:\s*([\d.]+)\s*g/i);
    
    return {
      servingPart,
      calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
      carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
      isPer100g,
    };
  } catch (error) {
    console.error('Error parsing description:', description, error);
    return null;
  }
}

function normalizeFood(food: FatSecretFoodV1): NormalizedFood | null {
  try {
    const parsed = parseDescription(food.food_description);
    if (!parsed) {
      console.log('Could not parse food description:', food.food_name, food.food_description);
      return null;
    }

    // For v1 API, we get values per serving. 
    // If it's per 100g, use directly. Otherwise, we keep the per-serving values
    // but note that we can't normalize without knowing the serving weight
    const { calories, fat, carbs, protein, isPer100g, servingPart } = parsed;

    return {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: servingPart.replace(/^Per\s+/i, ''),
      serving_size_g: isPer100g ? 100 : 0, // 0 means "per serving, unknown grams"
      calories_per_100g: isPer100g ? calories : calories, // Store as-is for now
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: 0, // v1 API doesn't include fiber in description
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

    // Call FatSecret foods.search API (v1 - basic scope)
    const searchUrl = new URL('https://platform.fatsecret.com/rest/server.api');
    searchUrl.searchParams.set('method', 'foods.search');
    searchUrl.searchParams.set('search_expression', query);
    searchUrl.searchParams.set('format', 'json');
    searchUrl.searchParams.set('max_results', String(maxResults));

    console.log('FatSecret API URL:', searchUrl.toString());

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
    
    console.log('FatSecret raw response keys:', Object.keys(searchData));
    
    // v1 API response structure: { foods: { food: [...] } }
    const foodsRaw = searchData.foods?.food || [];
    console.log('Foods found:', Array.isArray(foodsRaw) ? foodsRaw.length : (foodsRaw ? 1 : 0));
    
    const foodsArray = Array.isArray(foodsRaw) ? foodsRaw : (foodsRaw ? [foodsRaw] : []);

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
