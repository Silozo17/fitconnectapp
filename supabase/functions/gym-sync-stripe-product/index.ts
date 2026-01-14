import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[GYM-SYNC-STRIPE-PRODUCT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Now accepts optional locationId for per-location product sync
    const { gymId, planId, locationId } = await req.json();
    if (!gymId || !planId) throw new Error("Missing gymId or planId");
    logStep("Request received", { gymId, planId, locationId });

    // Check if user is staff at this gym
    const { data: staffRecord } = await supabaseClient
      .from("gym_staff")
      .select("role")
      .eq("gym_id", gymId)
      .eq("user_id", user.id)
      .single();

    if (!staffRecord || !["owner", "manager"].includes(staffRecord.role)) {
      throw new Error("Unauthorized - must be gym owner or manager");
    }

    // Get Stripe account - prioritize location, then gym profile
    let stripeAccountId: string | null = null;
    let currency = "gbp";

    if (locationId) {
      // Get Stripe account from specific location
      const { data: location, error: locationError } = await supabaseClient
        .from("gym_locations")
        .select("id, name, stripe_account_id, stripe_onboarding_complete, currency")
        .eq("id", locationId)
        .eq("gym_id", gymId)
        .single();

      if (locationError) throw new Error(`Location not found: ${locationError.message}`);
      if (!location.stripe_account_id || !location.stripe_onboarding_complete) {
        throw new Error("Location must complete Stripe Connect setup first");
      }
      
      stripeAccountId = location.stripe_account_id;
      currency = location.currency || "gbp";
      logStep("Using location Stripe account", { locationId: location.id, stripeAccount: stripeAccountId });
    } else {
      // Try to get from primary location first
      const { data: locations } = await supabaseClient
        .from("gym_locations")
        .select("id, name, stripe_account_id, stripe_onboarding_complete, currency, is_primary")
        .eq("gym_id", gymId)
        .eq("is_active", true)
        .eq("stripe_onboarding_complete", true)
        .order("is_primary", { ascending: false })
        .limit(1);

      if (locations && locations.length > 0) {
        stripeAccountId = locations[0].stripe_account_id;
        currency = locations[0].currency || "gbp";
        logStep("Using primary location Stripe account", { locationId: locations[0].id, stripeAccount: stripeAccountId });
      } else {
        // Fallback to gym profile for legacy setups
        const { data: gym, error: gymError } = await supabaseClient
          .from("gym_profiles")
          .select("id, name, stripe_account_id, stripe_onboarding_complete, currency")
          .eq("id", gymId)
          .single();

        if (gymError || !gym) throw new Error("Gym not found");
        if (!gym.stripe_account_id || !gym.stripe_onboarding_complete) {
          throw new Error("Gym must complete Stripe Connect setup first");
        }
        
        stripeAccountId = gym.stripe_account_id;
        currency = gym.currency || "gbp";
        logStep("Using legacy gym Stripe account", { gymId: gym.id, stripeAccount: stripeAccountId });
      }
    }

    // Get the membership plan
    const { data: plan, error: planError } = await supabaseClient
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .eq("gym_id", gymId)
      .single();

    if (planError || !plan) throw new Error("Plan not found");
    logStep("Plan found", { planId: plan.id, name: plan.name });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Determine Stripe billing interval
    let stripeInterval: Stripe.Price.Recurring.Interval | null = null;
    if (plan.plan_type === "recurring" && plan.billing_interval) {
      const intervalMap: Record<string, Stripe.Price.Recurring.Interval> = {
        week: "week",
        month: "month",
        year: "year",
      };
      stripeInterval = intervalMap[plan.billing_interval] || "month";
    }

    // Build product metadata
    const productMetadata = {
      gym_id: gymId,
      plan_id: planId,
      plan_type: plan.plan_type,
      location_id: locationId || "all",
    };

    let stripeProductId = plan.stripe_product_id;
    let stripePriceId = plan.stripe_price_id;

    // Create or update product on connected account
    if (stripeProductId) {
      // Update existing product
      logStep("Updating existing product", { productId: stripeProductId });
      await stripe.products.update(
        stripeProductId,
        {
          name: plan.name,
          description: plan.description || undefined,
          metadata: productMetadata,
        },
        { stripeAccount: stripeAccountId }
      );
    } else {
      // Create new product
      logStep("Creating new product");
      const product = await stripe.products.create(
        {
          name: plan.name,
          description: plan.description || undefined,
          metadata: productMetadata,
        },
        { stripeAccount: stripeAccountId }
      );
      stripeProductId = product.id;
      logStep("Product created", { productId: stripeProductId });
    }

    // Check if we need to create a new price
    // (prices are immutable in Stripe, so we create a new one if amount changes)
    const needsNewPrice = !stripePriceId;

    if (needsNewPrice) {
      logStep("Creating new price");
      
      const priceData: Stripe.PriceCreateParams = {
        product: stripeProductId,
        unit_amount: plan.price_amount,
        currency: (plan.currency || currency).toLowerCase(),
        metadata: {
          plan_id: planId,
          gym_id: gymId,
          location_id: locationId || "all",
        },
      };

      // Add recurring config for subscriptions
      if (plan.plan_type === "recurring" && stripeInterval) {
        priceData.recurring = {
          interval: stripeInterval,
          interval_count: plan.billing_interval_count || 1,
        };
      }

      const price = await stripe.prices.create(
        priceData,
        { stripeAccount: stripeAccountId }
      );
      stripePriceId = price.id;
      logStep("Price created", { priceId: stripePriceId });
    }

    // Update the plan in database with Stripe IDs
    const { error: updateError } = await supabaseClient
      .from("membership_plans")
      .update({
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
      })
      .eq("id", planId);

    if (updateError) {
      console.error("Failed to update plan with Stripe IDs:", updateError);
    }

    logStep("Sync complete", { stripeProductId, stripePriceId });

    return new Response(
      JSON.stringify({
        success: true,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
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
