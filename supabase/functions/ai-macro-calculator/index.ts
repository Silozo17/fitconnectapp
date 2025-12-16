import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      activityLevel, // 'sedentary', 'light', 'moderate', 'active', 'very_active'
      goal, // 'lose_weight', 'maintain', 'build_muscle', 'body_recomp'
      dietaryPreference, // 'balanced', 'high_protein', 'low_carb', 'keto', 'vegan'
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Calculating macros for:', { age, gender, weightKg, goal });

    const systemPrompt = `You are a sports nutritionist and registered dietitian. Calculate optimal macro targets based on scientific formulas (Mifflin-St Jeor, Harris-Benedict) and adjust for the user's specific goals. Provide practical, achievable targets with explanations.`;

    const userPrompt = `Calculate optimal daily macros for:

Age: ${age} years
Gender: ${gender}
Weight: ${weightKg} kg
Height: ${heightCm} cm
Activity Level: ${activityLevel}
Goal: ${goal}
Dietary Preference: ${dietaryPreference}

Provide:
1. BMR calculation
2. TDEE calculation
3. Recommended calorie target
4. Macro split (protein, carbs, fat in grams)
5. Explanation of the recommendations
6. Tips for hitting these targets`;

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
            name: 'calculate_macros',
            description: 'Calculate and recommend daily macros',
            parameters: {
              type: 'object',
              properties: {
                bmr: { type: 'number', description: 'Basal Metabolic Rate' },
                tdee: { type: 'number', description: 'Total Daily Energy Expenditure' },
                targetCalories: { type: 'number', description: 'Recommended daily calories' },
                macros: {
                  type: 'object',
                  properties: {
                    protein: { type: 'number', description: 'Grams of protein' },
                    carbs: { type: 'number', description: 'Grams of carbohydrates' },
                    fat: { type: 'number', description: 'Grams of fat' },
                    fiber: { type: 'number', description: 'Recommended fiber intake' },
                  },
                  required: ['protein', 'carbs', 'fat'],
                },
                percentages: {
                  type: 'object',
                  properties: {
                    protein: { type: 'number' },
                    carbs: { type: 'number' },
                    fat: { type: 'number' },
                  },
                },
                explanation: { type: 'string', description: 'Why these targets are recommended' },
                tips: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Practical tips for hitting these targets',
                },
                mealSuggestion: {
                  type: 'object',
                  properties: {
                    meals: { type: 'number', description: 'Recommended meals per day' },
                    proteinPerMeal: { type: 'number' },
                    carbsPerMeal: { type: 'number' },
                    fatPerMeal: { type: 'number' },
                  },
                },
              },
              required: ['bmr', 'tdee', 'targetCalories', 'macros', 'explanation'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'calculate_macros' } },
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
      const macroCalculation = JSON.parse(toolCall.function.arguments);
      console.log('Calculated macros:', macroCalculation.targetCalories, 'calories');
      return new Response(JSON.stringify(macroCalculation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content }), {
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
