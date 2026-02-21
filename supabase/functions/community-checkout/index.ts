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

    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    const { communityId, discountCode, returnUrl } = await req.json();
    if (!communityId) throw new Error("communityId is required");

    // Fetch the community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("*, coach_id")
      .eq("id", communityId)
      .single();

    if (communityError || !community) throw new Error("Community not found");
    if (community.access_type === "free") throw new Error("Community is free, no checkout needed");

    // Get client profile
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!clientProfile) throw new Error("Client profile not found");

    // Get coach's Stripe Connect account
    const { data: coachProfile } = await supabase
      .from("coach_profiles")
      .select("stripe_connect_id, stripe_connect_onboarded, display_name, currency")
      .eq("id", community.coach_id)
      .single();

    if (!coachProfile?.stripe_connect_id || !coachProfile?.stripe_connect_onboarded) {
      throw new Error("Coach has not set up payment processing yet");
    }

    // Get commission rate
    const { data: platformSub } = await supabase
      .from("platform_subscriptions")
      .select("tier")
      .eq("coach_id", community.coach_id)
      .eq("status", "active")
      .maybeSingle();

    const tier = platformSub?.tier || "free";
    const commissionRates: Record<string, number> = { free: 4, starter: 3, pro: 2, enterprise: 1, founder: 1 };
    const applicationFeePercent = Math.max(1, Math.min(4, commissionRates[tier] || 4));

    // Calculate price
    let price = community.access_type === "subscription"
      ? (community.monthly_price || 0)
      : (community.price || 0);
    
    const currency = (community.currency || "GBP").toLowerCase();

    // Validate discount code
    let discountApplied = false;
    if (discountCode && community.discount_code &&
        discountCode.toUpperCase() === community.discount_code.toUpperCase() &&
        community.discount_percent) {
      price = price * (1 - community.discount_percent / 100);
      discountApplied = true;
    }

    const unitAmount = Math.round(price * 100);
    if (unitAmount <= 0) throw new Error("Invalid price");

    const mode: "payment" | "subscription" = community.access_type === "subscription" ? "subscription" : "payment";

    const metadata: Record<string, string> = {
      type: community.access_type === "subscription" ? "community_subscription" : "community_access",
      community_id: communityId,
      client_id: clientProfile.id,
      coach_id: community.coach_id,
      user_id: user.id,
      amount: String(price),
      currency: currency.toUpperCase(),
      discount_applied: String(discountApplied),
    };

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price_data: {
        currency,
        product_data: {
          name: community.name || "Community Access",
          description: community.access_type === "subscription"
            ? "Monthly community membership"
            : "One-time community access",
        },
        unit_amount: unitAmount,
        ...(mode === "subscription" ? {
          recurring: { interval: "month" as const, interval_count: 1 },
        } : {}),
      },
      quantity: 1,
    }];

    const successUrl = returnUrl || `${req.headers.get("origin") || ""}/dashboard/client/community/${communityId}?checkout=success`;
    const cancelUrl = `${req.headers.get("origin") || ""}/dashboard/client/community?checkout=cancelled`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: mode === "payment" ? {
        application_fee_amount: Math.round(unitAmount * applicationFeePercent / 100),
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
        ...(community.trial_days > 0 ? { trial_period_days: community.trial_days } : {}),
      } : undefined,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("Community checkout session created:", session.id, metadata);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[COMMUNITY-CHECKOUT] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
