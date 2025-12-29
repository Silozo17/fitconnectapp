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
  saturated_fat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

interface FatSecretFoodV4 {
  food_id: string;
  food_name: string;
  food_type: string;
  brand_name?: string;
  servings?: { serving: FatSecretServingV4 | FatSecretServingV4[] };
  food_images?: { food_image: { image_url: string; image_type: string }[] };
  food_attributes?: {
    allergens?: { allergen: { id: string; name: string; value: string }[] };
    preferences?: { preference: { id: string; name: string; value: string }[] };
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
  sugar_g: number;
  sodium_mg: number;
  saturated_fat_g: number;
  image_url: string | null;
  allergens: string[];
  dietary_preferences: string[];
  barcode: string;
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
  
  return 100;
}

function extractAllergens(food: FatSecretFoodV4): string[] {
  const allergens: string[] = [];
  
  if (food.food_attributes?.allergens?.allergen) {
    const allergenList = Array.isArray(food.food_attributes.allergens.allergen) 
      ? food.food_attributes.allergens.allergen 
      : [food.food_attributes.allergens.allergen];
    
    for (const allergen of allergenList) {
      if (allergen.value === '1' || allergen.value?.toLowerCase() === 'true') {
        allergens.push(allergen.name);
      }
    }
  }
  
  return allergens;
}

function extractDietaryPreferences(food: FatSecretFoodV4): string[] {
  const preferences: string[] = [];
  
  if (food.food_attributes?.preferences?.preference) {
    const prefList = Array.isArray(food.food_attributes.preferences.preference)
      ? food.food_attributes.preferences.preference
      : [food.food_attributes.preferences.preference];
    
    for (const pref of prefList) {
      if (pref.value === '1' || pref.value?.toLowerCase() === 'true') {
        preferences.push(pref.name);
      }
    }
  }
  
  return preferences;
}

function extractImageUrl(food: FatSecretFoodV4): string | null {
  if (food.food_images?.food_image && food.food_images.food_image.length > 0) {
    return food.food_images.food_image[0].image_url;
  }
  return null;
}

// =====================================
// MAIN HANDLER
// =====================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode, region = 'GB' } = await req.json();

    if (!barcode || typeof barcode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate barcode format (EAN-13, EAN-8, UPC-A, UPC-E)
    const cleanBarcode = barcode.replace(/\D/g, '');
    if (![8, 12, 13, 14].includes(cleanBarcode.length)) {
      return new Response(
        JSON.stringify({ error: 'Invalid barcode format. Expected EAN-8, EAN-13, UPC-A, or UPC-E' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRegion = SUPPORTED_REGIONS.includes(region.toUpperCase()) 
      ? region.toUpperCase() 
      : 'GB';

    console.log(`FatSecret barcode lookup: "${cleanBarcode}" (region: ${validRegion})`);

    // Step 1: Find food ID from barcode
    const barcodeParams: Record<string, string> = {
      method: 'food.find_id_for_barcode.v2',
      barcode: cleanBarcode,
      format: 'json',
      region: validRegion,
    };

    const signedBarcodeParams = await generateOAuthParams('POST', API_URL, barcodeParams);

    const barcodeResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(signedBarcodeParams),
    });

    if (!barcodeResponse.ok) {
      console.error('FatSecret barcode lookup error:', barcodeResponse.status);
      return new Response(
        JSON.stringify({ found: false, error: 'Barcode lookup failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const barcodeData = await barcodeResponse.json();
    console.log('Barcode lookup response:', JSON.stringify(barcodeData).substring(0, 300));

    if (barcodeData.error || !barcodeData.food_id?.value) {
      console.log('Product not found for barcode:', cleanBarcode);
      return new Response(
        JSON.stringify({ 
          found: false, 
          barcode: cleanBarcode,
          message: 'Product not found in database' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const foodId = barcodeData.food_id.value;
    console.log('Found food ID:', foodId);

    // Step 2: Get full food details using food.get.v4
    const foodParams: Record<string, string> = {
      method: 'food.get.v4',
      food_id: foodId,
      format: 'json',
      include_food_images: 'true',
      include_food_attributes: 'true',
      flag_default_serving: 'true',
    };

    const signedFoodParams = await generateOAuthParams('POST', API_URL, foodParams);

    const foodResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(signedFoodParams),
    });

    if (!foodResponse.ok) {
      console.error('FatSecret food get error:', foodResponse.status);
      return new Response(
        JSON.stringify({ found: false, error: 'Failed to fetch food details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const foodData = await foodResponse.json();
    const food: FatSecretFoodV4 = foodData.food;

    if (!food || !food.servings?.serving) {
      return new Response(
        JSON.stringify({ found: false, error: 'Invalid food data received' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize the food data
    const servingsArray = Array.isArray(food.servings.serving) 
      ? food.servings.serving 
      : [food.servings.serving];
    
    const serving = servingsArray.find(s => s.is_default === '1') || servingsArray[0];
    const servingSizeG = normalizeServingToGrams(serving);
    
    const calories = parseFloat(serving.calories || '0');
    const protein = parseFloat(serving.protein || '0');
    const carbs = parseFloat(serving.carbohydrate || '0');
    const fat = parseFloat(serving.fat || '0');
    const fiber = parseFloat(serving.fiber || '0');
    const sugar = parseFloat(serving.sugar || '0');
    const sodium = parseFloat(serving.sodium || '0');
    const saturatedFat = parseFloat(serving.saturated_fat || '0');
    
    const scaleFactor = servingSizeG > 0 ? 100 / servingSizeG : 1;

    const normalizedFood: NormalizedFood = {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: serving.serving_description || `${servingSizeG}g`,
      serving_size_g: servingSizeG,
      calories_per_100g: Math.round(calories * scaleFactor),
      protein_g: Math.round(protein * scaleFactor * 10) / 10,
      carbs_g: Math.round(carbs * scaleFactor * 10) / 10,
      fat_g: Math.round(fat * scaleFactor * 10) / 10,
      fiber_g: Math.round(fiber * scaleFactor * 10) / 10,
      sugar_g: Math.round(sugar * scaleFactor * 10) / 10,
      sodium_mg: Math.round(sodium * scaleFactor),
      saturated_fat_g: Math.round(saturatedFat * scaleFactor * 10) / 10,
      image_url: extractImageUrl(food),
      allergens: extractAllergens(food),
      dietary_preferences: extractDietaryPreferences(food),
      barcode: cleanBarcode,
    };

    console.log(`Barcode lookup successful: ${normalizedFood.name}`);

    return new Response(
      JSON.stringify({ 
        found: true,
        food: normalizedFood,
        meta: {
          region: validRegion,
          barcode: cleanBarcode,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FatSecret barcode error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Barcode lookup failed';
    return new Response(
      JSON.stringify({ found: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
