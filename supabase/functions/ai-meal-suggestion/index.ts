import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

// =====================================
// TYPES
// =====================================

type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

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

interface MealFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fatsecret_id: string;
  source: 'fatsecret';
  portionMultiplier: number;
}

interface Meal {
  name: string;
  time: string;
  foods: MealFood[];
}

interface MealPlan {
  meals: Meal[];
}

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
// FATSECRET SEARCH
// =====================================

async function searchFatSecret(query: string, maxResults: number = 5): Promise<FatSecretFood[]> {
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

// =====================================
// INGREDIENT LOOKUP
// =====================================

async function lookupIngredient(name: string): Promise<FatSecretFood | null> {
  const cleanName = name.toLowerCase()
    .replace(/\s+\(.*?\)/g, '')
    .replace(/grilled|baked|raw|cooked|boiled|steamed|fried|fresh|organic/gi, '')
    .trim();

  const results = await searchFatSecret(cleanName, 10);
  if (results.length === 0) {
    // Try simpler search
    const simpler = cleanName.split(' ').slice(0, 2).join(' ');
    if (simpler.length >= 2) {
      const altResults = await searchFatSecret(simpler, 5);
      if (altResults.length > 0) return findBestMatch(name, altResults);
    }
    return null;
  }
  return findBestMatch(name, results);
}

function findBestMatch(query: string, foods: FatSecretFood[]): FatSecretFood | null {
  if (foods.length === 0) return null;
  
  const q = query.toLowerCase();
  let best = foods[0];
  let bestScore = 0;
  
  for (const food of foods) {
    const name = food.name.toLowerCase();
    let score = 0;
    
    if (name === q) score = 1.0;
    else if (name.includes(q) || q.includes(name)) score = 0.8;
    else {
      const qWords = new Set(q.split(/\s+/));
      const nWords = new Set(name.split(/\s+/));
      const overlap = [...qWords].filter(w => nWords.has(w)).length;
      score = overlap / Math.max(qWords.size, nWords.size);
    }
    
    // Prefer generic over branded
    if (food.brand_name) score -= 0.1;
    
    if (score > bestScore) {
      bestScore = score;
      best = food;
    }
  }
  return best;
}

// =====================================
// DIET CONSTRAINTS
// =====================================

const DIET_CONSTRAINTS: Record<DietaryPreference, {
  name: string;
  carbsGrams?: { min: number; max: number };
  foodGuidance: string;
  avoidFoods?: string;
}> = {
  balanced: {
    name: 'Balanced',
    foodGuidance: 'Include whole grains, lean proteins, fruits, vegetables, healthy fats',
  },
  high_protein: {
    name: 'High Protein',
    foodGuidance: 'Emphasize protein-rich foods: lean meats, fish, eggs, Greek yogurt, cottage cheese, legumes',
  },
  low_carb: {
    name: 'Low Carb',
    carbsGrams: { min: 70, max: 130 },
    foodGuidance: 'Focus on proteins, vegetables, healthy fats. Limit grains, bread, pasta',
    avoidFoods: 'Limit: bread, pasta, rice, potatoes, sugary foods',
  },
  keto: {
    name: 'Ketogenic',
    carbsGrams: { min: 20, max: 30 },
    foodGuidance: 'High-fat foods: avocado, olive oil, nuts, fatty fish, eggs, cheese, meat',
    avoidFoods: 'AVOID: grains, bread, pasta, rice, potatoes, sugary foods, most fruits, beans',
  },
  vegan: {
    name: 'Vegan',
    foodGuidance: 'Plant proteins: tofu, tempeh, seitan, legumes, edamame, quinoa, lentils, nuts',
    avoidFoods: 'NO: meat, fish, dairy, eggs, honey',
  },
};

// =====================================
// AI: GET INGREDIENT SUGGESTIONS
// =====================================

async function getAIIngredientSuggestions(
  apiKey: string,
  targets: MacroTargets,
  diet: DietaryPreference,
  preferences: string | undefined
): Promise<{ meals: Array<{ name: string; time: string; ingredients: Array<{ name: string; portionGrams: number }> }> }> {
  
  const config = DIET_CONSTRAINTS[diet];
  
  const systemPrompt = `You are a nutritionist planning meal structures. You suggest INGREDIENT NAMES ONLY.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. You are NOT a nutrition database - do NOT include any calorie or macro values
2. Suggest ONLY simple, searchable food ingredients (e.g., "chicken breast", "brown rice", "broccoli")
3. Use generic ingredient names, not dish names or recipes
4. Avoid compound foods - break them into ingredients
5. Portion sizes should be in grams (e.g., 150)

GOOD ingredient names: chicken breast, brown rice, olive oil, eggs, oats, banana, almonds, salmon, broccoli, sweet potato
BAD ingredient names: grilled herb chicken, homemade stir-fry, mom's casserole, protein shake mix

${config.foodGuidance}
${config.avoidFoods ? config.avoidFoods : ''}
${config.carbsGrams ? `Carb limit: ${config.carbsGrams.min}-${config.carbsGrams.max}g total daily` : ''}`;

  const userPrompt = `Create a ${config.name} meal structure for these daily targets:
- Calories: ${targets.calories} kcal
- Protein: ${targets.protein}g  
- Carbs: ${targets.carbs}g
- Fat: ${targets.fat}g
${preferences ? `\nPreferences: ${preferences}` : ''}

Suggest 4 meals with simple ingredients. Return ONLY ingredient names and portion sizes in grams.`;

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
        type: "function",
        function: {
          name: "suggest_meal_ingredients",
          description: "Suggest meal structure with simple ingredient names. NO macro values - just names and portions.",
          parameters: {
            type: "object",
            properties: {
              meals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Meal name like 'Breakfast' or 'Lunch'" },
                    time: { type: "string", description: "Time like '07:00' or '12:00'" },
                    ingredients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Simple ingredient name (e.g., 'chicken breast', 'rice')" },
                          portionGrams: { type: "number", description: "Portion size in grams" },
                        },
                        required: ["name", "portionGrams"],
                      },
                    },
                  },
                  required: ["name", "time", "ingredients"],
                },
              },
            },
            required: ["meals"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "suggest_meal_ingredients" } },
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
    throw new Error('AI did not return ingredient suggestions');
  }

  return JSON.parse(toolCall.function.arguments);
}

// =====================================
// MEAL PLAN BUILDER
// =====================================

function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

async function buildMealPlan(
  aiSuggestions: { meals: Array<{ name: string; time: string; ingredients: Array<{ name: string; portionGrams: number }> }> },
  targets: MacroTargets
): Promise<{ mealPlan: MealPlan; unavailable: string[]; validation: object }> {
  
  const meals: Meal[] = [];
  const unavailable: string[] = [];
  const ingredientCache: Map<string, FatSecretFood | null> = new Map();

  // Look up all ingredients
  for (const aiMeal of aiSuggestions.meals) {
    const mealFoods: MealFood[] = [];

    for (const ingredient of aiMeal.ingredients) {
      const cleanName = ingredient.name.toLowerCase().trim();
      
      // Check cache
      if (!ingredientCache.has(cleanName)) {
        const food = await lookupIngredient(cleanName);
        ingredientCache.set(cleanName, food);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const food = ingredientCache.get(cleanName);
      
      if (!food) {
        unavailable.push(ingredient.name);
        continue;
      }

      // Calculate portion multiplier
      const portionMultiplier = ingredient.portionGrams / food.serving_size_g;
      
      mealFoods.push({
        name: food.name,
        serving: `${ingredient.portionGrams}g`,
        calories: Math.round(food.calories * portionMultiplier),
        protein: Math.round(food.protein * portionMultiplier * 10) / 10,
        carbs: Math.round(food.carbs * portionMultiplier * 10) / 10,
        fat: Math.round(food.fat * portionMultiplier * 10) / 10,
        fatsecret_id: food.fatsecret_id,
        source: 'fatsecret',
        portionMultiplier,
      });
    }

    if (mealFoods.length > 0) {
      meals.push({
        name: aiMeal.name,
        time: aiMeal.time,
        foods: mealFoods,
      });
    }
  }

  // Calculate totals
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  for (const meal of meals) {
    for (const food of meal.foods) {
      // Recalculate calories from macros for accuracy
      const actualCal = recalculateCalories(food.protein, food.carbs, food.fat);
      food.calories = actualCal;
      totalCalories += actualCal;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    }
  }

  // Scale portions if needed
  const calorieRatio = targets.calories / totalCalories;
  if (calorieRatio >= 0.5 && calorieRatio <= 2.0 && Math.abs(calorieRatio - 1) > 0.05) {
    console.log(`Scaling portions by ${calorieRatio.toFixed(2)} to match ${targets.calories} kcal`);
    
    for (const meal of meals) {
      for (const food of meal.foods) {
        food.protein = Math.round(food.protein * calorieRatio * 10) / 10;
        food.carbs = Math.round(food.carbs * calorieRatio * 10) / 10;
        food.fat = Math.round(food.fat * calorieRatio * 10) / 10;
        food.calories = recalculateCalories(food.protein, food.carbs, food.fat);
        
        // Update serving description
        const origGrams = parseFloat(food.serving) || 100;
        food.serving = `${Math.round(origGrams * calorieRatio)}g (adjusted)`;
      }
    }
    
    // Recalculate totals after scaling
    totalCalories = 0; totalProtein = 0; totalCarbs = 0; totalFat = 0;
    for (const meal of meals) {
      for (const food of meal.foods) {
        totalCalories += food.calories;
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFat += food.fat;
      }
    }
  }

  const calorieDiff = totalCalories - targets.calories;
  const caloriePercent = Math.abs(calorieDiff / targets.calories) * 100;
  
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (unavailable.length > 0) {
    warnings.push(`${unavailable.length} ingredient(s) not found in database`);
  }
  if (caloriePercent > 10) {
    errors.push(`Calories ${Math.round(caloriePercent)}% off target`);
  } else if (caloriePercent > 5) {
    warnings.push(`Calories slightly off by ${Math.round(caloriePercent)}%`);
  }

  return {
    mealPlan: { meals },
    unavailable,
    validation: {
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      },
      targets,
      discrepancy: {
        calories: Math.round(calorieDiff),
        caloriePercent: Math.round(caloriePercent * 10) / 10,
        protein: Math.round(totalProtein - targets.protein),
        carbs: Math.round(totalCarbs - targets.carbs),
        fat: Math.round(totalFat - targets.fat),
      },
      warnings,
      errors,
      isAccurate: caloriePercent <= 10,
      dataSource: 'fatsecret',
    },
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
    const { targetCalories, targetProtein, targetCarbs, targetFat, preferences, structured, dietType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const targets: MacroTargets = { 
      calories: targetCalories, 
      protein: targetProtein, 
      carbs: targetCarbs, 
      fat: targetFat 
    };
    const diet: DietaryPreference = dietType || 'balanced';

    if (!targetCalories || targetCalories < 500 || targetCalories > 10000) {
      throw new Error('Invalid calorie target (500-10000)');
    }

    if (structured) {
      console.log(`Generating FatSecret-grounded meal plan: ${targets.calories} kcal, diet: ${diet}`);
      
      // Step 1: AI suggests ingredient names only
      const aiSuggestions = await getAIIngredientSuggestions(LOVABLE_API_KEY, targets, diet, preferences);
      console.log(`AI suggested ${aiSuggestions.meals.length} meals with ingredients`);
      
      // Step 2: Look up each ingredient in FatSecret and build meal plan
      const { mealPlan, unavailable, validation } = await buildMealPlan(aiSuggestions, targets);
      
      if (unavailable.length > 0) {
        console.log(`Unavailable ingredients: ${unavailable.join(', ')}`);
      }
      
      console.log(`Meal plan built with ${mealPlan.meals.length} meals, validation:`, validation);
      
      return new Response(JSON.stringify({
        mealPlan,
        dietType: diet,
        validation,
        unavailableIngredients: unavailable,
        meta: {
          dataSource: 'fatsecret',
          disclaimer: 'All nutrition data verified by FatSecret food database',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Legacy text response (non-structured)
    const config = DIET_CONSTRAINTS[diet];
    const systemPrompt = `You are a nutritionist. Create practical ${config.name} meal plans using simple, common ingredients.`;
    
    const userPrompt = `Create a ${config.name} meal plan for:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbs: ${targetCarbs}g
- Fat: ${targetFat}g
${preferences ? `\nPreferences: ${preferences}` : ''}

List meals with simple ingredients. Note: Exact nutrition values will be looked up from a food database.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded');
      if (response.status === 402) throw new Error('AI credits exhausted');
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Unable to generate meal plan';

    return new Response(JSON.stringify({ suggestion: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI meal suggestion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const status = errorMessage.includes('Rate limit') ? 429 
      : errorMessage.includes('credits') ? 402 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
