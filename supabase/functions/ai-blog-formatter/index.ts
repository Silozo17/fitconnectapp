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

    const systemPrompt = `You are an expert blog content editor and SEO specialist. Transform raw text into beautifully formatted, scannable, SEO-optimized blog content.

CRITICAL FORMATTING RULES:
1. Use semantic HTML tags (not markdown)
2. Start with a compelling intro paragraph (2-3 sentences) that hooks readers
3. Structure with H2 headings for main sections - make them engaging questions or benefit-focused
4. Use H3 subheadings within sections for sub-topics
5. Paragraphs MUST be short: 2-4 sentences max, wrapped in <p> tags
6. Add VISUAL BREATHING ROOM - don't create walls of text
7. Use <ul>/<li> for bullet lists (3+ related items) - bullets improve scannability
8. Use <ol>/<li> for step-by-step or ranked items
9. Use <strong> to highlight key terms (2-3 per paragraph, not overused)
10. Use <em> sparingly for emphasis
11. Include a clear conclusion with actionable CTA
12. For fitness content: include actionable tips, expert insights, and practical advice

VISUAL HIERARCHY REQUIREMENTS:
- First paragraph: Hook with a relatable problem or compelling statistic
- Each H2 section: 150-250 words max
- Include at least one bulleted list per major section
- Add a "Key Takeaways" or "Quick Tips" box using: <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6"><strong>💡 Key Takeaway:</strong> ...</div>
- For quotes or expert tips use: <blockquote>...</blockquote>

SEO BEST PRACTICES:
- Meta title: Primary keyword first, benefit-focused, max 60 chars
- Meta description: Keyword + benefit + CTA, max 160 chars
- Keywords: 5-8 relevant LSI terms

RESPOND WITH VALID JSON ONLY (no markdown code blocks):
{
  "formattedContent": "Beautifully formatted HTML with proper spacing",
  "suggestedExcerpt": "Engaging 2-3 sentence summary for cards",
  "suggestedMetaTitle": "SEO title max 60 chars",
  "suggestedMetaDescription": "Compelling description max 160 chars",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
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
    
    // Remove markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    // Try to extract JSON object if there's extra content
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error, attempting to fix common issues...');
      console.error('Raw content (first 500 chars):', cleanedContent.substring(0, 500));
      
      // Try to fix common JSON issues - unescaped newlines in strings
      let fixedContent = cleanedContent
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      // Try parsing again
      try {
        result = JSON.parse(fixedContent);
      } catch (secondError) {
        // Last resort: try to extract fields manually
        console.error('Second parse failed, extracting fields manually...');
        
        const formattedContentMatch = cleanedContent.match(/"formattedContent"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedExcerpt"/);
        const excerptMatch = cleanedContent.match(/"suggestedExcerpt"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedMetaTitle"/);
        const metaTitleMatch = cleanedContent.match(/"suggestedMetaTitle"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedMetaDescription"/);
        const metaDescMatch = cleanedContent.match(/"suggestedMetaDescription"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedKeywords"/);
        const keywordsMatch = cleanedContent.match(/"suggestedKeywords"\s*:\s*\[([\s\S]*?)\]/);

        result = {
          formattedContent: formattedContentMatch?.[1]?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || content,
          suggestedExcerpt: excerptMatch?.[1]?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || '',
          suggestedMetaTitle: metaTitleMatch?.[1]?.replace(/\\"/g, '"') || title || '',
          suggestedMetaDescription: metaDescMatch?.[1]?.replace(/\\"/g, '"') || '',
          suggestedKeywords: keywordsMatch?.[1]?.match(/"([^"]+)"/g)?.map((k: string) => k.replace(/"/g, '')) || []
        };
        
        console.log('Extracted result manually:', Object.keys(result));
      }
    }

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
