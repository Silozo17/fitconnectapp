import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
  fatsecret_id?: string;
  pack_size?: number;
  packs_needed?: number;
  notes?: string;
}

interface MealFood {
  food: {
    id?: string;
    name: string;
    fatsecret_id?: string;
    serving_size_g?: number;
    serving_description?: string;
  };
  portionGrams?: number;
  servings?: number;
}

interface Meal {
  id?: string;
  name: string;
  foods?: MealFood[];
}

interface NutritionDay {
  id?: string;
  name?: string;
  day?: string;
  meals?: Meal[];
}

interface PlanContent {
  days?: NutritionDay[];
  meals?: Meal[];
  targets?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Common UK supermarket pack sizes by category (in grams unless noted)
const PACK_SIZES: Record<string, number[]> = {
  rice: [250, 500, 1000, 2000],
  pasta: [250, 500, 1000],
  oats: [500, 1000, 1500],
  bread: [400, 800],
  flour: [500, 1000, 1500],
  quinoa: [300, 500, 1000],
  couscous: [250, 500],
  noodles: [250, 500],
  chicken: [300, 500, 1000, 2000],
  beef: [300, 500, 1000],
  mince: [250, 500, 750, 1000],
  fish: [200, 400, 500],
  salmon: [200, 300, 500],
  tuna: [145, 185, 400],
  turkey: [300, 500, 1000],
  pork: [300, 500, 1000],
  eggs: [6, 10, 12, 15, 30],
  tofu: [280, 400, 450],
  milk: [500, 1000, 2000, 4000],
  cheese: [150, 200, 300, 400, 500],
  yogurt: [125, 150, 450, 500, 1000],
  butter: [200, 250, 500],
  cream: [150, 250, 300, 600],
  broccoli: [300, 500],
  spinach: [100, 200, 400],
  carrots: [500, 750, 1000],
  potatoes: [500, 1000, 2000, 2500],
  sweet_potato: [500, 1000],
  tomatoes: [250, 400, 500],
  onions: [500, 750, 1000],
  peppers: [3, 6],
  mushrooms: [150, 250, 400],
  banana: [5, 6, 8],
  apple: [4, 6, 8],
  berries: [125, 150, 200, 300, 400],
  orange: [4, 6, 8],
  avocado: [2, 3, 4],
  almonds: [100, 200, 400, 500],
  peanut_butter: [225, 340, 454, 1000],
  nuts: [100, 150, 200, 400],
  seeds: [100, 200, 300],
  olive_oil: [250, 500, 750, 1000],
  oil: [250, 500, 1000],
  honey: [227, 340, 454],
  default: [100, 200, 250, 500, 1000],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'egg', 'tofu', 'mince', 'steak', 'breast', 'thigh', 'fillet'],
  dairy: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'cream', 'cottage', 'cheddar', 'mozzarella'],
  grains: ['rice', 'pasta', 'bread', 'oat', 'flour', 'quinoa', 'couscous', 'noodle', 'wrap', 'tortilla', 'cereal'],
  vegetables: ['broccoli', 'spinach', 'carrot', 'potato', 'tomato', 'onion', 'pepper', 'mushroom', 'lettuce', 'cucumber', 'celery', 'kale', 'cabbage', 'cauliflower', 'asparagus'],
  fruits: ['banana', 'apple', 'orange', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry', 'grape', 'mango', 'avocado', 'lemon'],
  nuts: ['almond', 'peanut', 'walnut', 'cashew', 'nut', 'seed', 'chia', 'flax'],
  oils: ['oil', 'olive'],
  condiments: ['honey', 'syrup', 'sauce', 'mayo', 'mustard', 'ketchup'],
};

// Items sold by count rather than weight
const COUNT_ITEMS = ['egg', 'banana', 'apple', 'orange', 'avocado', 'pepper'];
const AVG_WEIGHTS: Record<string, number> = { egg: 60, banana: 120, apple: 180, orange: 180, avocado: 170, pepper: 150 };

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'other';
}

function getPackSizes(name: string): number[] {
  const lower = name.toLowerCase();
  for (const [key, sizes] of Object.entries(PACK_SIZES)) {
    if (key !== 'default' && lower.includes(key)) return sizes;
  }
  return PACK_SIZES.default;
}

function isSoldByCount(name: string): boolean {
  const lower = name.toLowerCase();
  return COUNT_ITEMS.some(item => lower.includes(item));
}

function roundToPackSize(neededAmount: number, foodName: string): { packSize: number; packsNeeded: number; totalBuy: number } {
  const packSizes = getPackSizes(foodName);
  const isCount = isSoldByCount(foodName);
  
  let adjustedAmount = neededAmount;
  if (isCount && neededAmount > 50) {
    const lower = foodName.toLowerCase();
    for (const [item, weight] of Object.entries(AVG_WEIGHTS)) {
      if (lower.includes(item)) {
        adjustedAmount = Math.ceil(neededAmount / weight);
        break;
      }
    }
  }
  
  const sorted = [...packSizes].sort((a, b) => a - b);
  const largest = sorted[sorted.length - 1];
  
  if (adjustedAmount <= largest) {
    for (const size of sorted) {
      if (size >= adjustedAmount) {
        return { packSize: size, packsNeeded: 1, totalBuy: size };
      }
    }
  }
  
  const packsNeeded = Math.ceil(adjustedAmount / largest);
  return { packSize: largest, packsNeeded, totalBuy: packsNeeded * largest };
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function analyzeRepeatPattern(days: NutritionDay[]): number {
  if (!days || days.length === 0) return 7;
  if (days.length === 1) return 7;
  if (days.length >= 7) return 1;
  
  // Check if days are unique
  const signatures = days.map(d => d.meals?.map(m => m.name?.toLowerCase() || '').sort().join(',') || '');
  const unique = new Set(signatures);
  
  if (unique.size === 1) return 7;
  return Math.ceil(7 / days.length);
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

    const { mealPlanId } = await req.json();

    if (!mealPlanId) {
      return new Response(
        JSON.stringify({ error: "Please select a meal plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Verify assignment
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

    // Fetch plan
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

    const content = plan.content as PlanContent;
    const days = content?.days || [];
    
    if (days.length === 0 && !content?.meals) {
      return new Response(
        JSON.stringify({ error: "This meal plan has no meals defined" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate foods
    const foodMap = new Map<string, { name: string; totalGrams: number; fatsecret_id?: string; category: string }>();
    const multiplier = analyzeRepeatPattern(days);
    
    console.log(`Processing plan: ${plan.name}, days: ${days.length}, multiplier: ${multiplier}`);

    const processFoods = (meals: Meal[]) => {
      for (const meal of meals) {
        if (!meal.foods) continue;
        for (const mealFood of meal.foods) {
          const food = mealFood.food;
          if (!food?.name) continue;
          
          const key = normalizeName(food.name);
          const grams = mealFood.portionGrams || (food.serving_size_g || 100) * (mealFood.servings || 1);
          
          const existing = foodMap.get(key);
          if (existing) {
            existing.totalGrams += grams;
          } else {
            foodMap.set(key, {
              name: food.name,
              totalGrams: grams,
              fatsecret_id: food.fatsecret_id,
              category: detectCategory(food.name),
            });
          }
        }
      }
    };

    if (days.length > 0) {
      for (const day of days) {
        if (day.meals) processFoods(day.meals);
      }
    } else if (content?.meals) {
      processFoods(content.meals);
    }

    // Apply multiplier for weekly quantities
    for (const item of foodMap.values()) {
      item.totalGrams *= multiplier;
    }

    // Convert to grocery items with smart pack sizing
    const groceryItems: GroceryItem[] = [];
    
    for (const [_, item] of foodMap) {
      const { packSize, packsNeeded, totalBuy } = roundToPackSize(item.totalGrams, item.name);
      const isCount = isSoldByCount(item.name);
      
      const unit = isCount ? 'items' : 'g';
      const displayQty = isCount ? packsNeeded * packSize : totalBuy;
      
      let notes = '';
      if (totalBuy > item.totalGrams) {
        const neededStr = isCount ? `${Math.ceil(item.totalGrams)} needed` : `${Math.round(item.totalGrams)}g needed`;
        const buyStr = isCount ? `${packsNeeded} × ${packSize} pack` : `${packsNeeded} × ${packSize}g`;
        notes = `${neededStr} → Buy: ${buyStr}`;
      }
      
      groceryItems.push({
        id: crypto.randomUUID(),
        name: item.name,
        quantity: displayQty,
        unit,
        category: item.category,
        checked: false,
        fatsecret_id: item.fatsecret_id,
        pack_size: packSize,
        packs_needed: packsNeeded,
        notes,
      });
    }

    // Sort by category then name
    const catOrder = ['protein', 'dairy', 'grains', 'vegetables', 'fruits', 'nuts', 'oils', 'condiments', 'other'];
    groceryItems.sort((a, b) => {
      const ca = catOrder.indexOf(a.category);
      const cb = catOrder.indexOf(b.category);
      if (ca !== cb) return ca - cb;
      return a.name.localeCompare(b.name);
    });

    if (groceryItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No foods found in the meal plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const { data: groceryList, error: insertError } = await supabase
      .from("grocery_lists")
      .insert({
        client_id: clientProfile.id,
        name: `${plan.name} - Week of ${new Date().toLocaleDateString()}`,
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
      JSON.stringify({ 
        success: true, 
        list: groceryList, 
        itemCount: groceryItems.length,
        weeklyMultiplier: multiplier,
      }),
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
