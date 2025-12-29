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

interface FatSecretServingV4 {
  serving_id: string;
  serving_description: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  is_default?: string;
  calories?: string;
  carbohydrate?: string;
  protein?: string;
  fat?: string;
  fiber?: string;
}

interface FatSecretFoodV4 {
  food_id: string;
  food_name: string;
  food_type: string;
  brand_name?: string;
  servings?: { serving: FatSecretServingV4 | FatSecretServingV4[] };
}

interface NormalizedFood {
  fatsecret_id: string;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface IngredientLookupResult {
  ingredient: string;
  found: boolean;
  food: NormalizedFood | null;
  alternatives?: NormalizedFood[];
  error?: string;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

function normalizeServingToGrams(serving: FatSecretServingV4): number {
  if (serving.metric_serving_amount && serving.metric_serving_unit) {
    const amount = parseFloat(serving.metric_serving_amount);
    const unit = serving.metric_serving_unit.toLowerCase();
    if (unit === 'g') return amount;
    if (unit === 'ml') return amount;
    if (unit === 'kg') return amount * 1000;
    if (unit === 'oz') return amount * 28.35;
  }
  
  const desc = serving.serving_description.toLowerCase();
  const gramsMatch = desc.match(/(\d+(?:\.\d+)?)\s*g(?:rams?)?/i);
  if (gramsMatch) return parseFloat(gramsMatch[1]);
  
  if (desc.includes('100g') || desc.includes('100 g')) return 100;
  
  return 100;
}

function normalizeFoodV4(food: FatSecretFoodV4): NormalizedFood | null {
  try {
    if (!food.servings?.serving) return null;
    
    const servingsArray = Array.isArray(food.servings.serving) 
      ? food.servings.serving 
      : [food.servings.serving];
    
    if (servingsArray.length === 0) return null;
    
    const serving = servingsArray.find(s => s.is_default === '1') || servingsArray[0];
    const servingSizeG = normalizeServingToGrams(serving);

    return {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: serving.serving_description.replace(/^Per\s+/i, ''),
      serving_size_g: servingSizeG,
      calories: parseFloat(serving.calories || '0'),
      protein: parseFloat(serving.protein || '0'),
      carbs: parseFloat(serving.carbohydrate || '0'),
      fat: parseFloat(serving.fat || '0'),
      fiber: parseFloat(serving.fiber || '0'),
    };
  } catch (error) {
    console.error('Error normalizing food:', food.food_name, error);
    return null;
  }
}

// =====================================
// FATSECRET SEARCH (V4)
// =====================================

async function searchFatSecret(query: string, region: string, maxResults: number = 5): Promise<NormalizedFood[]> {
  const apiParams: Record<string, string> = {
    method: 'foods.search.v4',
    search_expression: query,
    format: 'json',
    max_results: String(maxResults),
    region: region,
    flag_default_serving: 'true',
  };

  const signedParams = await generateOAuthParams('POST', API_URL, apiParams);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(signedParams),
  });

  if (!response.ok) {
    console.error('FatSecret API error:', response.status);
    return [];
  }

  const data = await response.json();
  
  if (data.error) {
    console.error('FatSecret API error:', data.error);
    return [];
  }

  const foodsRaw = data.foods_search?.results?.food || [];
  const foodsArray = Array.isArray(foodsRaw) ? foodsRaw : (foodsRaw ? [foodsRaw] : []);

  return foodsArray
    .map(normalizeFoodV4)
    .filter((f): f is NormalizedFood => f !== null);
}

// =====================================
// INGREDIENT MATCHING
// =====================================

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = [...words1].filter(w => words2.has(w));
  const union = new Set([...words1, ...words2]);
  
  return intersection.length / union.size;
}

function findBestMatch(query: string, foods: NormalizedFood[]): NormalizedFood | null {
  if (foods.length === 0) return null;
  
  let bestMatch = foods[0];
  let bestScore = 0;
  
  for (const food of foods) {
    const isBranded = food.brand_name !== null;
    const brandPenalty = isBranded ? 0.1 : 0;
    const similarity = calculateSimilarity(query, food.name) - brandPenalty;
    
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = food;
    }
  }
  
  return bestMatch;
}

async function lookupIngredient(ingredientName: string, region: string): Promise<IngredientLookupResult> {
  try {
    const cleanName = ingredientName
      .toLowerCase()
      .replace(/\s+\(.*?\)/g, '')
      .replace(/grilled|baked|raw|cooked|boiled|steamed|fried/gi, '')
      .trim();
    
    console.log(`Looking up ingredient: "${ingredientName}" (cleaned: "${cleanName}", region: ${region})`);
    
    const results = await searchFatSecret(cleanName, region, 10);
    
    if (results.length === 0) {
      const altTerms = [
        ingredientName,
        cleanName.split(' ').slice(0, 2).join(' '),
        cleanName.split(' ')[0],
      ];
      
      for (const term of altTerms) {
        if (term.length >= 2) {
          const altResults = await searchFatSecret(term, region, 5);
          if (altResults.length > 0) {
            const bestMatch = findBestMatch(ingredientName, altResults);
            return {
              ingredient: ingredientName,
              found: true,
              food: bestMatch,
              alternatives: altResults.filter(f => f !== bestMatch).slice(0, 2),
            };
          }
        }
      }
      
      return {
        ingredient: ingredientName,
        found: false,
        food: null,
        error: 'Ingredient not found in FatSecret database',
      };
    }
    
    const bestMatch = findBestMatch(ingredientName, results);
    
    return {
      ingredient: ingredientName,
      found: true,
      food: bestMatch,
      alternatives: results.filter(f => f !== bestMatch).slice(0, 2),
    };
  } catch (error) {
    console.error(`Error looking up ingredient "${ingredientName}":`, error);
    return {
      ingredient: ingredientName,
      found: false,
      food: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================
// MAIN HANDLER
// =====================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, region = 'GB' } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'ingredients must be a non-empty array of strings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (ingredients.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Maximum 50 ingredients per request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRegion = SUPPORTED_REGIONS.includes(region.toUpperCase()) 
      ? region.toUpperCase() 
      : 'GB';

    console.log(`FatSecret batch lookup: ${ingredients.length} ingredients (region: ${validRegion})`);

    const results: IngredientLookupResult[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < ingredients.length; i += batchSize) {
      const batch = ingredients.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(ing => lookupIngredient(ing, validRegion)));
      results.push(...batchResults);
      
      if (i + batchSize < ingredients.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const found = results.filter(r => r.found).length;
    const notFound = results.filter(r => !r.found);

    console.log(`Batch lookup complete: ${found}/${ingredients.length} found`);
    
    if (notFound.length > 0) {
      console.log('Not found:', notFound.map(r => r.ingredient).join(', '));
    }

    return new Response(
      JSON.stringify({
        results,
        summary: {
          total: ingredients.length,
          found,
          notFound: notFound.length,
          notFoundIngredients: notFound.map(r => r.ingredient),
        },
        meta: {
          region: validRegion,
          api_version: 'v4',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FatSecret batch lookup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Batch lookup failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
