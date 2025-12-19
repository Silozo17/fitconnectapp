import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SECURITY: Price IDs are hardcoded server-side - amounts come from Stripe, not client
const PRICE_IDS = {
  starter: {
    monthly: "price_1Sf80vEztIBHKDEerFCQIjUR",
    yearly: "price_1Sf812EztIBHKDEevWTflleJ",
  },
  pro: {
    monthly: "price_1Sf80wEztIBHKDEeO6RxdYCU",
    yearly: "price_1Sf813EztIBHKDEeqPNPZoRy",
  },
  enterprise: {
    monthly: "price_1Sf80xEztIBHKDEegrV6T1T7",
    yearly: "price_1Sf814EztIBHKDEevMuXmU4J",
  },
} as const;

const logStep = (step: string, details?: Record<string, unknown>) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[CREATE-SUBSCRIPTION-CHECKOUT] ${step}${detailsStr}`);
  }
};

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
    const { tier, billingInterval } = await req.json();

    logStep("Creating checkout", { tier, billingInterval, userId: user.id });

    // SECURITY: Validate tier and interval against known values
    if (!PRICE_IDS[tier as keyof typeof PRICE_IDS]) {
      throw new Error("Invalid subscription tier");
    }
    if (!["monthly", "yearly"].includes(billingInterval)) {
      throw new Error("Invalid billing interval");
    }

    // SECURITY: Price ID is fetched from server-side constant, not from client
    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS][billingInterval as "monthly" | "yearly"];
    
    logStep("Using price ID", { priceId, tier, billingInterval });

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
