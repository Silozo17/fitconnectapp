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
      progressData, // Array of progress entries
      goal, // User's fitness goal
      timeframeDays, // How long they've been tracking
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing progress for', progressData?.length, 'entries');

    const systemPrompt = `You are an expert fitness coach and data analyst. Analyze client progress data to identify trends, provide insights, and offer actionable recommendations. Be encouraging but realistic. Focus on both positive progress and areas for improvement.`;

    const userPrompt = `Analyze this fitness progress data:

Goal: ${goal || 'General fitness'}
Tracking Period: ${timeframeDays || 30} days
Number of Entries: ${progressData?.length || 0}

Progress Data:
${JSON.stringify(progressData, null, 2)}

Provide:
1. Overall progress assessment
2. Key trends identified (positive and negative)
3. Rate of change analysis
4. Specific recommendations for improvement
5. Motivational insights
6. Predicted outcomes if current trend continues`;

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
            name: 'analyze_progress',
            description: 'Provide structured progress analysis',
            parameters: {
              type: 'object',
              properties: {
                overallAssessment: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['excellent', 'good', 'on_track', 'needs_attention', 'stalled'] },
                    summary: { type: 'string' },
                    score: { type: 'number', description: 'Progress score 1-100' },
                  },
                },
                trends: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string', description: 'e.g., weight, body_fat, measurements' },
                      direction: { type: 'string', enum: ['improving', 'stable', 'declining'] },
                      rate: { type: 'string', description: 'e.g., 0.5kg/week' },
                      insight: { type: 'string' },
                    },
                  },
                },
                achievements: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Notable achievements to celebrate',
                },
                areasForImprovement: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      area: { type: 'string' },
                      currentState: { type: 'string' },
                      recommendation: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    },
                  },
                },
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category: { type: 'string', description: 'nutrition, training, recovery, mindset' },
                      suggestion: { type: 'string' },
                      impact: { type: 'string' },
                    },
                  },
                },
                prediction: {
                  type: 'object',
                  properties: {
                    twoWeeks: { type: 'string' },
                    oneMonth: { type: 'string' },
                    threeMonths: { type: 'string' },
                  },
                },
                motivationalMessage: { type: 'string' },
              },
              required: ['overallAssessment', 'trends', 'recommendations', 'motivationalMessage'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_progress' } },
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
      const analysis = JSON.parse(toolCall.function.arguments);
      console.log('Progress analysis complete:', analysis.overallAssessment?.status);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices?.[0]?.message?.content;
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-progress-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
