import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClientContext {
  clientName: string;
  goal?: string;
  recentProgress?: string;
  lastContactDays?: number;
  reason: string;
  reasonContext?: string;
  achievements?: string[];
}

interface GenerateRequest {
  context: ClientContext;
  tone: "motivational" | "supportive" | "professional";
  coachName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context, tone, coachName } = (await req.json()) as GenerateRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneDescriptions = {
      motivational: "upbeat, energetic, and encouraging with positive reinforcement",
      supportive: "warm, empathetic, and understanding with gentle encouragement", 
      professional: "clear, direct, and respectful while maintaining warmth"
    };

    const systemPrompt = `You are a fitness coach's AI assistant helping compose personalized check-in messages for clients.
Your task is to write a short, genuine message (2-4 sentences) that feels personal and authentic.

Guidelines:
- Use a ${toneDescriptions[tone]} tone
- Address the client by their first name
- Reference their specific situation when context is provided
- Keep messages concise but meaningful
- Avoid generic platitudes - be specific
- End with an open question or invitation to respond
- Do NOT include greetings like "Hi" or sign-offs like "Best regards"
- Do NOT use emojis excessively (1-2 max if appropriate)

The coach's name is ${coachName || "your coach"}.`;

    const userPrompt = `Generate a check-in message for ${context.clientName}.

Reason for check-in: ${context.reason}
${context.reasonContext ? `Context: ${context.reasonContext}` : ""}
${context.goal ? `Their goal: ${context.goal}` : ""}
${context.recentProgress ? `Recent progress: ${context.recentProgress}` : ""}
${context.lastContactDays ? `Days since last contact: ${context.lastContactDays}` : ""}
${context.achievements?.length ? `Recent achievements: ${context.achievements.join(", ")}` : ""}

Write a personalized check-in message:`;

    console.log("[generate-checkin-message] Generating message for:", context.clientName, "with tone:", tone);

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
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[generate-checkin-message] AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const generatedMessage = aiResponse.choices?.[0]?.message?.content?.trim();

    if (!generatedMessage) {
      throw new Error("No message generated from AI");
    }

    console.log("[generate-checkin-message] Successfully generated message");

    return new Response(
      JSON.stringify({ 
        message: generatedMessage,
        tone,
        clientName: context.clientName 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-checkin-message] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate message" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
