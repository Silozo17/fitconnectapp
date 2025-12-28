import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// TYPES
// =====================================

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
// VALIDATION FUNCTIONS (No AI - Pure Math)
// =====================================

/**
 * Recalculate calories from macros (ground truth formula)
 * Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
 */
function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

/**
 * Calculate meal plan totals from all foods
 */
function calculateMealPlanTotals(mealPlan: AIMealPlan): MacroTargets {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of mealPlan.meals) {
    for (const food of meal.foods) {
      // Use recalculated calories (ground truth)
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

/**
 * Fix each food's calories to match its macros
 */
function fixFoodCalories(mealPlan: AIMealPlan): AIMealPlan {
  const fixedMeals = mealPlan.meals.map((meal) => ({
    ...meal,
    foods: meal.foods.map((food) => ({
      ...food,
      calories: recalculateCalories(food.protein, food.carbs, food.fat),
      protein: Math.round(food.protein * 10) / 10,
      carbs: Math.round(food.carbs * 10) / 10,
      fat: Math.round(food.fat * 10) / 10,
    })),
  }));

  return { meals: fixedMeals };
}

/**
 * Scale all portions to match target calories
 */
function scaleMealPortions(mealPlan: AIMealPlan, targetCalories: number): AIMealPlan {
  const currentTotals = calculateMealPlanTotals(mealPlan);
  
  if (currentTotals.calories === 0) {
    console.warn('Cannot scale: meal plan has 0 calories');
    return mealPlan;
  }
  
  const scaleFactor = targetCalories / currentTotals.calories;
  
  // Don't scale if factor is too extreme (bad data)
  if (scaleFactor < 0.5 || scaleFactor > 2.0) {
    console.warn(`Scale factor ${scaleFactor.toFixed(2)} too extreme, skipping scaling`);
    return mealPlan;
  }
  
  console.log(`Scaling meal plan by factor ${scaleFactor.toFixed(3)} to match ${targetCalories} kcal target`);
  
  const scaledMeals = mealPlan.meals.map(meal => ({
    ...meal,
    foods: meal.foods.map(food => {
      const scaledProtein = Math.round(food.protein * scaleFactor * 10) / 10;
      const scaledCarbs = Math.round(food.carbs * scaleFactor * 10) / 10;
      const scaledFat = Math.round(food.fat * scaleFactor * 10) / 10;
      const scaledCalories = recalculateCalories(scaledProtein, scaledCarbs, scaledFat);
      
      return {
        ...food,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        calories: scaledCalories,
        serving: scaleFactor !== 1 
          ? `${food.serving} (adjusted)` 
          : food.serving,
      };
    }),
  }));
  
  return { meals: scaledMeals };
}

/**
 * Validate meal plan against targets
 */
function validateMealPlan(
  mealPlan: AIMealPlan,
  targets: MacroTargets,
  tolerancePercent: number = 10
): ValidationResult {
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
    const direction = calorieDiff > 0 ? 'above' : 'below';
    errors.push(`Total calories (${actualTotals.calories}) are ${Math.round(caloriePercent)}% ${direction} target (${targets.calories})`);
  } else if (caloriePercent > 5) {
    const direction = calorieDiff > 0 ? 'above' : 'below';
    warnings.push(`Total calories slightly ${direction} target by ${Math.round(caloriePercent)}%`);
  }
  
  // Check protein accuracy (important for fitness)
  const proteinDiffPercent = Math.abs(discrepancy.protein / targets.protein) * 100;
  if (proteinDiffPercent > 15) {
    warnings.push(`Protein ${discrepancy.protein > 0 ? 'exceeds' : 'falls short of'} target by ${Math.round(proteinDiffPercent)}%`);
  }
  
  return {
    isValid: errors.length === 0,
    isWithinTolerance,
    actualTotals,
    discrepancy,
    warnings,
    errors,
  };
}

/**
 * Calculate per-meal calorie targets for the AI prompt
 */
function calculatePerMealTargets(dailyCalories: number, mealCount: number = 4): string {
  const configs: Record<number, Array<{ name: string; pct: number }>> = {
    3: [
      { name: 'Breakfast', pct: 0.25 },
      { name: 'Lunch', pct: 0.40 },
      { name: 'Dinner', pct: 0.35 },
    ],
    4: [
      { name: 'Breakfast', pct: 0.25 },
      { name: 'Lunch', pct: 0.35 },
      { name: 'Dinner', pct: 0.30 },
      { name: 'Snack', pct: 0.10 },
    ],
    5: [
      { name: 'Breakfast', pct: 0.20 },
      { name: 'Morning Snack', pct: 0.10 },
      { name: 'Lunch', pct: 0.30 },
      { name: 'Afternoon Snack', pct: 0.10 },
      { name: 'Dinner', pct: 0.30 },
    ],
  };
  
  const mealConfigs = configs[mealCount] || configs[4];
  
  return mealConfigs.map(m => 
    `- ${m.name}: ~${Math.round(dailyCalories * m.pct)} kcal`
  ).join('\n');
}

// =====================================
// AI CALL WITH RETRY
// =====================================

async function callAIWithRetry(
  apiKey: string,
  targets: MacroTargets,
  preferences: string | undefined,
  maxRetries: number = 2
): Promise<{ mealPlan: AIMealPlan; validation: ValidationResult; attempts: number }> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`AI meal generation attempt ${attempt}/${maxRetries}`);
    
    // More strict prompt on retry
    const strictnessNote = attempt > 1 
      ? `\n\nIMPORTANT: Previous attempt had incorrect totals. Be VERY precise with macro values. The sum of all food macros MUST equal the daily targets.`
      : '';
    
    const systemPrompt = `You are a professional nutritionist creating accurate meal plans.

CRITICAL RULES:
1. Each food's calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9)
2. Use realistic nutrition values for common foods
3. The TOTAL of all foods MUST hit the daily targets closely
4. Distribute calories appropriately across meals

${strictnessNote}`;

    const perMealTargets = calculatePerMealTargets(targets.calories, 4);
    
    const userPrompt = `Create a daily meal plan matching these EXACT targets:
- Total Daily Calories: ${targets.calories} kcal
- Protein: ${targets.protein}g
- Carbohydrates: ${targets.carbs}g
- Fat: ${targets.fat}g

Suggested per-meal calorie distribution:
${perMealTargets}
${preferences ? `\nDietary preferences: ${preferences}` : ''}

Provide 4-5 meals with accurate nutrition values that sum to the daily targets.`;

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
            description: "Create a structured daily meal plan. Each food's calories must equal (protein×4)+(carbs×4)+(fat×9)",
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
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error('No valid tool call in AI response');
      if (attempt < maxRetries) continue;
      throw new Error('Failed to generate meal plan');
    }

    try {
      let rawMealPlan: AIMealPlan = JSON.parse(toolCall.function.arguments);
      
      // Step 1: Fix all food calories to match macros
      rawMealPlan = fixFoodCalories(rawMealPlan);
      
      // Step 2: Validate against targets
      let validation = validateMealPlan(rawMealPlan, targets, 10);
      
      console.log(`Attempt ${attempt} - Actual: ${validation.actualTotals.calories} kcal, Target: ${targets.calories} kcal, Diff: ${validation.discrepancy.caloriePercent}%`);
      
      // Step 3: If off by >10% but <100%, try scaling
      if (!validation.isWithinTolerance && validation.discrepancy.caloriePercent < 100) {
        console.log('Attempting to scale portions to match targets...');
        const scaledMealPlan = scaleMealPortions(rawMealPlan, targets.calories);
        const scaledValidation = validateMealPlan(scaledMealPlan, targets, 10);
        
        if (scaledValidation.isWithinTolerance) {
          console.log(`Scaling successful: ${scaledValidation.actualTotals.calories} kcal`);
          return {
            mealPlan: scaledMealPlan,
            validation: scaledValidation,
            attempts: attempt,
          };
        } else {
          console.log(`Scaling still off by ${scaledValidation.discrepancy.caloriePercent}%`);
          // Use scaled version anyway if it's better
          if (scaledValidation.discrepancy.caloriePercent < validation.discrepancy.caloriePercent) {
            rawMealPlan = scaledMealPlan;
            validation = scaledValidation;
          }
        }
      }
      
      // Step 4: If within tolerance or last attempt, return
      if (validation.isWithinTolerance || attempt === maxRetries) {
        if (!validation.isWithinTolerance) {
          console.warn(`Final attempt still off by ${validation.discrepancy.caloriePercent}%. Returning best effort.`);
          validation.warnings.push(`Meal plan is ${validation.discrepancy.caloriePercent}% off target. Consider adjusting portions manually.`);
        }
        
        return {
          mealPlan: rawMealPlan,
          validation,
          attempts: attempt,
        };
      }
      
      // Continue to next attempt
      console.log(`Retrying due to ${validation.discrepancy.caloriePercent}% calorie discrepancy...`);
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      if (attempt === maxRetries) {
        throw new Error('Failed to parse meal plan from AI');
      }
    }
  }
  
  throw new Error('Failed to generate accurate meal plan after retries');
}

// =====================================
// MAIN HANDLER
// =====================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetCalories, targetProtein, targetCarbs, targetFat, preferences, structured } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const targets: MacroTargets = {
      calories: targetCalories,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
    };

    // Validate inputs
    if (!targetCalories || targetCalories < 500 || targetCalories > 10000) {
      throw new Error('Invalid calorie target. Must be between 500 and 10000.');
    }

    if (structured) {
      console.log('Generating structured meal plan for:', targets, 'preferences:', preferences);
      
      const { mealPlan, validation, attempts } = await callAIWithRetry(
        LOVABLE_API_KEY,
        targets,
        preferences,
        2 // Max 2 attempts
      );
      
      console.log(`Meal plan generated in ${attempts} attempt(s). Valid: ${validation.isValid}, Within tolerance: ${validation.isWithinTolerance}`);
      
      return new Response(JSON.stringify({
        mealPlan,
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

    // Legacy text-based response
    const systemPrompt = `You are a professional nutritionist. Create practical meal plans based on macro targets.`;
    
    const userPrompt = `Create a daily meal plan for:
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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || 'Unable to generate suggestion';

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-meal-suggestion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
