import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GYM-STRIPE-CONNECT] ${step}${detailsStr}`);
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
    const { gymId, returnUrl, existingAccountId } = await req.json();
    if (!gymId || !returnUrl) throw new Error("Missing required parameters");

    // Verify user is gym owner
    const { data: gymData, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, name, slug, user_id, stripe_account_id, stripe_account_status")
      .eq("id", gymId)
      .single();

    if (gymError) throw new Error(`Failed to fetch gym: ${gymError.message}`);
    if (!gymData) throw new Error("Gym not found");
    if (gymData.user_id !== user.id) throw new Error("Only gym owner can set up Stripe Connect");

    logStep("Gym verified", { gymId: gymData.id, name: gymData.name });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let accountId = existingAccountId || gymData.stripe_account_id;

    // If we have an existing account ID, verify it exists
    if (accountId) {
      try {
        const existingAccount = await stripe.accounts.retrieve(accountId);
        if (existingAccount) {
          logStep("Using existing Stripe account", { accountId });
        }
      } catch {
        logStep("Existing account not found, creating new one");
        accountId = null;
      }
    }

    // Create a new account if needed
    if (!accountId) {
      logStep("Creating new Stripe Connect account");
      const account = await stripe.accounts.create({
        type: "express",
        business_type: "company",
        metadata: {
          gym_id: gymId,
          gym_name: gymData.name,
          gym_slug: gymData.slug,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      logStep("Stripe account created", { accountId });

      // Save account ID to gym profile
      const { error: updateError } = await supabaseClient
        .from("gym_profiles")
        .update({
          stripe_account_id: accountId,
          stripe_account_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gymId);

      if (updateError) {
        logStep("Warning: Failed to save Stripe account ID", { error: updateError.message });
      }
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?refresh=true`,
      return_url: `${returnUrl}?success=true&account_id=${accountId}`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        accountId,
        onboardingUrl: accountLink.url,
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
