import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// TYPES
// =====================================

type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

interface AIFood {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AIMeal {
  name: string;
  time: string;
  foods: AIFood[];
}

interface AIMealPlan {
  meals: AIMeal[];
}

interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ValidationResult {
  isValid: boolean;
  isWithinTolerance: boolean;
  actualTotals: MacroTargets;
  discrepancy: {
    calories: number;
    caloriePercent: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  warnings: string[];
  errors: string[];
}

// =====================================
// DIET CONSTRAINTS (Same as macro calculator)
// =====================================

const DIET_CONSTRAINTS: Record<DietaryPreference, {
  name: string;
  carbsGrams?: { min: number; max: number };
  description: string;
  foodGuidance: string;
  avoidFoods?: string;
}> = {
  balanced: {
    name: 'Balanced',
    description: 'Flexible macro distribution',
    foodGuidance: 'Include a variety of whole grains, lean proteins, fruits, vegetables, and healthy fats',
  },
  high_protein: {
    name: 'High Protein',
    description: 'Elevated protein for muscle retention',
    foodGuidance: 'Emphasize protein-rich foods at every meal: lean meats, fish, eggs, Greek yogurt, cottage cheese, legumes',
  },
  low_carb: {
    name: 'Low Carb',
    carbsGrams: { min: 70, max: 130 },
    description: 'Moderate carb restriction (NOT ketogenic)',
    foodGuidance: 'Focus on proteins, vegetables, and healthy fats. Limit grains, bread, pasta',
    avoidFoods: 'Limit: bread, pasta, rice, potatoes, sugary foods',
  },
  keto: {
    name: 'Ketogenic',
    carbsGrams: { min: 20, max: 30 },
    description: 'Very low carb for ketosis',
    foodGuidance: 'High-fat foods: avocado, olive oil, nuts, fatty fish, eggs, cheese, meat',
    avoidFoods: 'AVOID: grains, bread, pasta, rice, potatoes, sugary foods, most fruits, beans',
  },
  vegan: {
    name: 'Vegan',
    description: 'Plant-based only',
    foodGuidance: 'Plant proteins: tofu, tempeh, seitan, legumes, edamame, quinoa, lentils, nuts',
    avoidFoods: 'NO: meat, fish, dairy, eggs, honey',
  },
};

// =====================================
// VALIDATION FUNCTIONS
// =====================================

function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

function calculateMealPlanTotals(mealPlan: AIMealPlan): MacroTargets {
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

  for (const meal of mealPlan.meals) {
    for (const food of meal.foods) {
      const actualCalories = recalculateCalories(food.protein, food.carbs, food.fat);
      totalCalories += actualCalories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
  };
}

function fixFoodCalories(mealPlan: AIMealPlan): AIMealPlan {
  return {
    meals: mealPlan.meals.map(meal => ({
      ...meal,
      foods: meal.foods.map(food => ({
        ...food,
        calories: recalculateCalories(food.protein, food.carbs, food.fat),
        protein: Math.round(food.protein * 10) / 10,
        carbs: Math.round(food.carbs * 10) / 10,
        fat: Math.round(food.fat * 10) / 10,
      })),
    })),
  };
}

function scaleMealPortions(mealPlan: AIMealPlan, targetCalories: number): AIMealPlan {
  const currentTotals = calculateMealPlanTotals(mealPlan);
  if (currentTotals.calories === 0) return mealPlan;
  
  const scaleFactor = targetCalories / currentTotals.calories;
  if (scaleFactor < 0.5 || scaleFactor > 2.0) {
    console.warn(`Scale factor ${scaleFactor.toFixed(2)} too extreme`);
    return mealPlan;
  }
  
  console.log(`Scaling by ${scaleFactor.toFixed(3)} to match ${targetCalories} kcal`);
  
  return {
    meals: mealPlan.meals.map(meal => ({
      ...meal,
      foods: meal.foods.map(food => {
        const scaledProtein = Math.round(food.protein * scaleFactor * 10) / 10;
        const scaledCarbs = Math.round(food.carbs * scaleFactor * 10) / 10;
        const scaledFat = Math.round(food.fat * scaleFactor * 10) / 10;
        return {
          ...food,
          protein: scaledProtein,
          carbs: scaledCarbs,
          fat: scaledFat,
          calories: recalculateCalories(scaledProtein, scaledCarbs, scaledFat),
          serving: scaleFactor !== 1 ? `${food.serving} (adjusted)` : food.serving,
        };
      }),
    })),
  };
}

function validateMealPlan(mealPlan: AIMealPlan, targets: MacroTargets, tolerancePercent: number = 10): ValidationResult {
  const actualTotals = calculateMealPlanTotals(mealPlan);
  const warnings: string[] = [];
  const errors: string[] = [];
  
  const calorieDiff = actualTotals.calories - targets.calories;
  const caloriePercent = Math.abs(calorieDiff / targets.calories) * 100;
  
  const discrepancy = {
    calories: calorieDiff,
    caloriePercent: Math.round(caloriePercent * 10) / 10,
    protein: actualTotals.protein - targets.protein,
    carbs: actualTotals.carbs - targets.carbs,
    fat: actualTotals.fat - targets.fat,
  };
  
  const isWithinTolerance = caloriePercent <= tolerancePercent;
  
  if (!isWithinTolerance) {
    errors.push(`Calories (${actualTotals.calories}) ${Math.round(caloriePercent)}% off target (${targets.calories})`);
  } else if (caloriePercent > 5) {
    warnings.push(`Calories slightly off by ${Math.round(caloriePercent)}%`);
  }
  
  const proteinDiffPercent = Math.abs(discrepancy.protein / targets.protein) * 100;
  if (proteinDiffPercent > 15) {
    warnings.push(`Protein ${discrepancy.protein > 0 ? 'exceeds' : 'below'} target by ${Math.round(proteinDiffPercent)}%`);
  }
  
  return { isValid: errors.length === 0, isWithinTolerance, actualTotals, discrepancy, warnings, errors };
}

/**
 * Validate diet-specific constraints
 */
function validateDietConstraints(
  totals: MacroTargets,
  diet: DietaryPreference
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = DIET_CONSTRAINTS[diet];
  
  if (config.carbsGrams) {
    if (totals.carbs > config.carbsGrams.max + 15) {
      errors.push(`Carbs (${totals.carbs}g) exceed ${diet} limit of ${config.carbsGrams.max}g`);
    } else if (totals.carbs > config.carbsGrams.max) {
      warnings.push(`Carbs (${totals.carbs}g) slightly above ${diet} target`);
    }
  }
  
  return { isValid: errors.length === 0, errors, warnings };
}

function calculatePerMealTargets(dailyCalories: number, mealCount: number = 4): string {
  const configs: Record<number, Array<{ name: string; pct: number }>> = {
    3: [{ name: 'Breakfast', pct: 0.25 }, { name: 'Lunch', pct: 0.40 }, { name: 'Dinner', pct: 0.35 }],
    4: [{ name: 'Breakfast', pct: 0.25 }, { name: 'Lunch', pct: 0.35 }, { name: 'Dinner', pct: 0.30 }, { name: 'Snack', pct: 0.10 }],
    5: [{ name: 'Breakfast', pct: 0.20 }, { name: 'Morning Snack', pct: 0.10 }, { name: 'Lunch', pct: 0.30 }, { name: 'Afternoon Snack', pct: 0.10 }, { name: 'Dinner', pct: 0.30 }],
  };
  
  return (configs[mealCount] || configs[4]).map(m => `- ${m.name}: ~${Math.round(dailyCalories * m.pct)} kcal`).join('\n');
}

/**
 * Generate diet-specific prompt instructions
 */
function getDietPromptInstructions(diet: DietaryPreference, targets: MacroTargets): string {
  const config = DIET_CONSTRAINTS[diet];
  const lines: string[] = [];
  
  if (config.carbsGrams) {
    lines.push(`\nCRITICAL DIET CONSTRAINT (${config.name}):`);
    lines.push(`- Total carbs MUST be between ${config.carbsGrams.min}g and ${config.carbsGrams.max}g`);
    lines.push(`- Target carbs: ${targets.carbs}g (stay within ${config.carbsGrams.min}-${config.carbsGrams.max}g range)`);
  }
  
  if (config.foodGuidance) {
    lines.push(`\nFood guidance: ${config.foodGuidance}`);
  }
  
  if (config.avoidFoods) {
    lines.push(`${config.avoidFoods}`);
  }
  
  return lines.join('\n');
}

// =====================================
// AI CALL WITH RETRY
// =====================================

async function callAIWithRetry(
  apiKey: string,
  targets: MacroTargets,
  preferences: string | undefined,
  dietType: DietaryPreference,
  maxRetries: number = 2
): Promise<{ mealPlan: AIMealPlan; validation: ValidationResult; attempts: number }> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`AI meal generation attempt ${attempt}/${maxRetries} for ${dietType} diet`);
    
    const strictnessNote = attempt > 1 
      ? `\n\nIMPORTANT: Previous attempt had incorrect totals. Be VERY precise. Sum MUST equal targets.`
      : '';
    
    const dietInstructions = getDietPromptInstructions(dietType, targets);
    
    const systemPrompt = `You are a professional nutritionist creating accurate meal plans.

CRITICAL RULES:
1. Each food's calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9)
2. Use realistic nutrition values for common foods
3. TOTAL of all foods MUST hit daily targets closely
4. Distribute calories appropriately across meals
${dietInstructions}
${strictnessNote}`;

    const perMealTargets = calculatePerMealTargets(targets.calories, 4);
    
    const userPrompt = `Create a ${DIET_CONSTRAINTS[dietType].name} meal plan matching these EXACT targets:
- Total Daily Calories: ${targets.calories} kcal
- Protein: ${targets.protein}g
- Carbohydrates: ${targets.carbs}g
- Fat: ${targets.fat}g

Per-meal distribution:
${perMealTargets}
${preferences ? `\nAdditional preferences: ${preferences}` : ''}

Provide 4-5 meals with accurate nutrition values that sum to daily targets.`;

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
            name: "create_meal_plan",
            description: "Create meal plan. calories = (protein×4)+(carbs×4)+(fat×9)",
            parameters: {
              type: "object",
              properties: {
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      time: { type: "string" },
                      foods: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            serving: { type: "string" },
                            calories: { type: "number" },
                            protein: { type: "number" },
                            carbs: { type: "number" },
                            fat: { type: "number" },
                          },
                          required: ["name", "serving", "calories", "protein", "carbs", "fat"],
                        },
                      },
                    },
                    required: ["name", "time", "foods"],
                  },
                },
              },
              required: ["meals"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_meal_plan" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI error:', response.status, errorText);
      if (response.status === 429) throw new Error('Rate limit exceeded');
      if (response.status === 402) throw new Error('AI credits exhausted');
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      if (attempt < maxRetries) continue;
      throw new Error('Failed to generate meal plan');
    }

    try {
      let rawMealPlan: AIMealPlan = JSON.parse(toolCall.function.arguments);
      rawMealPlan = fixFoodCalories(rawMealPlan);
      let validation = validateMealPlan(rawMealPlan, targets, 10);
      
      // Check diet constraints
      const dietValidation = validateDietConstraints(validation.actualTotals, dietType);
      validation.warnings.push(...dietValidation.warnings);
      validation.errors.push(...dietValidation.errors);
      
      console.log(`Attempt ${attempt}: ${validation.actualTotals.calories} kcal (target: ${targets.calories}), carbs: ${validation.actualTotals.carbs}g`);
      
      // Scale if needed
      if (!validation.isWithinTolerance && validation.discrepancy.caloriePercent < 100) {
        const scaledMealPlan = scaleMealPortions(rawMealPlan, targets.calories);
        const scaledValidation = validateMealPlan(scaledMealPlan, targets, 10);
        
        const scaledDietValidation = validateDietConstraints(scaledValidation.actualTotals, dietType);
        scaledValidation.warnings.push(...scaledDietValidation.warnings);
        scaledValidation.errors.push(...scaledDietValidation.errors);
        
        if (scaledValidation.isWithinTolerance) {
          return { mealPlan: scaledMealPlan, validation: scaledValidation, attempts: attempt };
        }
        
        if (scaledValidation.discrepancy.caloriePercent < validation.discrepancy.caloriePercent) {
          rawMealPlan = scaledMealPlan;
          validation = scaledValidation;
        }
      }
      
      if (validation.isWithinTolerance || attempt === maxRetries) {
        if (!validation.isWithinTolerance) {
          validation.warnings.push(`Plan is ${validation.discrepancy.caloriePercent}% off target`);
        }
        return { mealPlan: rawMealPlan, validation, attempts: attempt };
      }
      
    } catch (parseError) {
      console.error('Parse error:', parseError);
      if (attempt === maxRetries) throw new Error('Failed to parse meal plan');
    }
  }
  
  throw new Error('Failed after retries');
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

    const targets: MacroTargets = { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat };
    const diet: DietaryPreference = dietType || 'balanced';

    if (!targetCalories || targetCalories < 500 || targetCalories > 10000) {
      throw new Error('Invalid calorie target (500-10000)');
    }

    if (structured) {
      console.log('Generating structured meal plan:', targets, 'diet:', diet, 'prefs:', preferences);
      
      const { mealPlan, validation, attempts } = await callAIWithRetry(LOVABLE_API_KEY, targets, preferences, diet, 2);
      
      console.log(`Generated in ${attempts} attempts. Valid: ${validation.isValid}`);
      
      return new Response(JSON.stringify({
        mealPlan,
        dietType: diet,
        validation: {
          totals: validation.actualTotals,
          targets,
          discrepancy: validation.discrepancy,
          warnings: validation.warnings,
          errors: validation.errors,
          isAccurate: validation.isWithinTolerance,
          attempts,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Legacy text response
    const systemPrompt = `You are a nutritionist. Create practical ${DIET_CONSTRAINTS[diet].name} meal plans.`;
    
    const userPrompt = `Create a ${DIET_CONSTRAINTS[diet].name} meal plan for:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbs: ${targetCarbs}g
- Fat: ${targetFat}g
${preferences ? `\nPreferences: ${preferences}` : ''}`;

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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || 'Unable to generate';

    return new Response(JSON.stringify({ suggestion, dietType: diet }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
