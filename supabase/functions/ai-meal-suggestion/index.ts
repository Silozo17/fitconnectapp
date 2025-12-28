import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// VALIDATION FUNCTIONS
// Ensure AI-generated meal data is correct
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

/**
 * Recalculate calories from macros (ground truth)
 */
function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

/**
 * Validate and fix AI-generated meal plan
 * - Ensures macro calories match stated calories
 * - Logs warnings for significant discrepancies
 */
function validateAndFixMealPlan(
  mealPlan: AIMealPlan,
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number
): { mealPlan: AIMealPlan; warnings: string[]; totals: { calories: number; protein: number; carbs: number; fat: number } } {
  const warnings: string[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Fix each food item
  const fixedMeals = mealPlan.meals.map((meal) => {
    const fixedFoods = meal.foods.map((food) => {
      // Recalculate calories from macros (this is the ground truth)
      const calculatedCalories = recalculateCalories(food.protein, food.carbs, food.fat);
      
      // Check if AI's stated calories differ significantly
      if (Math.abs(calculatedCalories - food.calories) > 20) {
        warnings.push(`Fixed ${food.name}: stated ${food.calories} cal, actual ${calculatedCalories} cal from macros`);
      }

      // Use the calculated calories, not AI's stated value
      const fixedFood: AIFood = {
        ...food,
        calories: calculatedCalories,
        protein: Math.round(food.protein),
        carbs: Math.round(food.carbs),
        fat: Math.round(food.fat),
      };

      totalCalories += fixedFood.calories;
      totalProtein += fixedFood.protein;
      totalCarbs += fixedFood.carbs;
      totalFat += fixedFood.fat;

      return fixedFood;
    });

    return { ...meal, foods: fixedFoods };
  });

  // Check total discrepancy from targets
  const calorieDiscrepancy = Math.abs(totalCalories - targetCalories);
  const calorieDiscrepancyPercent = (calorieDiscrepancy / targetCalories) * 100;

  if (calorieDiscrepancyPercent > 15) {
    warnings.push(`Total calories (${totalCalories}) differ from target (${targetCalories}) by ${Math.round(calorieDiscrepancyPercent)}%`);
  }

  return {
    mealPlan: { meals: fixedMeals },
    warnings,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
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
    const { targetCalories, targetProtein, targetCarbs, targetFat, preferences, structured } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If structured output is requested, use tool calling for JSON response
    if (structured) {
      console.log('Generating structured meal plan for:', { targetCalories, targetProtein, targetCarbs, targetFat, preferences });
      
      // Include reminder to AI that macros must be accurate
      const systemPrompt = `You are a professional nutritionist. Create a practical meal plan that hits the given macro targets.

CRITICAL RULES FOR MACROS:
1. For each food, the calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9)
2. All macros should be realistic for the food (e.g., chicken breast is ~31g protein per 100g, not 50g)
3. Use common, readily available foods with standard nutrition values
4. The total of all foods should approximately match the daily targets

Be accurate with nutrition values - they will be validated.`;

      const userPrompt = `Create a daily meal plan with these EXACT macro targets:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g  
- Carbohydrates: ${targetCarbs}g
- Fat: ${targetFat}g
${preferences ? `\nDietary preferences: ${preferences}` : ''}

Provide 4-5 meals. For each food, ensure calories = (protein × 4) + (carbs × 4) + (fat × 9).`;

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
          tools: [
            {
              type: "function",
              function: {
                name: "create_meal_plan",
                description: "Create a structured daily meal plan with foods and macros. Each food's calories must equal (protein×4)+(carbs×4)+(fat×9)",
                parameters: {
                  type: "object",
                  properties: {
                    meals: {
                      type: "array",
                      description: "Array of meals for the day",
                      items: {
                        type: "object",
                        properties: {
                          name: { 
                            type: "string", 
                            description: "Meal name (e.g., Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner)" 
                          },
                          time: { 
                            type: "string", 
                            description: "Suggested time in HH:MM format (e.g., 07:00, 10:00, 12:30, 15:30, 19:00)" 
                          },
                          foods: {
                            type: "array",
                            description: "Foods in this meal",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string", description: "Food name" },
                                serving: { type: "string", description: "Serving size (e.g., 150g, 1 cup, 2 eggs)" },
                                calories: { type: "number", description: "Calories for this serving (must equal protein×4 + carbs×4 + fat×9)" },
                                protein: { type: "number", description: "Protein in grams" },
                                carbs: { type: "number", description: "Carbohydrates in grams" },
                                fat: { type: "number", description: "Fat in grams" }
                              },
                              required: ["name", "serving", "calories", "protein", "carbs", "fat"],
                              additionalProperties: false
                            }
                          }
                        },
                        required: ["name", "time", "foods"],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ["meals"],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "create_meal_plan" } },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response received');
      
      // Extract the tool call result
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const rawMealPlan: AIMealPlan = JSON.parse(toolCall.function.arguments);
          
          // CRITICAL: Validate and fix the meal plan
          const { mealPlan, warnings, totals } = validateAndFixMealPlan(
            rawMealPlan,
            targetCalories,
            targetProtein,
            targetCarbs,
            targetFat
          );
          
          // Log any issues found
          if (warnings.length > 0) {
            console.warn('Meal plan validation warnings:', warnings);
          }
          console.log('Meal plan totals:', totals, 'Targets:', { targetCalories, targetProtein, targetCarbs, targetFat });
          
          return new Response(JSON.stringify({ 
            mealPlan,
            validation: {
              totals,
              warnings,
              isAccurate: warnings.length === 0,
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (parseError) {
          console.error('Failed to parse tool call arguments:', parseError);
          throw new Error('Failed to parse AI response');
        }
      }
      
      throw new Error('No valid meal plan in AI response');
    }

    // Legacy text-based response for backward compatibility
    const systemPrompt = `You are a professional nutritionist and meal planning expert. Create practical, healthy meal plans based on macro targets. 
    
Your response should include:
1. A full day meal plan with 4-5 meals
2. Specific foods with approximate portions
3. Estimated macros for each meal
4. Quick prep tips where helpful

Keep suggestions realistic, using common ingredients. Format the response clearly with meal names and bullet points.`;

    const userPrompt = `Create a daily meal plan for someone with these macro targets:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g
- Carbohydrates: ${targetCarbs}g
- Fat: ${targetFat}g

${preferences ? `Additional preferences/restrictions: ${preferences}` : ''}

Provide a practical, balanced meal plan that hits these targets as closely as possible.`;

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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
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
