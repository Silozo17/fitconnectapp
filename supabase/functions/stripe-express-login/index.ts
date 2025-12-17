import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-EXPRESS-LOGIN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get coach profile with Stripe Connect ID
    const { data: coachProfile, error: profileError } = await supabaseClient
      .from("coach_profiles")
      .select("id, stripe_connect_id, stripe_connect_onboarded")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) throw new Error(`Failed to fetch coach profile: ${profileError.message}`);
    if (!coachProfile) throw new Error("Coach profile not found");
    if (!coachProfile.stripe_connect_id) throw new Error("Stripe account not connected");
    if (!coachProfile.stripe_connect_onboarded) throw new Error("Stripe onboarding not completed");

    logStep("Coach profile found", { coachId: coachProfile.id, stripeAccountId: coachProfile.stripe_connect_id });

    // Initialize Stripe and create login link
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const loginLink = await stripe.accounts.createLoginLink(coachProfile.stripe_connect_id);
    logStep("Login link created", { url: loginLink.url });

    return new Response(JSON.stringify({ url: loginLink.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
