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

    // Parse request body - now accepts locationId for per-location Stripe
    const { gymId, locationId, returnUrl, existingAccountId } = await req.json();
    if (!gymId || !returnUrl) throw new Error("Missing required parameters");

    // Verify user is gym owner or manager
    const { data: staffRecord } = await supabaseClient
      .from("gym_staff")
      .select("role")
      .eq("gym_id", gymId)
      .eq("user_id", user.id)
      .single();

    // Also check if user is the gym owner via gym_profiles
    const { data: gymData, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, name, slug, user_id")
      .eq("id", gymId)
      .single();

    if (gymError) throw new Error(`Failed to fetch gym: ${gymError.message}`);
    if (!gymData) throw new Error("Gym not found");
    
    const isOwner = gymData.user_id === user.id;
    const isStaffWithPermission = staffRecord && ["owner", "manager"].includes(staffRecord.role);
    
    if (!isOwner && !isStaffWithPermission) {
      throw new Error("Only gym owner or manager can set up Stripe Connect");
    }

    logStep("Gym verified", { gymId: gymData.id, name: gymData.name });

    // If locationId is provided, we're setting up Stripe for a specific location
    let locationData: { id: string; name: string; stripe_account_id: string | null; stripe_account_status: string | null } | null = null;
    if (locationId) {
      const { data: location, error: locationError } = await supabaseClient
        .from("gym_locations")
        .select("id, name, stripe_account_id, stripe_account_status")
        .eq("id", locationId)
        .eq("gym_id", gymId)
        .single();

      if (locationError) throw new Error(`Failed to fetch location: ${locationError.message}`);
      if (!location) throw new Error("Location not found");
      
      locationData = location;
      logStep("Location verified", { locationId: location.id, name: location.name });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get existing account ID from location or parameter
    let accountId = existingAccountId || locationData?.stripe_account_id;

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
          location_id: locationId || "all",
          location_name: locationData?.name || "All Locations",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      logStep("Stripe account created", { accountId });

      // Save account ID to the appropriate table
      if (locationId) {
        // Save to gym_locations
        const { error: updateError } = await supabaseClient
          .from("gym_locations")
          .update({
            stripe_account_id: accountId,
            stripe_account_status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", locationId);

        if (updateError) {
          logStep("Warning: Failed to save Stripe account ID to location", { error: updateError.message });
        }
      } else {
        // Legacy: Save to gym_profiles for backward compatibility
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
    }

    // Create an account link for onboarding
    const successParams = locationId 
      ? `success=true&account_id=${accountId}&location_id=${locationId}`
      : `success=true&account_id=${accountId}`;
      
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?refresh=true${locationId ? `&location_id=${locationId}` : ''}`,
      return_url: `${returnUrl}?${successParams}`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        accountId,
        locationId,
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
