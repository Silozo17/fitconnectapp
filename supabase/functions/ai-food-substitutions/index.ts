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

    const systemPrompt = `You are a registered dietitian and nutrition expert. Suggest food substitutions that maintain similar nutritional profiles while respecting dietary restrictions and allergies. Provide practical, commonly available alternatives.`;

    const userPrompt = `I need substitutions for: ${foodName}

Reason for substitution: ${reason}
${currentMacros ? `Current macros per serving - Calories: ${currentMacros.calories}, Protein: ${currentMacros.protein}g, Carbs: ${currentMacros.carbs}g, Fat: ${currentMacros.fat}g` : ''}
${dietaryRestrictions?.length ? `Dietary restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${allergies?.length ? `Allergies to avoid: ${allergies.join(', ')}` : ''}

Provide 3-5 suitable alternatives with their approximate macros and preparation tips.`;

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
            description: 'Suggest food substitutions with similar macros',
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
                      servingSize: { type: 'string' },
                      macros: {
                        type: 'object',
                        properties: {
                          calories: { type: 'number' },
                          protein: { type: 'number' },
                          carbs: { type: 'number' },
                          fat: { type: 'number' },
                          fiber: { type: 'number' },
                        },
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
      const substitutions = JSON.parse(toolCall.function.arguments);
      console.log('Found', substitutions.substitutions?.length, 'substitutions');
      return new Response(JSON.stringify(substitutions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content }), {
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
