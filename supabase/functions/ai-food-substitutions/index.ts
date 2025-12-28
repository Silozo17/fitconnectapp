import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// =====================================
// VALIDATION FUNCTIONS (No AI - Pure Math)
// =====================================

/**
 * Recalculate calories from macros (ground truth)
 */
function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

/**
 * Validate that food macros are realistic
 */
function validateFoodMacros(
  macros: { calories: number; protein: number; carbs: number; fat: number },
  servingSize: string
): { isRealistic: boolean; warnings: string[]; correctedCalories: number } {
  const warnings: string[] = [];
  
  // Recalculate calories from macros (ground truth)
  const correctedCalories = recalculateCalories(macros.protein, macros.carbs, macros.fat);
  
  if (Math.abs(correctedCalories - macros.calories) > 15) {
    warnings.push(`Calories adjusted from ${macros.calories} to ${correctedCalories} based on macros`);
  }
  
  // Check for unrealistic protein density
  const servingMatch = servingSize.match(/(\d+)\s*g/i);
  if (servingMatch) {
    const servingGrams = parseInt(servingMatch[1]);
    if (servingGrams > 0) {
      const proteinPer100g = (macros.protein / servingGrams) * 100;
      // Pure protein sources rarely exceed 35g/100g (chicken breast: ~31g)
      // Protein powders can be higher (~80g/100g), so warn at 50
      if (proteinPer100g > 50) {
        warnings.push(`High protein density (${Math.round(proteinPer100g)}g/100g) - verify accuracy`);
      }
    }
  }
  
  // Check for impossible macro combinations
  // Total macro weight can't exceed serving weight significantly
  const totalMacroGrams = macros.protein + macros.carbs + macros.fat;
  const servingMatchGeneral = servingSize.match(/(\d+)/);
  if (servingMatchGeneral) {
    const estimatedWeight = parseInt(servingMatchGeneral[1]);
    // Allow 150% for moisture loss in calculations
    if (totalMacroGrams > estimatedWeight * 1.5 && estimatedWeight > 50) {
      warnings.push(`Macro totals (${Math.round(totalMacroGrams)}g) seem high for serving size`);
    }
  }
  
  // Check calorie density (most foods < 900 cal/100g, except pure oils at ~884)
  if (servingMatch) {
    const servingGrams = parseInt(servingMatch[1]);
    if (servingGrams > 0) {
      const calPer100g = (correctedCalories / servingGrams) * 100;
      if (calPer100g > 900) {
        warnings.push(`Very high calorie density (${Math.round(calPer100g)} cal/100g)`);
      }
    }
  }
  
  return {
    isRealistic: warnings.length <= 1, // Allow 1 minor warning
    warnings,
    correctedCalories,
  };
}

/**
 * Post-process AI substitutions to add validation and flags
 */
function processSubstitutions(
  substitutions: Array<{
    name: string;
    servingSize: string;
    macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number };
    whyGoodSubstitute: string;
    prepTips?: string;
    whereToBuy?: string;
  }>
): Array<{
  name: string;
  servingSize: string;
  macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number };
  whyGoodSubstitute: string;
  prepTips?: string;
  whereToBuy?: string;
  isAIEstimate: boolean;
  validationWarnings: string[];
}> {
  return substitutions.map(sub => {
    const validation = validateFoodMacros(sub.macros, sub.servingSize);
    
    return {
      ...sub,
      macros: {
        ...sub.macros,
        calories: validation.correctedCalories, // Use corrected value
      },
      isAIEstimate: true, // Flag that this is AI-generated
      validationWarnings: validation.warnings,
    };
  });
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
      reason, // 'allergy', 'dietary', 'preference', 'availability'
      currentMacros, // { calories, protein, carbs, fat }
      dietaryRestrictions, // ['vegan', 'gluten-free', etc.]
      allergies,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Finding substitutions for:', foodName, 'reason:', reason);

    // Build the prompt with macro targets if available
    const macroContext = currentMacros 
      ? `Target macros per serving - Calories: ${currentMacros.calories}, Protein: ${currentMacros.protein}g, Carbs: ${currentMacros.carbs}g, Fat: ${currentMacros.fat}g. 
         Try to match these values closely. Calories MUST equal (protein×4)+(carbs×4)+(fat×9).`
      : 'Provide accurate nutrition information for each substitute.';

    const systemPrompt = `You are a registered dietitian. Suggest food substitutions with accurate nutrition values.

CRITICAL RULES:
1. For each food, calories MUST equal: (protein × 4) + (carbs × 4) + (fat × 9)
2. Use realistic, verified nutrition values based on common foods
3. Serving sizes should be practical (e.g., "100g", "1 cup", "2 medium eggs")
4. Protein values: chicken breast ~31g/100g, eggs ~13g/100g, tofu ~8g/100g
5. Be conservative with estimates - accuracy over precision`;

    const userPrompt = `I need substitutions for: ${foodName}

Reason for substitution: ${reason}
${macroContext}
${dietaryRestrictions?.length ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${allergies?.length ? `Allergies to avoid: ${allergies.join(', ')}` : ''}

Provide 3-5 alternatives with accurate macros and practical tips.`;

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
            name: 'suggest_substitutions',
            description: 'Suggest food substitutions with accurate macros. Calories must equal (protein×4)+(carbs×4)+(fat×9)',
            parameters: {
              type: 'object',
              properties: {
                originalFood: { type: 'string' },
                substitutions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      servingSize: { type: 'string', description: 'Practical serving size like "100g", "1 cup", "2 eggs"' },
                      macros: {
                        type: 'object',
                        properties: {
                          calories: { type: 'number', description: 'Must equal (protein×4)+(carbs×4)+(fat×9)' },
                          protein: { type: 'number' },
                          carbs: { type: 'number' },
                          fat: { type: 'number' },
                          fiber: { type: 'number' },
                        },
                        required: ['calories', 'protein', 'carbs', 'fat'],
                      },
                      whyGoodSubstitute: { type: 'string' },
                      prepTips: { type: 'string' },
                      whereToBuy: { type: 'string' },
                    },
                    required: ['name', 'servingSize', 'macros', 'whyGoodSubstitute'],
                  },
                },
              },
              required: ['originalFood', 'substitutions'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_substitutions' } },
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const rawResult = JSON.parse(toolCall.function.arguments);
      
      // Process and validate substitutions
      const processedSubstitutions = processSubstitutions(rawResult.substitutions || []);
      
      // Log any validation issues
      const allWarnings = processedSubstitutions.flatMap(s => s.validationWarnings);
      if (allWarnings.length > 0) {
        console.warn('Substitution validation warnings:', allWarnings);
      }
      
      console.log('Found', processedSubstitutions.length, 'substitutions with validation');
      
      return new Response(JSON.stringify({
        originalFood: rawResult.originalFood,
        substitutions: processedSubstitutions,
        meta: {
          isAIGenerated: true,
          disclaimer: 'Nutrition values are AI estimates. Verify with food labels for precise tracking.',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback for text response
    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ 
      content,
      meta: {
        isAIGenerated: true,
        disclaimer: 'AI-generated suggestions. Verify nutrition information.',
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-food-substitutions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
