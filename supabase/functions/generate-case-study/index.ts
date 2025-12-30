import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { showcaseId, title } = await req.json();
    console.log("Generating case study for showcase:", showcaseId);

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("id, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    if (!coachProfile) {
      return new Response(JSON.stringify({ error: "Coach profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get showcase data
    const { data: showcase } = await supabase
      .from("coach_outcome_showcases")
      .select(`
        *,
        client:client_profiles(first_name, last_name, fitness_goals)
      `)
      .eq("id", showcaseId)
      .eq("coach_id", coachProfile.id)
      .single();

    if (!showcase) {
      return new Response(JSON.stringify({ error: "Showcase not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client review if available
    const { data: review } = await supabase
      .from("reviews")
      .select("review_text, rating")
      .eq("coach_id", coachProfile.id)
      .eq("client_id", showcase.client_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build case study content
    const clientName = showcase.is_anonymous 
      ? "Client" 
      : `${showcase.client?.first_name || "Client"}`;
    
    const durationWeeks = showcase.duration_weeks || 12;
    const weightChange = showcase.starting_weight && showcase.ending_weight 
      ? showcase.ending_weight - showcase.starting_weight 
      : null;
    
    const goals = showcase.client?.fitness_goals || [];

    const content = {
      summary: `A ${durationWeeks}-week transformation journey${weightChange ? ` resulting in ${Math.abs(weightChange).toFixed(1)}kg ${weightChange < 0 ? 'lost' : 'gained'}` : ''}.`,
      challenge: showcase.description || `${clientName} came to us looking to transform their fitness and achieve their goals${goals.length > 0 ? `: ${goals.join(', ')}` : ''}.`,
      approach: `Over ${durationWeeks} weeks, we implemented a structured program focusing on progressive training and nutrition optimization. The approach was tailored to ${clientName}'s specific needs and lifestyle.`,
      results: buildResultsSection(showcase, weightChange),
      testimonial: review?.review_text || null,
      rating: review?.rating || null,
      metrics: {
        duration_weeks: durationWeeks,
        weight_change: weightChange,
        starting_weight: showcase.starting_weight,
        ending_weight: showcase.ending_weight,
      }
    };

    // Generate narrative
    const narrative = `
## ${title || `${clientName}'s Transformation`}

### The Challenge
${content.challenge}

### Our Approach
${content.approach}

### Results
${content.results}

${content.testimonial ? `### In ${clientName}'s Words\n> "${content.testimonial}"` : ''}
    `.trim();

    // Insert case study
    const { data: caseStudy, error: insertError } = await supabase
      .from("case_studies")
      .insert({
        coach_id: coachProfile.id,
        showcase_id: showcaseId,
        client_id: showcase.client_id,
        title: title || `${clientName}'s Transformation`,
        content,
        generated_narrative: narrative,
        is_published: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting case study:", insertError);
      throw insertError;
    }

    console.log("Case study generated:", caseStudy.id);

    return new Response(
      JSON.stringify({ success: true, caseStudy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating case study:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildResultsSection(showcase: any, weightChange: number | null): string {
  const results: string[] = [];
  
  if (weightChange) {
    results.push(`${Math.abs(weightChange).toFixed(1)}kg ${weightChange < 0 ? 'lost' : 'gained'}`);
  }
  
  if (showcase.before_photos?.length && showcase.after_photos?.length) {
    results.push("visible physical transformation");
  }

  if (results.length === 0) {
    return "Achieved their fitness goals through consistent effort and dedication.";
  }

  return `Through dedicated effort and consistent training, the results speak for themselves: ${results.join(', ')}.`;
}
