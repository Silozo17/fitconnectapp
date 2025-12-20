import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[STRIPE-CHECKOUT] ${step}${detailsStr}`);
  }
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
      embedded, // flag for embedded checkout mode
    } = await req.json();

    logStep("Creating checkout session", { type, itemId, clientId, coachId, embedded });

    // Get coach's Stripe Connect account
    const { data: coachProfile, error: coachError } = await supabase
      .from("coach_profiles")
      .select("stripe_connect_id, stripe_connect_onboarded, display_name, currency")
      .eq("id", coachId)
      .single();

    if (coachError || !coachProfile?.stripe_connect_id || !coachProfile?.stripe_connect_onboarded) {
      throw new Error("Coach has not set up payment processing yet");
    }

    // Get coach's VAT settings
    const { data: invoiceSettings } = await supabase
      .from("coach_invoice_settings")
      .select("vat_registered, vat_rate, vat_inclusive")
      .eq("coach_id", coachId)
      .maybeSingle();

    const isVatRegistered = invoiceSettings?.vat_registered || false;
    const vatRate = invoiceSettings?.vat_rate || 0;
    const isVatInclusive = invoiceSettings?.vat_inclusive || false;

    logStep("VAT settings", { isVatRegistered, vatRate, isVatInclusive });

    // Get coach's platform subscription to determine commission rate
    const { data: platformSub } = await supabase
      .from("platform_subscriptions")
      .select("tier")
      .eq("coach_id", coachId)
      .eq("status", "active")
      .maybeSingle();

    // Determine commission based on tier (default to free tier if no subscription)
    const tier = platformSub?.tier || "free";
    // Commission rates: free=4%, starter=3%, pro=2%, enterprise=1%, founder=0%
    const commissionRates: Record<string, number> = { free: 4, starter: 3, pro: 2, enterprise: 1, founder: 0 };
    const applicationFeePercent = commissionRates[tier] || 4;

    logStep("Coach subscription tier", { tier, applicationFeePercent });

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let mode: "payment" | "subscription" = "payment";
    let metadata: Record<string, string> = {
      client_id: clientId,
      coach_id: coachId,
      type,
      item_id: itemId,
      vat_registered: String(isVatRegistered),
      vat_rate: String(vatRate),
      vat_inclusive: String(isVatInclusive),
    };

    if (type === "package") {
      // SECURITY: Fetch package price from database - never trust client-provided amounts
      const { data: pkg, error: pkgError } = await supabase
        .from("coach_packages")
        .select("id, name, price, session_count, validity_days, currency, coach_id, is_active")
        .eq("id", itemId)
        .eq("is_active", true)
        .single();

      if (pkgError || !pkg) {
        throw new Error("Package not found or inactive");
      }

      // SECURITY: Validate package belongs to the specified coach
      if (pkg.coach_id !== coachId) {
        throw new Error("Package does not belong to this coach");
      }

      const currency = (pkg.currency || coachProfile.currency || 'GBP').toLowerCase();
      let unitAmount = Math.round(pkg.price * 100);
      let description = `${pkg.session_count} sessions - Valid for ${pkg.validity_days} days`;

      logStep("Package validated from DB", { 
        id: pkg.id, 
        name: pkg.name, 
        price: pkg.price,
        currency 
      });

      // Apply VAT if registered and NOT inclusive (i.e., add VAT on top)
      if (isVatRegistered && vatRate > 0 && !isVatInclusive) {
        const vatAmount = Math.round(unitAmount * vatRate / 100);
        unitAmount = unitAmount + vatAmount;
        description += ` (incl. ${vatRate}% VAT)`;
      } else if (isVatRegistered && isVatInclusive) {
        description += ` (incl. VAT)`;
      }

      lineItems = [{
        price_data: {
          currency: currency,
          product_data: {
            name: pkg.name,
            description: description,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }];

      metadata.sessions_total = String(pkg.session_count);
      metadata.validity_days = String(pkg.validity_days);
      metadata.amount = String(pkg.price);
      metadata.currency = currency.toUpperCase();

    } else if (type === "subscription") {
      // SECURITY: Fetch subscription plan price from database - never trust client-provided amounts
      const { data: plan, error: planError } = await supabase
        .from("coach_subscription_plans")
        .select("id, name, price, description, billing_period, currency, coach_id, is_active")
        .eq("id", itemId)
        .eq("is_active", true)
        .single();

      if (planError || !plan) {
        throw new Error("Subscription plan not found or inactive");
      }

      // SECURITY: Validate plan belongs to the specified coach
      if (plan.coach_id !== coachId) {
        throw new Error("Subscription plan does not belong to this coach");
      }

      const currency = (plan.currency || coachProfile.currency || 'GBP').toLowerCase();
      let unitAmount = Math.round(plan.price * 100);
      let description = plan.description || `${plan.billing_period} subscription`;

      logStep("Plan validated from DB", { 
        id: plan.id, 
        name: plan.name, 
        price: plan.price,
        currency 
      });

      // Apply VAT if registered and NOT inclusive
      if (isVatRegistered && vatRate > 0 && !isVatInclusive) {
        const vatAmount = Math.round(unitAmount * vatRate / 100);
        unitAmount = unitAmount + vatAmount;
        description += ` (incl. ${vatRate}% VAT)`;
      } else if (isVatRegistered && isVatInclusive) {
        description += ` (incl. VAT)`;
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
          currency: currency,
          product_data: {
            name: plan.name,
            description: description,
          },
          unit_amount: unitAmount,
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
      metadata.currency = currency.toUpperCase();
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      // Add embedded mode support
      ...(embedded ? { ui_mode: "embedded", return_url: successUrl } : {}),
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

    // Remove success_url and cancel_url for embedded mode
    if (embedded) {
      delete sessionParams.success_url;
      delete sessionParams.cancel_url;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
        clientSecret: session.client_secret,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[STRIPE-CHECKOUT] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
