import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error("No authorization token provided");
    }
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    const user = userData.user;

    // Parse request body
    const { gymId, locationId, name, credits, priceAmount, currency, validityDays, description, isActive } = await req.json();
    
    if (!gymId || !name || credits === undefined || priceAmount === undefined) {
      throw new Error("Missing required fields: gymId, name, credits, priceAmount");
    }

    // Verify user is owner or manager of the gym
    const { data: gymData, error: gymError } = await supabaseClient
      .from("gym_profiles")
      .select("id, owner_id, stripe_account_id, stripe_onboarding_complete")
      .eq("id", gymId)
      .single();

    if (gymError || !gymData) {
      throw new Error("Gym not found");
    }

    const isOwner = gymData.owner_id === user.id;
    
    if (!isOwner) {
      // Check if staff member with proper permissions
      const { data: staffData } = await supabaseClient
        .from("gym_staff")
        .select("role")
        .eq("gym_id", gymId)
        .eq("user_id", user.id)
        .single();
      
      if (!staffData || !["manager", "area_manager"].includes(staffData.role)) {
        throw new Error("Unauthorized: Not a gym owner or manager");
      }
    }

    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;

    // Create Stripe product and price if gym has Stripe Connect
    if (gymData.stripe_account_id && gymData.stripe_onboarding_complete) {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // Create product in the gym's connected Stripe account
      const product = await stripe.products.create({
        name: `${name} - ${credits} Credit${credits > 1 ? "s" : ""}`,
        description: description || `${credits} class credit${credits > 1 ? "s" : ""} for gym access`,
        metadata: {
          gymId,
          locationId: locationId || "",
          credits: credits.toString(),
          type: "credit_package",
        },
      }, {
        stripeAccount: gymData.stripe_account_id,
      });

      stripeProductId = product.id;

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(priceAmount * 100), // Convert to cents
        currency: (currency || "GBP").toLowerCase(),
        metadata: {
          credits: credits.toString(),
        },
      }, {
        stripeAccount: gymData.stripe_account_id,
      });

      stripePriceId = price.id;
    }

    // Create credit package in database
    const { data: packageData, error: packageError } = await supabaseClient
      .from("gym_credit_packages")
      .insert({
        gym_id: gymId,
        location_id: locationId || null,
        name,
        credits,
        price_amount: Math.round(priceAmount * 100), // Store in cents
        currency: (currency || "GBP").toUpperCase(),
        validity_days: validityDays || null,
        description: description || null,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        is_active: isActive !== false,
      })
      .select()
      .single();

    if (packageError) {
      throw new Error(`Failed to create credit package: ${packageError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      package: packageData,
      stripeSync: !!stripeProductId,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in gym-create-credit-package:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
