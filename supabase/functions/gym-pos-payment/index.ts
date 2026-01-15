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

  try {
    const { gymId, items, memberId, paymentMethod } = await req.json();

    if (!gymId || !items || items.length === 0) {
      throw new Error("Missing required fields: gymId, items");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: { price: number; quantity: number }) => 
      sum + (item.price * item.quantity), 0
    );

    // If cash payment, just record the sale
    if (paymentMethod === "cash") {
      // Create sale record
      const { data: sale, error: saleError } = await supabaseClient
        .from("gym_pos_sales")
        .insert({
          gym_id: gymId,
          member_id: memberId || null,
          total_amount: totalAmount,
          payment_method: "cash",
          payment_status: "completed",
          items: items,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Decrement stock for each item
      for (const item of items) {
        if (item.productId) {
          await supabaseClient.rpc("decrement_product_stock", {
            p_product_id: item.productId,
            p_quantity: item.quantity
          });
        }
      }

      return new Response(JSON.stringify({ success: true, sale }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For card payments, create Stripe payment intent
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a pending sale record
    const { data: sale, error: saleError } = await supabaseClient
      .from("gym_pos_sales")
      .insert({
        gym_id: gymId,
        member_id: memberId || null,
        total_amount: totalAmount,
        payment_method: "card",
        payment_status: "pending",
        items: items,
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to pence
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: {
        gym_id: gymId,
        sale_id: sale.id,
        member_id: memberId || "",
      },
    });

    // Update sale with payment intent ID
    await supabaseClient
      .from("gym_pos_sales")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", sale.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        saleId: sale.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("POS payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
