import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[CONTENT-CHECKOUT] ${step}${detailsStr}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { productId, bundleId, successUrl, cancelUrl, embedded } = await req.json();
    logStep("Request body", { productId, bundleId, embedded });

    if (!productId && !bundleId) {
      throw new Error("Either productId or bundleId is required");
    }

    // SECURITY: All pricing data is fetched from database, never from client input
    let coachId: string;
    let itemName: string;
    let itemPrice: number;
    let itemCurrency: string;
    let isBundle = false;

    if (productId) {
      // SECURITY: Fetch product price from database - never trust client-provided amounts
      const { data: product, error: productError } = await supabase
        .from("digital_products")
        .select("id, title, price, currency, coach_id, is_active")
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (productError || !product) throw new Error("Product not found or inactive");

      coachId = product.coach_id;
      itemName = product.title;
      itemPrice = product.price;
      itemCurrency = product.currency || "GBP";
      logStep("Product validated from DB", { 
        id: product.id, 
        title: product.title, 
        price: product.price,
        currency: itemCurrency
      });
    } else {
      // SECURITY: Fetch bundle price from database - never trust client-provided amounts
      const { data: bundle, error: bundleError } = await supabase
        .from("digital_bundles")
        .select("id, title, price, currency, coach_id, is_active")
        .eq("id", bundleId)
        .eq("is_active", true)
        .single();

      if (bundleError || !bundle) throw new Error("Bundle not found or inactive");

      coachId = bundle.coach_id;
      itemName = bundle.title;
      itemPrice = bundle.price;
      itemCurrency = bundle.currency || "GBP";
      isBundle = true;
      logStep("Bundle validated from DB", { 
        id: bundle.id, 
        title: bundle.title, 
        price: bundle.price,
        currency: itemCurrency
      });
    }

    // Validate price is positive
    if (itemPrice <= 0) {
      throw new Error("Invalid product price");
    }

    // Get coach's Stripe Connect ID
    const { data: coach, error: coachError } = await supabase
      .from("coach_profiles")
      .select("stripe_connect_id, stripe_connect_onboarded")
      .eq("id", coachId)
      .single();

    if (coachError) throw new Error("Coach not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Calculate platform fee (15%) - based on DB price, not client input
    const platformFee = Math.round(itemPrice * 0.15 * 100);
    const priceInCents = Math.round(itemPrice * 100);

    // Create checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: itemCurrency.toLowerCase(),
            product_data: {
              name: itemName,
              description: isBundle ? "Digital Content Bundle" : "Digital Content",
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type: "digital_content",
        product_id: productId || "",
        bundle_id: bundleId || "",
        user_id: user.id,
        coach_id: coachId,
      },
    };

    // Add embedded mode support
    if (embedded) {
      sessionParams.ui_mode = "embedded";
      sessionParams.return_url = successUrl || `${req.headers.get("origin")}/dashboard/client/library`;
    } else {
      sessionParams.success_url = successUrl || `${req.headers.get("origin")}/dashboard/client/library`;
      sessionParams.cancel_url = cancelUrl || `${req.headers.get("origin")}/marketplace`;
    }

    // If coach has Stripe Connect, split payment
    if (coach?.stripe_connect_id && coach?.stripe_connect_onboarded) {
      sessionParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: coach.stripe_connect_id,
        },
      };
      logStep("Using Stripe Connect", { 
        coachStripeId: coach.stripe_connect_id, 
        platformFee 
      });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    logStep("Checkout session created", { sessionId: session.id, embedded });

    // Create pending purchase record
    const purchaseData = {
      user_id: user.id,
      product_id: productId || null,
      bundle_id: bundleId || null,
      coach_id: coachId,
      amount_paid: itemPrice,
      currency: itemCurrency,
      stripe_checkout_session_id: session.id,
    };

    const { error: purchaseError } = await supabase
      .from("content_purchases")
      .insert(purchaseData);

    if (purchaseError) {
      logStep("Warning: Could not create purchase record", { error: purchaseError.message });
    }

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      clientSecret: session.client_secret,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[CONTENT-CHECKOUT] ERROR:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
