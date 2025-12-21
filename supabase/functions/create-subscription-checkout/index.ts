import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { 
  getSubscriptionPriceId, 
  getCurrency,
  getActivePricing,
  validateSubscriptionPriceId,
  type SubscriptionTier,
  type BillingInterval 
} from "../_shared/pricing-config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
  }
};

// Valid tiers and intervals for validation
const VALID_TIERS = ["starter", "pro", "enterprise"] as const;
const VALID_INTERVALS = ["monthly", "yearly"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const { tier, billingInterval, countryCode } = await req.json() as {
      tier: string;
      billingInterval: string;
      countryCode?: string;
    };

    logStep("Creating checkout", { tier, billingInterval, countryCode, userId: user.id });

    // SECURITY: Validate tier and interval against known values
    if (!VALID_TIERS.includes(tier as SubscriptionTier)) {
      throw new Error("Invalid subscription tier");
    }
    if (!VALID_INTERVALS.includes(billingInterval as BillingInterval)) {
      throw new Error("Invalid billing interval");
    }

    // Get the correct price ID based on country (defaults to GB if not provided)
    const priceId = getSubscriptionPriceId(
      countryCode, 
      tier as SubscriptionTier, 
      billingInterval as BillingInterval
    );
    const currency = getCurrency(countryCode);
    
    // SECURITY: Validate that the derived priceId matches expected country's price IDs
    const activePricing = getActivePricing(countryCode);
    const validation = validateSubscriptionPriceId(priceId, countryCode);
    
    if (!validation.valid) {
      logStep("Price validation failed", { priceId, countryCode, expectedCountry: validation.expectedCountry });
      throw new Error("Price configuration mismatch - please refresh and try again");
    }
    
    // Also verify currency matches country
    if (currency !== activePricing.currency) {
      logStep("Currency validation failed", { currency, expectedCurrency: activePricing.currency });
      throw new Error("Currency configuration mismatch");
    }
    
    logStep("Validated price and currency match country", { 
      priceId, 
      tier, 
      billingInterval, 
      countryCode, 
      currency,
      country: activePricing.country 
    });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Check for existing active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        throw new Error("You already have an active subscription. Please manage it from your dashboard.");
      }
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create checkout session with embedded mode
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      ui_mode: "embedded",
      return_url: `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        type: "platform_subscription",
        user_id: user.id,
        tier,
        billing_interval: billingInterval,
        country_code: countryCode || "GB",
        currency,
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({ 
        clientSecret: session.client_secret,
        sessionId: session.id,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[CREATE-SUBSCRIPTION-CHECKOUT] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      }
    );
  }
});
