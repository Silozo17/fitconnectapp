import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content_type, category, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "description") {
      systemPrompt = `You are a professional copywriter specializing in fitness and wellness digital products. Generate compelling, SEO-friendly product descriptions that convert browsers into buyers. Be concise, highlight benefits, and use action-oriented language.`;
      
      userPrompt = `Generate a product description for a digital ${content_type} product in the ${category} category.

Product Title: "${title}"

Please provide:
1. A short description (max 150 characters) - perfect for cards and SEO meta descriptions
2. A full description (2-3 paragraphs) - detailed, benefit-focused content that sells the product

Format your response as JSON:
{
  "short_description": "...",
  "full_description": "..."
}`;
    } else if (type === "tags") {
      systemPrompt = `You are an SEO expert for fitness and wellness content. Generate relevant, searchable tags that will help the product be discovered.`;
      
      userPrompt = `Suggest 5-8 relevant tags for this digital product:

Title: "${title}"
Type: ${content_type}
Category: ${category}

Return tags as a JSON array of lowercase strings, e.g. ["fitness", "workout", "strength training"]`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Try to parse as JSON, extracting from markdown code blocks if needed
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleanContent);
    } catch {
      // If parsing fails, return the raw content
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI product assist error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
