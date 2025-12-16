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
    const { target_audience, duration } = await req.json();
    
    const durationMap: Record<string, number> = {
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30,
      'seasonal': 90,
    };
    const durationDays = durationMap[duration as string] || 7;
    
    const audienceMap: Record<string, string> = {
      'clients': 'fitness enthusiasts and clients working with coaches',
      'coaches': 'fitness coaches and personal trainers',
      'all': 'both fitness clients and coaches',
    };
    const audienceContext = audienceMap[target_audience as string] || 'fitness enthusiasts';
    
    // Call Lovable AI Gateway
    const response = await fetch('https://ai-gateway.lovable.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a fitness challenge creator. Generate creative, engaging fitness challenges for ${audienceContext}. 
            
            For each challenge provide:
            - title: catchy name (max 50 chars)
            - description: brief motivating description (max 150 chars)
            - target_value: numeric goal
            - target_unit: what to measure (days, workouts, minutes, etc)
            - xp_reward: points to award (50-500 based on difficulty)
            - challenge_type: one of [habit_streak, workout_count, check_ins, xp_earned]
            - duration_days: ${durationDays}
            
            Return JSON array with exactly 4 suggestions.`
          },
          {
            role: 'user',
            content: `Generate 4 unique ${duration} fitness challenges for ${audienceContext}. Make them fun, achievable, and motivating. Duration: ${durationDays} days.`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let suggestions = [];
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback suggestions
      suggestions = [
        {
          title: '7-Day Workout Warrior',
          description: 'Complete 7 workouts in 7 days. Any workout counts!',
          target_value: 7,
          target_unit: 'workouts',
          xp_reward: 150,
          challenge_type: 'workout_count',
          duration_days: durationDays,
        },
        {
          title: 'Streak Builder',
          description: 'Build a habit streak by checking in every day.',
          target_value: durationDays,
          target_unit: 'days',
          xp_reward: 100,
          challenge_type: 'habit_streak',
          duration_days: durationDays,
        },
        {
          title: 'Progress Tracker Pro',
          description: 'Log your progress and measurements regularly.',
          target_value: 5,
          target_unit: 'check-ins',
          xp_reward: 75,
          challenge_type: 'check_ins',
          duration_days: durationDays,
        },
        {
          title: 'XP Hunter',
          description: 'Earn XP through various activities on the platform.',
          target_value: 500,
          target_unit: 'XP',
          xp_reward: 200,
          challenge_type: 'xp_earned',
          duration_days: durationDays,
        },
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating suggestions:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
