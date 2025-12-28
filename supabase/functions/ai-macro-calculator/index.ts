import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// TYPES
// =====================================

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp';
type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

// =====================================
// EVIDENCE-BASED NUTRITION CONSTANTS
// Sources: ISSN Position Stand on Protein (2017), Mifflin-St Jeor
// =====================================

/**
 * Protein requirements based on goal (g/kg bodyweight)
 * Based on ISSN Position Stand on Protein and Exercise
 */
const PROTEIN_REQUIREMENTS: Record<Goal, { min: number; max: number; default: number }> = {
  lose_weight: { min: 1.6, max: 2.2, default: 2.0 },   // High protein preserves muscle
  maintain: { min: 1.2, max: 1.6, default: 1.4 },      // General health
  build_muscle: { min: 1.6, max: 2.2, default: 2.0 },  // Hypertrophy
  body_recomp: { min: 1.8, max: 2.4, default: 2.2 },   // Highest needs
};

/**
 * Diet type constraints with HARD carb limits where applicable
 */
const DIET_CONSTRAINTS: Record<DietaryPreference, {
  name: string;
  carbsGrams?: { min: number; max: number };
  fatPercent: { min: number; max: number };
  proteinMultiplier?: number;
  proteinModerate?: boolean;
  proteinCapped?: boolean;
  maxRealisticProtein?: number;
}> = {
  balanced: {
    name: 'Balanced',
    fatPercent: { min: 0.25, max: 0.35 },
  },
  high_protein: {
    name: 'High Protein',
    proteinMultiplier: 1.2,
    fatPercent: { min: 0.20, max: 0.30 },
  },
  low_carb: {
    name: 'Low Carb',
    carbsGrams: { min: 70, max: 130 }, // HARD LIMIT
    fatPercent: { min: 0.35, max: 0.50 },
  },
  keto: {
    name: 'Ketogenic',
    carbsGrams: { min: 20, max: 30 }, // HARD LIMIT for ketosis
    fatPercent: { min: 0.65, max: 0.75 },
    proteinModerate: true,
  },
  vegan: {
    name: 'Vegan',
    fatPercent: { min: 0.25, max: 0.35 },
    proteinCapped: true,
    maxRealisticProtein: 1.8,
  },
};

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

const SAFETY_FLOORS = {
  minCalories: { male: 1500, female: 1200 },
  minProteinGPerKg: 1.2,
  minFatGrams: 40,
  minCarbsGrams: 50,
};

// =====================================
// CALCULATION FUNCTIONS
// =====================================

function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const adjustment = gender === 'male' ? 5 : -161;
  return Math.round(base + adjustment);
}

function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

function calculateTargetCalories(tdee: number, goal: Goal, gender: Gender): number {
  const adjustment = GOAL_ADJUSTMENTS[goal];
  const minCalories = SAFETY_FLOORS.minCalories[gender];
  return Math.max(minCalories, Math.round(tdee + adjustment));
}

/**
 * Get protein requirement using PROTEIN-FIRST approach
 */
function getProteinRequirement(
  weightKg: number,
  goal: Goal,
  diet: DietaryPreference
): { grams: number; gPerKg: number; warning?: string } {
  const baseReq = PROTEIN_REQUIREMENTS[goal];
  const dietConfig = DIET_CONSTRAINTS[diet];
  
  let gPerKg = baseReq.default;
  let warning: string | undefined;
  
  // Apply diet multiplier
  if (dietConfig.proteinMultiplier) {
    gPerKg = Math.min(gPerKg * dietConfig.proteinMultiplier, baseReq.max * 1.1);
  }
  
  // Moderate for keto
  if (dietConfig.proteinModerate) {
    gPerKg = Math.min(gPerKg, 1.8);
  }
  
  // Cap for vegan
  if (dietConfig.proteinCapped && dietConfig.maxRealisticProtein) {
    if (gPerKg > dietConfig.maxRealisticProtein) {
      gPerKg = dietConfig.maxRealisticProtein;
      warning = `Protein capped at ${dietConfig.maxRealisticProtein} g/kg for plant-based diet`;
    }
  }
  
  gPerKg = Math.max(gPerKg, SAFETY_FLOORS.minProteinGPerKg);
  
  return {
    grams: Math.round(weightKg * gPerKg),
    gPerKg: Math.round(gPerKg * 10) / 10,
    warning,
  };
}

/**
 * PROTEIN-FIRST macro calculation
 */
function calculatePhysiologicalMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  diet: DietaryPreference,
  gender: Gender
): { macros: { protein: number; carbs: number; fat: number; fiber: number }; warnings: string[]; proteinPerKg: number } {
  const warnings: string[] = [];
  const dietConfig = DIET_CONSTRAINTS[diet];
  
  // STEP 1: PROTEIN FIRST
  const proteinReq = getProteinRequirement(weightKg, goal, diet);
  const proteinGrams = proteinReq.grams;
  if (proteinReq.warning) warnings.push(proteinReq.warning);
  
  // STEP 2: CARBS based on diet constraints
  let carbsGrams: number;
  const carbConstraint = dietConfig.carbsGrams;
  
  if (carbConstraint) {
    carbsGrams = carbConstraint.max;
  } else {
    carbsGrams = 0; // Calculate after fat
  }
  
  // STEP 3: FAT
  let fatGrams: number;
  const proteinCalories = proteinGrams * 4;
  
  if (carbConstraint) {
    // Fixed carbs: fat gets remainder
    const carbCalories = carbsGrams * 4;
    const remainingCalories = targetCalories - proteinCalories - carbCalories;
    fatGrams = Math.round(remainingCalories / 9);
  } else {
    // Calculate fat %, then carbs from remainder
    const avgFatPercent = (dietConfig.fatPercent.min + dietConfig.fatPercent.max) / 2;
    const remainingAfterProtein = targetCalories - proteinCalories;
    const fatCalories = remainingAfterProtein * avgFatPercent;
    fatGrams = Math.round(fatCalories / 9);
    
    const carbCaloriesRemaining = targetCalories - proteinCalories - (fatGrams * 9);
    carbsGrams = Math.round(carbCaloriesRemaining / 4);
  }
  
  // STEP 4: Safety floors
  if (fatGrams < SAFETY_FLOORS.minFatGrams) {
    const neededCalories = (SAFETY_FLOORS.minFatGrams - fatGrams) * 9;
    if (!carbConstraint && carbsGrams * 4 > neededCalories + (SAFETY_FLOORS.minCarbsGrams * 4)) {
      carbsGrams -= Math.ceil(neededCalories / 4);
    }
    fatGrams = SAFETY_FLOORS.minFatGrams;
  }
  
  if (diet !== 'keto' && carbsGrams < SAFETY_FLOORS.minCarbsGrams) {
    carbsGrams = SAFETY_FLOORS.minCarbsGrams;
  }
  
  // Fiber
  const fiberGrams = Math.round((targetCalories / 1000) * 14);
  
  return {
    macros: { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams, fiber: fiberGrams },
    warnings,
    proteinPerKg: proteinReq.gPerKg,
  };
}

function calculatePercentages(macros: { protein: number; carbs: number; fat: number }) {
  const totalCals = (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9);
  if (totalCals === 0) return { protein: 0, carbs: 0, fat: 0 };
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
    const { age, gender, weightKg, heightCm, activityLevel, goal, dietaryPreference } = await req.json();

    if (!age || !gender || !weightKg || !heightCm || !activityLevel || !goal) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const diet: DietaryPreference = dietaryPreference || 'balanced';
    
    console.log('Calculating macros with PROTEIN-FIRST approach:', { age, gender, weightKg, goal, diet });

    // Calculate all values SERVER-SIDE
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const targetCalories = calculateTargetCalories(tdee, goal, gender);
    
    const macroResult = calculatePhysiologicalMacros(targetCalories, weightKg, goal, diet, gender);
    const macros = macroResult.macros;
    const percentages = calculatePercentages(macros);
    
    // Per-meal distribution
    const mealsPerDay = 4;
    const mealSuggestion = {
      meals: mealsPerDay,
      proteinPerMeal: Math.round(macros.protein / mealsPerDay),
      carbsPerMeal: Math.round(macros.carbs / mealsPerDay),
      fatPerMeal: Math.round(macros.fat / mealsPerDay),
    };

    console.log('Calculated:', { bmr, tdee, targetCalories, macros, proteinPerKg: macroResult.proteinPerKg });

    // Get AI explanation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        bmr, tdee, targetCalories, macros, percentages, mealSuggestion,
        dietType: diet,
        proteinPerKg: macroResult.proteinPerKg,
        warnings: macroResult.warnings,
        explanation: `Your BMR is ${bmr} cal. With ${activityLevel} activity, your TDEE is ${tdee} cal. Target: ${targetCalories} cal for ${goal.replace('_', ' ')}.`,
        tips: ['Spread protein across all meals', 'Stay hydrated', 'Track intake for 2 weeks'],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dietConfig = DIET_CONSTRAINTS[diet];
    const systemPrompt = `You are a sports nutritionist. Explain pre-calculated macro targets. DO NOT recalculate.`;
    
    const userPrompt = `Explain these calculated targets for a ${age}-year-old ${gender} (${weightKg}kg, ${heightCm}cm, ${activityLevel} activity), goal: ${goal}, diet: ${diet}:

- BMR: ${bmr} cal (Mifflin-St Jeor)
- TDEE: ${tdee} cal
- Target: ${targetCalories} cal/day
- Protein: ${macros.protein}g (${macroResult.proteinPerKg} g/kg - ${percentages.protein}%)
- Carbs: ${macros.carbs}g (${percentages.carbs}%)${dietConfig.carbsGrams ? ` [${diet} constraint: ${dietConfig.carbsGrams.min}-${dietConfig.carbsGrams.max}g]` : ''}
- Fat: ${macros.fat}g (${percentages.fat}%)
- Fiber: ${macros.fiber}g

${macroResult.warnings.length > 0 ? `Notes: ${macroResult.warnings.join('; ')}` : ''}

Provide:
1. Brief explanation of why these targets suit this person
2. 4-5 practical tips for hitting these macros${diet !== 'balanced' ? `, considering ${dietConfig.name} diet requirements` : ''}`;

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
            description: 'Provide explanation and tips',
            parameters: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                tips: { type: 'array', items: { type: 'string' } },
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
      console.error('AI error:', response.status, errorText);
      
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
      
      return new Response(JSON.stringify({
        bmr, tdee, targetCalories, macros, percentages, mealSuggestion,
        dietType: diet,
        proteinPerKg: macroResult.proteinPerKg,
        warnings: macroResult.warnings,
        explanation: `Your BMR is ${bmr} cal, TDEE is ${tdee} cal, target ${targetCalories} cal.`,
        tips: ['Track intake consistently', 'Spread protein across meals'],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let explanation = `Your BMR is ${bmr} cal. TDEE: ${tdee} cal. Target: ${targetCalories} cal for ${goal.replace('_', ' ')}.`;
    let tips = ['Track intake', 'Spread protein across meals', 'Stay hydrated'];

    if (toolCall?.function?.arguments) {
      try {
        const aiResponse = JSON.parse(toolCall.function.arguments);
        explanation = aiResponse.explanation || explanation;
        tips = aiResponse.tips || tips;
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    return new Response(JSON.stringify({
      bmr, tdee, targetCalories, macros, percentages, mealSuggestion,
      dietType: diet,
      proteinPerKg: macroResult.proteinPerKg,
      warnings: macroResult.warnings,
      explanation, tips,
    }), {
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
