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
      goal, // 'muscle_gain', 'fat_loss', 'strength', 'endurance', 'general_fitness'
      experienceLevel, // 'beginner', 'intermediate', 'advanced'
      daysPerWeek, // 3-6
      equipment, // 'full_gym', 'home_basics', 'bodyweight', 'dumbbells_only'
      focusAreas, // ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']
      injuries, // optional array of injuries/limitations
      sessionDuration, // in minutes
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating workout plan:', { goal, experienceLevel, daysPerWeek, equipment });

    const systemPrompt = `You are an expert certified personal trainer and exercise programmer. Create detailed, science-based workout plans tailored to individual needs.

Your workout plans should:
1. Follow proper exercise sequencing (compound before isolation)
2. Include appropriate sets, reps, tempo, and rest periods
3. Account for recovery between muscle groups
4. Progress logically through the week
5. Include warm-up and cool-down recommendations

Format your response as a structured JSON object.`;

    const userPrompt = `Create a ${daysPerWeek}-day workout program for someone with these parameters:

Goal: ${goal}
Experience Level: ${experienceLevel}
Available Equipment: ${equipment}
Session Duration: ${sessionDuration} minutes
Focus Areas: ${focusAreas?.join(', ') || 'Full body'}
${injuries?.length ? `Injuries/Limitations to avoid: ${injuries.join(', ')}` : ''}

Provide a complete weekly workout plan with specific exercises, sets, reps, tempo (if relevant), and rest periods.`;

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
            name: 'create_workout_plan',
            description: 'Create a structured workout plan',
            parameters: {
              type: 'object',
              properties: {
                planName: { type: 'string', description: 'Name of the workout plan' },
                description: { type: 'string', description: 'Brief description of the plan' },
                days: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      dayNumber: { type: 'number' },
                      name: { type: 'string', description: 'e.g., Push Day, Leg Day' },
                      focus: { type: 'string', description: 'Primary muscle groups' },
                      exercises: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            sets: { type: 'number' },
                            reps: { type: 'string', description: 'e.g., 8-12 or 10' },
                            rest: { type: 'string', description: 'e.g., 60s, 90s' },
                            notes: { type: 'string', description: 'Form tips or modifications' },
                          },
                          required: ['name', 'sets', 'reps', 'rest'],
                        },
                      },
                      warmup: { type: 'string', description: 'Warmup recommendations' },
                      cooldown: { type: 'string', description: 'Cooldown recommendations' },
                    },
                    required: ['dayNumber', 'name', 'exercises'],
                  },
                },
                tips: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'General training tips for this program',
                },
              },
              required: ['planName', 'description', 'days'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'create_workout_plan' } },
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
      const workoutPlan = JSON.parse(toolCall.function.arguments);
      console.log('Generated workout plan:', workoutPlan.planName);
      return new Response(JSON.stringify({ plan: workoutPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to content if no tool call
    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-workout-generator:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
