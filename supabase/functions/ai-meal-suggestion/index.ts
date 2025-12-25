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
    const { targetCalories, targetProtein, targetCarbs, targetFat, preferences, structured } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If structured output is requested, use tool calling for JSON response
    if (structured) {
      console.log('Generating structured meal plan for:', { targetCalories, targetProtein, targetCarbs, targetFat, preferences });
      
      const systemPrompt = `You are a professional nutritionist. Create a practical meal plan that hits the given macro targets as closely as possible. Use common, readily available foods with realistic portion sizes.`;

      const userPrompt = `Create a daily meal plan with these macro targets:
- Calories: ${targetCalories} kcal
- Protein: ${targetProtein}g  
- Carbohydrates: ${targetCarbs}g
- Fat: ${targetFat}g
${preferences ? `\nDietary preferences: ${preferences}` : ''}

Provide 4-5 meals for the day that together hit these macro targets.`;

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
                description: "Create a structured daily meal plan with foods and macros",
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
                                calories: { type: "number", description: "Calories for this serving" },
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
      console.log('AI response:', JSON.stringify(data, null, 2));
      
      // Extract the tool call result
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const mealPlan = JSON.parse(toolCall.function.arguments);
          console.log('Parsed meal plan:', JSON.stringify(mealPlan, null, 2));
          return new Response(JSON.stringify({ mealPlan }), {
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