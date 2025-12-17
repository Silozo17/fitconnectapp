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
    const { content, title, category } = await req.json();
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert blog content editor and SEO specialist. Your task is to transform raw text into beautifully formatted, SEO-optimized blog content.

FORMAT THE CONTENT FOLLOWING THESE RULES:
1. Use HTML tags for formatting (not markdown)
2. Structure with H2 headings for main sections (every 250-350 words)
3. Use H3 subheadings for subsections where appropriate
4. Keep paragraphs short (3-4 sentences max, wrapped in <p> tags)
5. Use <ul>/<li> for bullet lists when there are 3+ related items
6. Use <ol>/<li> for sequential/numbered items
7. Use <strong> for key terms and important phrases (2-4 per section)
8. Use <em> for emphasis sparingly
9. Add a compelling intro paragraph that hooks the reader
10. Include a clear conclusion with actionable takeaway
11. Use question-based headings where appropriate (good for featured snippets)

SEO BEST PRACTICES:
- Meta title: Primary keyword near start, max 60 chars, compelling
- Meta description: Include keyword, call-to-action, max 160 chars
- Keywords: 5-8 relevant terms based on content analysis

RESPOND WITH VALID JSON ONLY (no markdown code blocks):
{
  "formattedContent": "HTML formatted content here",
  "suggestedExcerpt": "2-3 sentence summary for blog cards",
  "suggestedMetaTitle": "SEO title max 60 chars",
  "suggestedMetaDescription": "SEO description max 160 chars with CTA",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const userPrompt = `Format this blog content for optimal readability and SEO.

${title ? `Title: ${title}` : ''}
${category ? `Category: ${category}` : ''}

RAW CONTENT:
${content}

Remember: Return ONLY valid JSON, no markdown formatting around it.`;

    console.log('Calling Lovable AI Gateway for blog formatting...');

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing...');

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = aiContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    // Parse the JSON response
    const result = JSON.parse(cleanedContent);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-blog-formatter:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to format content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
