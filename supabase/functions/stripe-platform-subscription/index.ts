import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Platform subscription tiers
const PLATFORM_TIERS = {
  starter: {
    name: "Starter",
    price: 1900, // £19/month in pence
    features: ["Up to 10 clients", "Basic analytics", "Email support"],
  },
  pro: {
    name: "Pro",
    price: 4900, // £49/month
    features: ["Unlimited clients", "Advanced analytics", "Priority support", "Custom branding"],
  },
  enterprise: {
    name: "Enterprise",
    price: 9900, // £99/month
    features: ["Everything in Pro", "API access", "Dedicated account manager", "White-label options"],
  },
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

    const { action, coachId, userId, email, tier, successUrl, cancelUrl } = await req.json();

    if (action === "create-checkout") {
      const tierConfig = PLATFORM_TIERS[tier as keyof typeof PLATFORM_TIERS];
      if (!tierConfig) {
        throw new Error("Invalid subscription tier");
      }

      console.log("Creating platform subscription checkout for:", coachId, tier);

      // Create or get Stripe customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      let customerId: string;

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { coach_id: coachId, user_id: userId },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "gbp",
            product_data: {
              name: `FitConnect ${tierConfig.name} Plan`,
              description: tierConfig.features.join(", "),
            },
            unit_amount: tierConfig.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: "platform_subscription",
          coach_id: coachId,
          user_id: userId,
          tier,
          amount: String(tierConfig.price / 100), // Store amount in pounds for invoice creation
          currency: "GBP",
        },
      });

      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (action === "get-portal-link") {
      console.log("Creating billing portal for:", coachId);

      // Find customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length === 0) {
        throw new Error("No subscription found");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: successUrl,
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (action === "get-tiers") {
      return new Response(
        JSON.stringify({ tiers: PLATFORM_TIERS }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in stripe-platform-subscription:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
