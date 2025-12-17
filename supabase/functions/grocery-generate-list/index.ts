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

interface MealFood {
  id: string;
  food: {
    id: string;
    name: string;
    category_id: string | null;
    serving_size_g: number | null;
    food_categories?: { name: string } | null;
  };
  servings: number;
  notes?: string;
}

interface Meal {
  id: string;
  name: string;
  foods: MealFood[];
}

interface NutritionDay {
  id: string;
  name: string;
  meals: Meal[];
}

interface PlanContent {
  days?: NutritionDay[];
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
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

    // Validate mealPlanId
    if (!mealPlanId) {
      return new Response(
        JSON.stringify({ error: "Please select a meal plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Verify the plan is assigned to this client
    const { data: assignment, error: assignmentError } = await supabase
      .from("plan_assignments")
      .select("id, plan_id")
      .eq("client_id", clientProfile.id)
      .eq("plan_id", mealPlanId)
      .in("status", ["active", "in_progress"])
      .single();

    if (assignmentError || !assignment) {
      console.error("Assignment error:", assignmentError);
      return new Response(
        JSON.stringify({ error: "This meal plan is not assigned to you" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the training plan content
    const { data: plan, error: planError } = await supabase
      .from("training_plans")
      .select("id, name, content, plan_type")
      .eq("id", mealPlanId)
      .single();

    if (planError || !plan) {
      console.error("Plan error:", planError);
      return new Response(
        JSON.stringify({ error: "Meal plan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (plan.plan_type !== "nutrition") {
      return new Response(
        JSON.stringify({ error: "This is not a nutrition plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and aggregate foods from the meal plan
    const content = plan.content as PlanContent;
    
    if (!content?.days || !Array.isArray(content.days) || content.days.length === 0) {
      return new Response(
        JSON.stringify({ error: "This meal plan has no meals defined" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate foods across all days and meals
    const foodMap = new Map<string, {
      name: string;
      totalServings: number;
      servingSize: number;
      categoryName: string;
    }>();

    // Process only up to 'days' number of days
    const daysToProcess = content.days.slice(0, days);

    for (const day of daysToProcess) {
      if (!day.meals) continue;
      
      for (const meal of day.meals) {
        if (!meal.foods) continue;
        
        for (const mealFood of meal.foods) {
          if (!mealFood.food) continue;
          
          const foodId = mealFood.food.id;
          const existing = foodMap.get(foodId);
          
          if (existing) {
            existing.totalServings += mealFood.servings || 1;
          } else {
            foodMap.set(foodId, {
              name: mealFood.food.name || "Unknown Food",
              totalServings: mealFood.servings || 1,
              servingSize: mealFood.food.serving_size_g || 100,
              categoryName: mealFood.food.food_categories?.name || "Other",
            });
          }
        }
      }
    }

    // Convert aggregated foods to grocery items
    const groceryItems: GroceryItem[] = [];
    
    for (const [foodId, data] of foodMap.entries()) {
      const totalGrams = data.totalServings * data.servingSize;
      
      // Format quantity nicely
      let quantity: string;
      let unit: string;
      
      if (totalGrams >= 1000) {
        quantity = (totalGrams / 1000).toFixed(1);
        unit = "kg";
      } else {
        quantity = Math.round(totalGrams).toString();
        unit = "g";
      }
      
      groceryItems.push({
        id: crypto.randomUUID(),
        name: data.name,
        quantity,
        unit,
        category: data.categoryName,
        checked: false,
      });
    }

    // Sort by category for easier shopping
    groceryItems.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });

    if (groceryItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No foods found in the meal plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the grocery list
    const { data: groceryList, error: insertError } = await supabase
      .from("grocery_lists")
      .insert({
        client_id: clientProfile.id,
        name: `${plan.name} - ${new Date().toLocaleDateString()}`,
        items: groceryItems,
        source_type: "meal_plan",
        source_id: mealPlanId,
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

    console.log(`Generated grocery list with ${groceryItems.length} items from plan: ${plan.name}`);

    return new Response(
      JSON.stringify({ success: true, list: groceryList, itemCount: groceryItems.length }),
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
