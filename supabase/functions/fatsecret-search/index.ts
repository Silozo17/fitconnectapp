import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_URL = 'https://platform.fatsecret.com/rest/server.api';

// OAuth 1.0 HMAC-SHA1 signature generation
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

// RFC 3986 percent encoding (required for OAuth 1.0)
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

// Generate OAuth 1.0 signed request
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

  // OAuth 1.0 parameters
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_version: '1.0',
  };

  // Combine all params for signature
  const allParams = { ...params, ...oauthParams };

  // Sort and encode params for signature base string
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  // Create signature base string: METHOD&URL&PARAMS
  const signatureBaseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  
  console.log('Signature base string (first 200 chars):', signatureBaseString.substring(0, 200));

  // Signing key for 2-legged OAuth (no access token): consumerSecret&
  const signingKey = `${percentEncode(consumerSecret)}&`;

  // Generate HMAC-SHA1 signature
  const signature = await hmacSha1(signingKey, signatureBaseString);
  
  console.log('Generated OAuth signature');

  return {
    ...allParams,
    oauth_signature: signature,
  };
}

// v1 API returns food_description as text like:
// "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
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
    const parts = description.split(' - ');
    if (parts.length < 2) return null;
    
    const servingPart = parts[0];
    const nutritionPart = parts.slice(1).join(' - ');
    
    const isPer100g = /per\s+100\s*g/i.test(servingPart);
    
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

    const { calories, fat, carbs, protein, isPer100g, servingPart } = parsed;

    return {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: servingPart.replace(/^Per\s+/i, ''),
      serving_size_g: isPer100g ? 100 : 0,
      calories_per_100g: isPer100g ? calories : calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: 0,
    };
  } catch (error) {
    console.error('Error normalizing food:', food.food_name, error);
    return null;
  }
}

serve(async (req) => {
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

    console.log(`FatSecret OAuth 1.0 search: "${query}" (max ${maxResults} results)`);

    // API parameters (without OAuth)
    const apiParams = {
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: String(maxResults),
    };

    // Generate OAuth 1.0 signed params
    const signedParams = await generateOAuthParams('POST', API_URL, apiParams);

    // Make the API call with all params in body
    const searchResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(signedParams),
    });

    const responseText = await searchResponse.text();
    console.log('FatSecret raw response:', responseText.substring(0, 500));

    if (!searchResponse.ok) {
      console.error('FatSecret search error:', responseText);
      throw new Error(`FatSecret search failed: ${searchResponse.status}`);
    }

    const searchData = JSON.parse(responseText);
    
    // Check for API errors
    if (searchData.error) {
      console.error('FatSecret API error:', searchData.error);
      throw new Error(`FatSecret API error: ${searchData.error.message || JSON.stringify(searchData.error)}`);
    }
    
    const foodsRaw = searchData.foods?.food || [];
    console.log('Foods found:', Array.isArray(foodsRaw) ? foodsRaw.length : (foodsRaw ? 1 : 0));
    
    const foodsArray = Array.isArray(foodsRaw) ? foodsRaw : (foodsRaw ? [foodsRaw] : []);

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
