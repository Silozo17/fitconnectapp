import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

// =====================================
// OAUTH 1.0 FOR FATSECRET
// =====================================

async function hmacSha1(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21').replace(/\*/g, '%2A')
    .replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
}

async function generateOAuthParams(
  method: string, url: string, params: Record<string, string>
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
  const sortedParams = Object.keys(allParams).sort()
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`).join('&');

  const signatureBaseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&`;
  const signature = await hmacSha1(signingKey, signatureBaseString);

  return { ...allParams, oauth_signature: signature };
}

// =====================================
// TYPES
// =====================================

interface FatSecretFood {
  fatsecret_id: string;
  name: string;
  brand_name: string | null;
  serving_description: string;
  serving_size_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ValidatedSubstitution {
  name: string;
  servingSize: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  whyGoodSubstitute: string;
  prepTips?: string;
  whereToBuy?: string;
  fatsecret_id: string;
  source: 'fatsecret';
  isAIEstimate: false;
}

// =====================================
// FATSECRET SEARCH
// =====================================

async function searchFatSecret(query: string, maxResults: number = 10): Promise<FatSecretFood[]> {
  const apiParams = {
    method: 'foods.search',
    search_expression: query,
    format: 'json',
    max_results: String(maxResults),
  };

  const signedParams = await generateOAuthParams('POST', FATSECRET_API_URL, apiParams);
  const response = await fetch(FATSECRET_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(signedParams),
  });

  if (!response.ok) return [];

  const data = await response.json();
  if (data.error) return [];

  const foodsRaw = data.foods?.food || [];
  const foodsArray = Array.isArray(foodsRaw) ? foodsRaw : (foodsRaw ? [foodsRaw] : []);

  return foodsArray.map((food: {
    food_id: string;
    food_name: string;
    brand_name?: string;
    food_description: string;
  }) => {
    const parsed = parseDescription(food.food_description);
    if (!parsed) return null;
    return {
      fatsecret_id: food.food_id,
      name: food.food_name,
      brand_name: food.brand_name || null,
      serving_description: parsed.servingPart,
      serving_size_g: parsed.servingSizeG,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fat: parsed.fat,
    };
  }).filter((f: FatSecretFood | null): f is FatSecretFood => f !== null);
}

function parseDescription(description: string): { 
  servingPart: string; calories: number; fat: number; carbs: number; protein: number; servingSizeG: number;
} | null {
  try {
    const parts = description.split(' - ');
    if (parts.length < 2) return null;
    
    const servingPart = parts[0];
    const nutritionPart = parts.slice(1).join(' - ');
    
    const per100gMatch = /per\s+100\s*g/i.test(servingPart);
    const gramsMatch = servingPart.match(/per\s+(\d+)\s*g/i);
    const servingSizeG = per100gMatch ? 100 : (gramsMatch ? parseInt(gramsMatch[1]) : 100);
    
    const caloriesMatch = nutritionPart.match(/Calories:\s*([\d.]+)\s*kcal/i);
    const fatMatch = nutritionPart.match(/Fat:\s*([\d.]+)\s*g/i);
    const carbsMatch = nutritionPart.match(/Carbs:\s*([\d.]+)\s*g/i);
    const proteinMatch = nutritionPart.match(/Protein:\s*([\d.]+)\s*g/i);
    
    return {
      servingPart: servingPart.replace(/^Per\s+/i, ''),
      calories: caloriesMatch ? parseFloat(caloriesMatch[1]) : 0,
      fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
      carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0,
      protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
      servingSizeG,
    };
  } catch {
    return null;
  }
}

function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

// =====================================
// AI: GET SUBSTITUTE NAMES
// =====================================

async function getAISubstituteNames(
  apiKey: string,
  foodName: string,
  reason: string,
  dietaryRestrictions?: string[],
  allergies?: string[]
): Promise<{ originalFood: string; substituteNames: string[]; reasons: Record<string, string> }> {
  
  const systemPrompt = `You are a registered dietitian. Suggest food substitutions by NAME ONLY.

CRITICAL RULES:
1. You are NOT a nutrition database - do NOT include any calorie or macro values
2. Suggest ONLY simple, searchable food names (e.g., "chicken breast", "tofu", "tempeh")
3. Use generic ingredient names that would be found in a food database
4. Each substitute should be a single ingredient, not a recipe or dish

GOOD names: chicken breast, tofu, tempeh, cottage cheese, Greek yogurt, salmon, turkey breast
BAD names: grilled herb chicken, protein shake, homemade seitan, Asian-style tofu`;

  const userPrompt = `I need substitutes for: ${foodName}
Reason: ${reason}
${dietaryRestrictions?.length ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${allergies?.length ? `Allergies to avoid: ${allergies.join(', ')}` : ''}

Suggest 5 alternative food NAMES that could replace this. Only provide names and brief reasons.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'suggest_substitute_names',
          description: 'Suggest substitute food NAMES only. No nutrition values.',
          parameters: {
            type: 'object',
            properties: {
              originalFood: { type: 'string' },
              substitutes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Simple food name (e.g., "chicken breast", "tofu")' },
                    whyGoodSubstitute: { type: 'string', description: 'Brief reason why this is a good substitute' },
                    prepTips: { type: 'string' },
                  },
                  required: ['name', 'whyGoodSubstitute'],
                },
              },
            },
            required: ['originalFood', 'substitutes'],
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'suggest_substitute_names' } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('Rate limit exceeded');
    if (response.status === 402) throw new Error('AI credits exhausted');
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    throw new Error('AI did not return substitution suggestions');
  }

  const result = JSON.parse(toolCall.function.arguments);
  
  return {
    originalFood: result.originalFood,
    substituteNames: result.substitutes.map((s: { name: string }) => s.name),
    reasons: result.substitutes.reduce((acc: Record<string, string>, s: { name: string; whyGoodSubstitute: string; prepTips?: string }) => {
      acc[s.name.toLowerCase()] = JSON.stringify({ 
        whyGoodSubstitute: s.whyGoodSubstitute, 
        prepTips: s.prepTips 
      });
      return acc;
    }, {}),
  };
}

// =====================================
// MAIN HANDLER
// =====================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      foodName,
      reason,
      currentMacros,
      dietaryRestrictions,
      allergies,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Finding FatSecret-verified substitutions for:', foodName, 'reason:', reason);

    // Step 1: AI suggests substitute NAMES only
    const { originalFood, substituteNames, reasons } = await getAISubstituteNames(
      LOVABLE_API_KEY, foodName, reason, dietaryRestrictions, allergies
    );
    
    console.log(`AI suggested ${substituteNames.length} substitutes:`, substituteNames);

    // Step 2: Look up each substitute in FatSecret
    const validatedSubstitutions: ValidatedSubstitution[] = [];
    const unavailable: string[] = [];

    for (const subName of substituteNames) {
      const cleanName = subName.toLowerCase()
        .replace(/\s+\(.*?\)/g, '')
        .replace(/grilled|baked|raw|cooked|fresh|organic/gi, '')
        .trim();
      
      const results = await searchFatSecret(cleanName, 5);
      
      if (results.length === 0) {
        // Try simpler search
        const simpler = cleanName.split(' ').slice(0, 2).join(' ');
        const altResults = simpler.length >= 2 ? await searchFatSecret(simpler, 3) : [];
        
        if (altResults.length === 0) {
          unavailable.push(subName);
          continue;
        }
        results.push(...altResults);
      }

      // Pick best match (prefer non-branded)
      let best = results[0];
      for (const food of results) {
        if (!food.brand_name && best.brand_name) {
          best = food;
          break;
        }
      }

      // Get AI reasoning for this substitute
      let whyGoodSubstitute = 'Similar nutritional profile';
      let prepTips: string | undefined;
      
      const reasonData = reasons[subName.toLowerCase()];
      if (reasonData) {
        try {
          const parsed = JSON.parse(reasonData);
          whyGoodSubstitute = parsed.whyGoodSubstitute || whyGoodSubstitute;
          prepTips = parsed.prepTips;
        } catch {
          // Ignore parse errors
        }
      }

      // Scale to match target macros if provided
      let portionMultiplier = 1;
      if (currentMacros?.protein && best.protein > 0) {
        portionMultiplier = currentMacros.protein / best.protein;
        // Clamp to reasonable range
        portionMultiplier = Math.max(0.5, Math.min(3, portionMultiplier));
      }

      const scaledProtein = Math.round(best.protein * portionMultiplier * 10) / 10;
      const scaledCarbs = Math.round(best.carbs * portionMultiplier * 10) / 10;
      const scaledFat = Math.round(best.fat * portionMultiplier * 10) / 10;
      const scaledCalories = recalculateCalories(scaledProtein, scaledCarbs, scaledFat);

      validatedSubstitutions.push({
        name: best.name,
        servingSize: portionMultiplier !== 1 
          ? `${Math.round(best.serving_size_g * portionMultiplier)}g` 
          : best.serving_description,
        macros: {
          calories: scaledCalories,
          protein: scaledProtein,
          carbs: scaledCarbs,
          fat: scaledFat,
        },
        whyGoodSubstitute,
        prepTips,
        fatsecret_id: best.fatsecret_id,
        source: 'fatsecret',
        isAIEstimate: false,
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`Found ${validatedSubstitutions.length} verified substitutions, ${unavailable.length} unavailable`);

    return new Response(JSON.stringify({
      originalFood,
      substitutions: validatedSubstitutions,
      unavailable,
      meta: {
        dataSource: 'fatsecret',
        disclaimer: 'All nutrition data verified by FatSecret food database',
        isAIGenerated: false,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-food-substitutions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const status = errorMessage.includes('Rate limit') ? 429 
      : errorMessage.includes('credits') ? 402 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
