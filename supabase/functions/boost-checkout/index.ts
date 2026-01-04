import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getBoostPriceId, getCurrency, getActivePricing, validateBoostPriceId } from "../_shared/pricing-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[BOOST-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get country code and native app flag from request body
    const { countryCode, isNativeApp } = await req.json() as { countryCode?: string; isNativeApp?: boolean };
    logStep("Request parsed", { countryCode, isNativeApp });

    // PHASE 6: Hard block Stripe checkout on native platforms (backend enforcement)
    // Check both explicit flag and User-Agent for native app indicators
    const userAgent = req.headers.get("user-agent") || "";
    const isNativeRequest = isNativeApp === true || 
      userAgent.includes("Despia") || 
      userAgent.includes("FitConnect-iOS") || 
      userAgent.includes("FitConnect-Android");
    
    if (isNativeRequest) {
      logStep("BLOCKED: Native app attempted Stripe boost checkout", { userAgent, isNativeApp });
      throw new Error("Stripe boost checkout is not available in the mobile app. Please use in-app purchases.");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error(`Authentication error: ${userError?.message || "No user found"}`);
    }
    
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get coach profile
    const { data: coachProfile, error: coachError } = await supabase
      .from("coach_profiles")
      .select("id, display_name, user_id")
      .eq("user_id", user.id)
      .single();

    if (coachError || !coachProfile) {
      throw new Error("Coach profile not found");
    }
    logStep("Coach profile found", { coachId: coachProfile.id });

    // Check for existing active boost
    const { data: existingBoost } = await supabase
      .from("coach_boosts")
      .select("id, boost_end_date, payment_status, updated_at")
      .eq("coach_id", coachProfile.id)
      .maybeSingle();

    // Check if boost is still active - allow purchase for stacking (early renewal)
    if (existingBoost?.boost_end_date) {
      const endDate = new Date(existingBoost.boost_end_date);
      if (endDate > new Date() && (existingBoost.payment_status === "succeeded" || existingBoost.payment_status === "migrated_free")) {
        // Allow early renewal - time will stack from existing end date
        logStep("Active boost found - will stack new period from end date", { currentEndDate: endDate.toISOString() });
      }
    }

    // Check if there's a pending payment - only block if updated in last 30 minutes
    if (existingBoost?.payment_status === "pending") {
      const updatedAt = new Date(existingBoost.updated_at || existingBoost.id);
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      if (updatedAt > thirtyMinutesAgo) {
        throw new Error("You have a pending Boost payment. Please complete or cancel it first.");
      }
      // Stale pending payment (>30 min old) - allow retry
      logStep("Stale pending payment found, allowing retry", { updatedAt: updatedAt.toISOString() });
    }

    logStep("No active boost found, proceeding with checkout");

    // Get boost settings for duration (price comes from Stripe price ID)
    const { data: boostSettings, error: settingsError } = await supabase
      .from("boost_settings")
      .select("boost_duration_days")
      .eq("is_active", true)
      .single();

    if (settingsError || !boostSettings) {
      throw new Error("Boost settings not found");
    }

    const durationDays = boostSettings.boost_duration_days || 30;

    // Get the correct price ID and currency based on country
    const priceId = getBoostPriceId(countryCode);
    const currency = getCurrency(countryCode);
    
    // SECURITY: Validate that the derived priceId matches expected country's price IDs
    const activePricing = getActivePricing(countryCode);
    const validation = validateBoostPriceId(priceId, countryCode);
    
    if (!validation.valid) {
      logStep("Boost price validation failed", { priceId, countryCode, expectedCountry: validation.expectedCountry, expectedPriceId: validation.expectedPriceId });
      throw new Error("Boost price configuration mismatch - please refresh and try again");
    }
    
    // Also verify currency matches country
    if (currency !== activePricing.currency) {
      logStep("Currency validation failed", { currency, expectedCurrency: activePricing.currency });
      throw new Error("Currency configuration mismatch");
    }
    
    logStep("Validated boost price and currency match country", { 
      priceId, 
      currency, 
      countryCode, 
      duration: durationDays,
      country: activePricing.country 
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
          coach_id: coachProfile.id,
        },
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Create checkout session using Stripe price ID
    const origin = req.headers.get("origin") || "https://fitconnect.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/dashboard/coach/boost?payment=success`,
      cancel_url: `${origin}/dashboard/coach/boost?payment=cancelled`,
      metadata: {
        type: "boost_activation",
        coach_id: coachProfile.id,
        duration_days: durationDays.toString(),
        country_code: countryCode || "GB",
        currency,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update boost record to pending (or create if doesn't exist)
    if (existingBoost) {
      await supabase
        .from("coach_boosts")
        .update({
          payment_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBoost.id);
    } else {
      await supabase
        .from("coach_boosts")
        .insert({
          coach_id: coachProfile.id,
          is_active: false,
          payment_status: "pending",
        });
    }

    logStep("Boost record updated to pending");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
