import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GYM-CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { gymId, returnUrl } = await req.json();
    if (!gymId || !returnUrl) {
      throw new Error("Missing required parameters: gymId, returnUrl");
    }

    // Get gym profile with Stripe account
    const { data: gym, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, stripe_account_id, stripe_account_status")
      .eq("id", gymId)
      .single();

    if (gymError) throw new Error(`Failed to fetch gym: ${gymError.message}`);
    if (!gym) throw new Error("Gym not found");
    if (!gym.stripe_account_id || gym.stripe_account_status !== "active") {
      throw new Error("Gym has not completed Stripe Connect setup");
    }

    logStep("Gym found", { gymId: gym.id, stripeAccount: gym.stripe_account_id });

    // Initialize Stripe with the connected account
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find the customer on the connected account
    const customers = await stripe.customers.list(
      { email: user.email, limit: 1 },
      { stripeAccount: gym.stripe_account_id }
    );

    if (customers.data.length === 0) {
      throw new Error("No subscription found for this user");
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Create a portal session on the connected account
    const portalSession = await stripe.billingPortal.sessions.create(
      {
        customer: customerId,
        return_url: returnUrl,
      },
      { stripeAccount: gym.stripe_account_id }
    );

    logStep("Portal session created", { sessionId: portalSession.id });

    return new Response(
      JSON.stringify({ url: portalSession.url }),
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
