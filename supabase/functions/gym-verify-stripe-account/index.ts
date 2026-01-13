import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GYM-VERIFY-STRIPE] ${step}${detailsStr}`);
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
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

    // Parse request body
    const { gymId, accountId } = await req.json();
    if (!gymId) throw new Error("Missing gymId parameter");

    // Get gym details
    const { data: gym, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, user_id, stripe_account_id")
      .eq("id", gymId)
      .single();

    if (gymError) throw new Error(`Failed to fetch gym: ${gymError.message}`);
    if (!gym) throw new Error("Gym not found");
    if (gym.user_id !== user.id) throw new Error("Only gym owner can verify Stripe account");

    const stripeAccountId = accountId || gym.stripe_account_id;
    if (!stripeAccountId) throw new Error("No Stripe account to verify");

    // Initialize Stripe and retrieve account
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(stripeAccountId);

    logStep("Stripe account retrieved", {
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // Determine account status
    let status: string;
    if (account.charges_enabled && account.payouts_enabled) {
      status = "active";
    } else if (account.details_submitted) {
      status = "pending_verification";
    } else {
      status = "pending";
    }

    // Update gym profile with status
    const { error: updateError } = await supabaseClient
      .from("gym_profiles")
      .update({
        stripe_account_id: stripeAccountId,
        stripe_account_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gymId);

    if (updateError) {
      logStep("Warning: Failed to update gym profile", { error: updateError.message });
    }

    logStep("Verification complete", { status });

    return new Response(
      JSON.stringify({
        accountId: stripeAccountId,
        status,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
