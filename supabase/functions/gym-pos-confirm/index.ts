import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { saleId } = await req.json();

    if (!saleId) {
      throw new Error("Missing saleId");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the sale
    const { data: sale, error: saleError } = await supabaseClient
      .from("gym_pos_sales")
      .select("*")
      .eq("id", saleId)
      .single();

    if (saleError) throw saleError;

    // Update sale status to completed
    await supabaseClient
      .from("gym_pos_sales")
      .update({ payment_status: "completed" })
      .eq("id", saleId);

    // Decrement stock for each item
    const items = sale.items as Array<{ productId?: string; quantity: number }>;
    for (const item of items) {
      if (item.productId) {
        await supabaseClient.rpc("decrement_product_stock", {
          p_product_id: item.productId,
          p_quantity: item.quantity
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("POS confirm error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
