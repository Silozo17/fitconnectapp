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
      exerciseName,
      reason, // 'injury', 'equipment', 'preference', 'difficulty'
      availableEquipment,
      targetMuscles,
      constraints, // any specific limitations
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Finding alternatives for:', exerciseName, 'reason:', reason);

    const systemPrompt = `You are an expert exercise physiologist and personal trainer. Suggest alternative exercises that target the same muscle groups while considering the user's constraints. Provide exercises that are safe, effective, and practical.`;

    const userPrompt = `I need alternatives for: ${exerciseName}

Reason for substitution: ${reason}
${targetMuscles ? `Target muscles: ${targetMuscles}` : ''}
${availableEquipment ? `Available equipment: ${availableEquipment}` : ''}
${constraints ? `Additional constraints: ${constraints}` : ''}

Provide 3-5 suitable alternatives with explanations of why each is a good substitute.`;

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
            name: 'suggest_alternatives',
            description: 'Suggest alternative exercises',
            parameters: {
              type: 'object',
              properties: {
                originalExercise: { type: 'string' },
                alternatives: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      equipment: { type: 'string', description: 'Required equipment' },
                      difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                      musclesWorked: { type: 'array', items: { type: 'string' } },
                      whyGoodAlternative: { type: 'string' },
                      formTips: { type: 'string' },
                      setsRepsRecommendation: { type: 'string' },
                    },
                    required: ['name', 'musclesWorked', 'whyGoodAlternative'],
                  },
                },
              },
              required: ['originalExercise', 'alternatives'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_alternatives' } },
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
      const alternatives = JSON.parse(toolCall.function.arguments);
      console.log('Found', alternatives.alternatives?.length, 'alternatives');
      return new Response(JSON.stringify(alternatives), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-exercise-alternatives:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
