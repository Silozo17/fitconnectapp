import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mealPlanId, days = 7 } = await req.json();

    // Get client profile
    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!clientProfile) {
      return new Response(
        JSON.stringify({ error: "Client profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, create a sample grocery list
    // In a full implementation, this would parse meal plan data
    const sampleItems: GroceryItem[] = [
      { id: crypto.randomUUID(), name: "Chicken Breast", quantity: "500", unit: "g", category: "Proteins", checked: false },
      { id: crypto.randomUUID(), name: "Salmon Fillet", quantity: "400", unit: "g", category: "Proteins", checked: false },
      { id: crypto.randomUUID(), name: "Eggs", quantity: "12", unit: "pcs", category: "Proteins", checked: false },
      { id: crypto.randomUUID(), name: "Brown Rice", quantity: "1", unit: "kg", category: "Carbs", checked: false },
      { id: crypto.randomUUID(), name: "Sweet Potato", quantity: "1", unit: "kg", category: "Carbs", checked: false },
      { id: crypto.randomUUID(), name: "Oats", quantity: "500", unit: "g", category: "Carbs", checked: false },
      { id: crypto.randomUUID(), name: "Broccoli", quantity: "500", unit: "g", category: "Vegetables", checked: false },
      { id: crypto.randomUUID(), name: "Spinach", quantity: "200", unit: "g", category: "Vegetables", checked: false },
      { id: crypto.randomUUID(), name: "Avocado", quantity: "4", unit: "pcs", category: "Fats", checked: false },
      { id: crypto.randomUUID(), name: "Olive Oil", quantity: "500", unit: "ml", category: "Fats", checked: false },
      { id: crypto.randomUUID(), name: "Greek Yogurt", quantity: "500", unit: "g", category: "Dairy", checked: false },
      { id: crypto.randomUUID(), name: "Almond Milk", quantity: "1", unit: "L", category: "Dairy", checked: false },
      { id: crypto.randomUUID(), name: "Bananas", quantity: "6", unit: "pcs", category: "Fruits", checked: false },
      { id: crypto.randomUUID(), name: "Blueberries", quantity: "250", unit: "g", category: "Fruits", checked: false },
    ];

    // Create the grocery list
    const { data: groceryList, error: insertError } = await supabase
      .from("grocery_lists")
      .insert({
        client_id: clientProfile.id,
        name: `Weekly Shopping - ${new Date().toLocaleDateString()}`,
        items: sampleItems,
        source_type: mealPlanId ? "meal_plan" : "manual",
        source_id: mealPlanId || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generated grocery list:", groceryList.id);

    return new Response(
      JSON.stringify({ success: true, list: groceryList }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err as Error;
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
