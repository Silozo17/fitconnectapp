import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TierConfig {
  name: string;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // Check admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { action, tiers } = await req.json();
    console.log("[STRIPE-SYNC] Action:", action);

    if (action === "sync") {
      // Get tier configurations from request or use defaults
      const tierConfigs: TierConfig[] = tiers || [
        { name: "starter", displayName: "Starter", monthlyPrice: 1900, yearlyPrice: 19000, features: ["Up to 10 clients", "Basic features"] },
        { name: "pro", displayName: "Professional", monthlyPrice: 4900, yearlyPrice: 49000, features: ["Up to 50 clients", "All features", "Priority support"] },
        { name: "enterprise", displayName: "Enterprise", monthlyPrice: 9900, yearlyPrice: 99000, features: ["Unlimited clients", "White label", "API access"] },
      ];

      const results = [];

      for (const tier of tierConfigs) {
        console.log(`[STRIPE-SYNC] Processing tier: ${tier.name}`);

        // Check if tier already exists in our mapping
        const { data: existingTier } = await supabaseClient
          .from("platform_tier_stripe")
          .select("*")
          .eq("tier", tier.name)
          .single();

        let stripeProductId = existingTier?.stripe_product_id;
        let stripePriceIdMonthly = existingTier?.stripe_price_id_monthly;
        let stripePriceIdYearly = existingTier?.stripe_price_id_yearly;

        // Create or update Stripe product
        if (!stripeProductId) {
          const product = await stripe.products.create({
            name: `FitConnect ${tier.displayName}`,
            description: tier.features.join(", "),
            metadata: { tier: tier.name },
          });
          stripeProductId = product.id;
          console.log(`[STRIPE-SYNC] Created product: ${stripeProductId}`);
        } else {
          // Update existing product
          await stripe.products.update(stripeProductId, {
            name: `FitConnect ${tier.displayName}`,
            description: tier.features.join(", "),
          });
          console.log(`[STRIPE-SYNC] Updated product: ${stripeProductId}`);
        }

        // Create or update monthly price
        if (!stripePriceIdMonthly) {
          const monthlyPrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: tier.monthlyPrice,
            currency: "gbp",
            recurring: { interval: "month" },
            metadata: { tier: tier.name, billing: "monthly" },
          });
          stripePriceIdMonthly = monthlyPrice.id;
          console.log(`[STRIPE-SYNC] Created monthly price: ${stripePriceIdMonthly}`);
        }

        // Create or update yearly price
        if (!stripePriceIdYearly) {
          const yearlyPrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: tier.yearlyPrice,
            currency: "gbp",
            recurring: { interval: "year" },
            metadata: { tier: tier.name, billing: "yearly" },
          });
          stripePriceIdYearly = yearlyPrice.id;
          console.log(`[STRIPE-SYNC] Created yearly price: ${stripePriceIdYearly}`);
        }

        // Upsert to our mapping table
        const { error: upsertError } = await supabaseClient
          .from("platform_tier_stripe")
          .upsert({
            tier: tier.name,
            stripe_product_id: stripeProductId,
            stripe_price_id_monthly: stripePriceIdMonthly,
            stripe_price_id_yearly: stripePriceIdYearly,
            is_synced: true,
            last_synced_at: new Date().toISOString(),
          }, { onConflict: "tier" });

        if (upsertError) {
          console.error(`[STRIPE-SYNC] Error upserting tier ${tier.name}:`, upsertError);
        }

        results.push({
          tier: tier.name,
          stripeProductId,
          stripePriceIdMonthly,
          stripePriceIdYearly,
        });
      }

      return new Response(JSON.stringify({ success: true, tiers: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "get-status") {
      // Get current sync status
      const { data: tierStripe, error } = await supabaseClient
        .from("platform_tier_stripe")
        .select("*");

      if (error) throw error;

      return new Response(JSON.stringify({ tiers: tierStripe || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("[STRIPE-SYNC] Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
