import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// DETERMINISTIC CALCULATION FUNCTIONS
// AI MUST NOT perform these calculations
// =====================================

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp';
type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,
  maintain: 0,
  build_muscle: 300,
  body_recomp: -100,
};

function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const adjustment = gender === 'male' ? 5 : -161;
  return Math.round(base + adjustment);
}

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

function calculateTargetCalories(tdee: number, goal: Goal): number {
  const adjustment = GOAL_ADJUSTMENTS[goal];
  return Math.max(1200, Math.round(tdee + adjustment));
}

function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  dietaryPreference: DietaryPreference
): { protein: number; carbs: number; fat: number; fiber: number } {
  let proteinRatio: number;
  let fatRatio: number;
  let carbRatio: number;

  switch (dietaryPreference) {
    case 'high_protein':
      proteinRatio = 0.35;
      fatRatio = 0.30;
      carbRatio = 0.35;
      break;
    case 'low_carb':
      proteinRatio = 0.30;
      fatRatio = 0.40;
      carbRatio = 0.30;
      break;
    case 'keto':
      proteinRatio = 0.25;
      fatRatio = 0.70;
      carbRatio = 0.05;
      break;
    case 'vegan':
    case 'balanced':
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
      break;
  }

  // Adjust protein for muscle building goals
  if (goal === 'build_muscle' || goal === 'body_recomp') {
    const minProteinGrams = Math.round(weightKg * 1.8);
    const proteinFromRatio = Math.round((targetCalories * proteinRatio) / 4);
    
    if (proteinFromRatio < minProteinGrams) {
      const proteinCalories = minProteinGrams * 4;
      proteinRatio = proteinCalories / targetCalories;
      const remaining = 1 - proteinRatio;
      const originalFatCarb = fatRatio + carbRatio;
      fatRatio = (fatRatio / originalFatCarb) * remaining;
      carbRatio = remaining - fatRatio;
    }
  }

  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  return { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams, fiber: fiberGrams };
}

function calculatePercentages(macros: { protein: number; carbs: number; fat: number }) {
  const totalCals = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9);
  return {
    protein: Math.round(((macros.protein * 4) / totalCals) * 100),
    carbs: Math.round(((macros.carbs * 4) / totalCals) * 100),
    fat: Math.round(((macros.fat * 9) / totalCals) * 100),
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
      age,
      gender,
      weightKg,
      heightCm,
      activityLevel,
      goal,
      dietaryPreference,
    } = await req.json();

    // Input validation
    if (!age || !gender || !weightKg || !heightCm || !activityLevel || !goal) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Calculating macros (server-side) for:', { age, gender, weightKg, goal });

    // STEP 1: Calculate all values SERVER-SIDE (deterministic, verified formulas)
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, weightKg, goal, dietaryPreference || 'balanced');
    const percentages = calculatePercentages(macros);
    
    // Calculate per-meal distribution (4 meals)
    const mealsPerDay = 4;
    const mealSuggestion = {
      meals: mealsPerDay,
      proteinPerMeal: Math.round(macros.protein / mealsPerDay),
      carbsPerMeal: Math.round(macros.carbs / mealsPerDay),
      fatPerMeal: Math.round(macros.fat / mealsPerDay),
    };

    console.log('Server calculated:', { bmr, tdee, targetCalories, macros });

    // STEP 2: Get AI to generate ONLY explanation and tips (no calculations)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Return calculated values without AI explanation
      return new Response(JSON.stringify({
        bmr,
        tdee,
        targetCalories,
        macros,
        percentages,
        mealSuggestion,
        explanation: `Based on your profile, your Basal Metabolic Rate (BMR) is ${bmr} calories. With your ${activityLevel} activity level, your Total Daily Energy Expenditure (TDEE) is ${tdee} calories. For your goal of ${goal.replace('_', ' ')}, your target is ${targetCalories} calories per day.`,
        tips: [
          'Spread protein intake across all meals for optimal absorption',
          'Drink plenty of water throughout the day',
          'Track your intake for the first few weeks to build awareness',
          'Adjust based on your progress after 2-3 weeks',
        ],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a sports nutritionist. You will receive pre-calculated macro targets. Your job is ONLY to:
1. Explain WHY these targets make sense for the user
2. Provide practical tips for hitting these targets

DO NOT recalculate or change any numbers. The calculations are already done correctly.`;

    const userPrompt = `Here are the calculated macro targets for a ${age}-year-old ${gender} weighing ${weightKg}kg, height ${heightCm}cm, with ${activityLevel} activity, goal: ${goal}, preference: ${dietaryPreference || 'balanced'}:

- BMR: ${bmr} calories
- TDEE: ${tdee} calories  
- Target: ${targetCalories} calories/day
- Protein: ${macros.protein}g (${percentages.protein}%)
- Carbs: ${macros.carbs}g (${percentages.carbs}%)
- Fat: ${macros.fat}g (${percentages.fat}%)
- Fiber: ${macros.fiber}g

Provide:
1. A brief explanation of why these targets are appropriate for this person's goals
2. 4-5 practical tips for hitting these macro targets daily`;

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
        tools: [{
          type: 'function',
          function: {
            name: 'provide_explanation',
            description: 'Provide explanation and tips for the calculated macros',
            parameters: {
              type: 'object',
              properties: {
                explanation: { 
                  type: 'string', 
                  description: 'Explanation of why these targets are appropriate' 
                },
                tips: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Practical tips for hitting these targets',
                },
              },
              required: ['explanation', 'tips'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'provide_explanation' } },
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
      
      // Return calculated values without AI explanation
      return new Response(JSON.stringify({
        bmr,
        tdee,
        targetCalories,
        macros,
        percentages,
        mealSuggestion,
        explanation: `Your calculated targets are: BMR ${bmr} cal, TDEE ${tdee} cal, Target ${targetCalories} cal.`,
        tips: ['Track your intake consistently', 'Adjust after 2-3 weeks based on progress'],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let explanation = `Your Basal Metabolic Rate (BMR) is ${bmr} calories. With your activity level, your TDEE is ${tdee} calories. Target: ${targetCalories} calories for ${goal.replace('_', ' ')}.`;
    let tips = ['Track your intake consistently', 'Spread protein across meals', 'Stay hydrated'];

    if (toolCall?.function?.arguments) {
      try {
        const aiResponse = JSON.parse(toolCall.function.arguments);
        explanation = aiResponse.explanation || explanation;
        tips = aiResponse.tips || tips;
      } catch (e) {
        console.error('Failed to parse AI response:', e);
      }
    }

    // IMPORTANT: Return SERVER-CALCULATED values, not AI values
    return new Response(JSON.stringify({
      bmr,
      tdee,
      targetCalories,
      macros,
      percentages,
      mealSuggestion,
      explanation,
      tips,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-macro-calculator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
