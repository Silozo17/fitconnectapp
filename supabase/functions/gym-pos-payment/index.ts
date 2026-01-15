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
    const totalAmount = items.reduce((sum: number, item: { price: number; quantity: number; name: string; productId?: string }) => 
      sum + (item.price * item.quantity), 0
    );

    // Helper function to update stock
    const updateStock = async (productItems: Array<{ productId?: string; quantity: number }>) => {
      for (const item of productItems) {
        if (item.productId) {
          const { data: product } = await supabaseClient
            .from("gym_products")
            .select("stock_quantity")
            .eq("id", item.productId)
            .single();
          
          if (product) {
            await supabaseClient
              .from("gym_products")
              .update({ 
                stock_quantity: Math.max(0, (product.stock_quantity || 0) - item.quantity) 
              })
              .eq("id", item.productId);
          }
        }
      }
    };

    // Helper function to insert sale items
    const insertSaleItems = async (saleId: string, saleItems: Array<{ productId?: string; name: string; quantity: number; price: number }>) => {
      const itemsToInsert = saleItems.map((item) => ({
        sale_id: saleId,
        product_id: item.productId || null,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount_percent: 0,
        line_total: item.price * item.quantity,
      }));

      const { error } = await supabaseClient
        .from("gym_product_sale_items")
        .insert(itemsToInsert);
      
      if (error) throw error;
    };

    // If cash payment, just record the sale
    if (paymentMethod === "cash") {
      // Create sale record with correct schema
      const { data: sale, error: saleError } = await supabaseClient
        .from("gym_product_sales")
        .insert({
          gym_id: gymId,
          member_id: memberId || null,
          subtotal: totalAmount,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          payment_method: "cash",
          status: "completed",
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      await insertSaleItems(sale.id, items);

      // Update stock for each item
      await updateStock(items);

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
      .from("gym_product_sales")
      .insert({
        gym_id: gymId,
        member_id: memberId || null,
        subtotal: totalAmount,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: totalAmount,
        payment_method: "card",
        status: "pending",
      })
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert sale items immediately
    await insertSaleItems(sale.id, items);

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

    // Update sale with payment reference
    await supabaseClient
      .from("gym_product_sales")
      .update({ payment_reference: paymentIntent.id })
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
