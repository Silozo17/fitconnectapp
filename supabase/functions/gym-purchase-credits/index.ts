import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Credit pack configurations
const CREDIT_PACKS = {
  single: {
    priceId: "price_1SpfLpEztIBHKDEeSuiqpIZH",
    credits: 1,
    name: "1 Class Credit",
  },
  bulk10: {
    priceId: "price_1SpfM2EztIBHKDEeThtky0Fz",
    credits: 10,
    name: "10 Class Credits",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error("No authorization token provided");
    }
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      throw new Error("User not authenticated");
    }
    const user = userData.user;

    // Parse request body
    const { gymId, packType, memberId } = await req.json();
    
    if (!gymId || !packType) {
      throw new Error("Missing required fields: gymId, packType");
    }

    const pack = CREDIT_PACKS[packType as keyof typeof CREDIT_PACKS];
    if (!pack) {
      throw new Error("Invalid pack type. Use 'single' or 'bulk10'");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const origin = req.headers.get("origin") || "https://fitconnectapp.lovable.app";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/gym-admin/${gymId}/credits?success=true&credits=${pack.credits}`,
      cancel_url: `${origin}/gym-admin/${gymId}/credits?cancelled=true`,
      metadata: {
        gymId,
        memberId: memberId || "",
        userId: user.id,
        credits: pack.credits.toString(),
        packType,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in gym-purchase-credits:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
