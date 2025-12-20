import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      .select("id, boost_end_date, payment_status")
      .eq("coach_id", coachProfile.id)
      .maybeSingle();

    // Check if boost is still active (end date in the future)
    if (existingBoost?.boost_end_date) {
      const endDate = new Date(existingBoost.boost_end_date);
      if (endDate > new Date()) {
        throw new Error("You already have an active Boost. It expires on " + endDate.toLocaleDateString());
      }
    }

    // Check if there's a pending payment
    if (existingBoost?.payment_status === "pending") {
      throw new Error("You have a pending Boost payment. Please complete or cancel it first.");
    }

    logStep("No active boost found, proceeding with checkout");

    // Get boost settings for pricing
    const { data: boostSettings, error: settingsError } = await supabase
      .from("boost_settings")
      .select("boost_price, boost_duration_days")
      .eq("is_active", true)
      .single();

    if (settingsError || !boostSettings) {
      throw new Error("Boost settings not found");
    }

    const priceInPence = boostSettings.boost_price || 500; // Default £5
    const durationDays = boostSettings.boost_duration_days || 30;
    logStep("Boost settings", { price: priceInPence, duration: durationDays });

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

    // Create checkout session
    const origin = req.headers.get("origin") || "https://fitconnect.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Boost Activation",
              description: `${durationDays}-day Boost - Appear first in search results`,
            },
            unit_amount: priceInPence,
          },
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
        price_paid: priceInPence.toString(),
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
