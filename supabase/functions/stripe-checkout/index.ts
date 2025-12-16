import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      type, // 'package' or 'subscription'
      itemId, // package_id or plan_id
      clientId,
      coachId,
      successUrl,
      cancelUrl,
    } = await req.json();

    console.log("Creating checkout session:", { type, itemId, clientId, coachId });

    // Get coach's Stripe Connect account
    const { data: coachProfile, error: coachError } = await supabase
      .from("coach_profiles")
      .select("stripe_connect_id, stripe_connect_onboarded, display_name")
      .eq("id", coachId)
      .single();

    if (coachError || !coachProfile?.stripe_connect_id || !coachProfile?.stripe_connect_onboarded) {
      throw new Error("Coach has not set up payment processing yet");
    }

    // Get coach's platform subscription to determine commission rate
    const { data: platformSub } = await supabase
      .from("platform_subscriptions")
      .select("tier")
      .eq("coach_id", coachId)
      .eq("status", "active")
      .single();

    // Determine commission based on tier (default to free tier if no subscription)
    const tier = platformSub?.tier || "free";
    const commissionRates: Record<string, number> = { free: 4, starter: 3, pro: 2, enterprise: 1 };
    const applicationFeePercent = commissionRates[tier] || 4;

    console.log("Coach subscription tier:", tier, "Commission rate:", applicationFeePercent);

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let mode: "payment" | "subscription" = "payment";
    let metadata: Record<string, string> = {
      client_id: clientId,
      coach_id: coachId,
      type,
      item_id: itemId,
    };

    if (type === "package") {
      // Get package details
      const { data: pkg, error: pkgError } = await supabase
        .from("coach_packages")
        .select("*")
        .eq("id", itemId)
        .single();

      if (pkgError || !pkg) {
        throw new Error("Package not found");
      }

      lineItems = [{
        price_data: {
          currency: pkg.currency?.toLowerCase() || "gbp",
          product_data: {
            name: pkg.name,
            description: `${pkg.session_count} sessions - Valid for ${pkg.validity_days} days`,
          },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }];

      metadata.sessions_total = String(pkg.session_count);
      metadata.validity_days = String(pkg.validity_days);
      metadata.amount = String(pkg.price);

    } else if (type === "subscription") {
      // Get subscription plan details
      const { data: plan, error: planError } = await supabase
        .from("coach_subscription_plans")
        .select("*")
        .eq("id", itemId)
        .single();

      if (planError || !plan) {
        throw new Error("Subscription plan not found");
      }

      // Convert billing period to Stripe interval
      const intervalMap: Record<string, Stripe.Price.Recurring.Interval> = {
        monthly: "month",
        quarterly: "month",
        yearly: "year",
      };
      const intervalCount = plan.billing_period === "quarterly" ? 3 : 1;

      lineItems = [{
        price_data: {
          currency: plan.currency?.toLowerCase() || "gbp",
          product_data: {
            name: plan.name,
            description: plan.description || `${plan.billing_period} subscription`,
          },
          unit_amount: Math.round(plan.price * 100),
          recurring: {
            interval: intervalMap[plan.billing_period] || "month",
            interval_count: intervalCount,
          },
        },
        quantity: 1,
      }];

      mode = "subscription";
      metadata.plan_name = plan.name;
      metadata.billing_period = plan.billing_period;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: mode === "payment" ? {
        application_fee_amount: Math.round((metadata.amount ? parseFloat(metadata.amount) : 0) * 100 * applicationFeePercent / 100),
        transfer_data: {
          destination: coachProfile.stripe_connect_id,
        },
      } : undefined,
      subscription_data: mode === "subscription" ? {
        application_fee_percent: applicationFeePercent,
        transfer_data: {
          destination: coachProfile.stripe_connect_id,
        },
        metadata,
      } : undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in stripe-checkout:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
