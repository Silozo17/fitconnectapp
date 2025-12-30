import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  SAFETY_FLOORS,
  PROTEIN_REQUIREMENTS,
  type ActivityLevel,
  type Goal,
  type Gender,
} from "@/lib/nutrition-science-config";

// Helper to avoid deep type instantiation with Supabase queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "coach" | "calculated" | "fallback";
  warning?: string;
}

interface ClientProfileForNutrition {
  id: string;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: string | null;
  activity_level: string | null;
  fitness_goals: string[] | null;
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const baseCalc = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? baseCalc + 5 : baseCalc - 161;
}

/**
 * Map client fitness goals to our Goal type
 */
function mapGoalFromFitnessGoals(fitnessGoals: string[] | null): Goal {
  if (!fitnessGoals || fitnessGoals.length === 0) return "maintain";
  
  const goals = fitnessGoals.map(g => g.toLowerCase());
  
  if (goals.some(g => g.includes("muscle") || g.includes("bulk") || g.includes("gain") || g.includes("build"))) {
    return "build_muscle";
  }
  if (goals.some(g => g.includes("weight loss") || g.includes("fat loss") || g.includes("cut") || g.includes("lose"))) {
    return "lose_weight";
  }
  if (goals.some(g => g.includes("recomp"))) {
    return "body_recomp";
  }
  
  return "maintain";
}

/**
 * Map activity level string to ActivityLevel type
 */
function mapActivityLevel(level: string | null): ActivityLevel {
  if (!level) return "moderate";
  
  const normalized = level.toLowerCase().replace(/[_-]/g, "");
  
  if (normalized.includes("sedentary")) return "sedentary";
  if (normalized.includes("light")) return "light";
  if (normalized.includes("moderate")) return "moderate";
  if (normalized.includes("active") && normalized.includes("very")) return "very_active";
  if (normalized.includes("active")) return "active";
  
  return "moderate";
}

/**
 * Calculate nutrition targets based on client profile
 */
function calculateTargets(profile: ClientProfileForNutrition): NutritionTargets | null {
  const { weight_kg, height_cm, age, gender, activity_level, fitness_goals } = profile;
  
  // Need minimum data to calculate
  if (!weight_kg || !height_cm || !age || !gender) {
    return null;
  }
  
  const genderTyped: Gender = gender.toLowerCase() === "male" ? "male" : "female";
  const activityTyped = mapActivityLevel(activity_level);
  const goal = mapGoalFromFitnessGoals(fitness_goals);
  
  // Calculate BMR
  const bmr = calculateBMR(weight_kg, height_cm, age, genderTyped);
  
  // Apply activity multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[activityTyped] || ACTIVITY_MULTIPLIERS.moderate;
  const tdee = bmr * multiplier;
  
  // Apply goal adjustment
  const goalAdjustment = GOAL_ADJUSTMENTS[goal] || 0;
  let targetCalories = Math.round(tdee + goalAdjustment);
  
  // Enforce safety floor
  const minCalories = SAFETY_FLOORS.minCalories[genderTyped];
  if (targetCalories < minCalories) {
    targetCalories = minCalories;
  }
  
  // Calculate protein from PROTEIN_REQUIREMENTS
  const proteinReq = PROTEIN_REQUIREMENTS[goal];
  const proteinGrams = Math.round(weight_kg * proteinReq.default);
  
  // Calculate fat (25-30% of calories, 9 cal/g)
  const fatCalories = targetCalories * 0.28;
  const fatGrams = Math.round(Math.max(fatCalories / 9, SAFETY_FLOORS.minFatGrams));
  
  // Calculate carbs (remaining calories, 4 cal/g)
  const proteinCalories = proteinGrams * 4;
  const carbCalories = targetCalories - proteinCalories - (fatGrams * 9);
  const carbGrams = Math.round(Math.max(carbCalories / 4, SAFETY_FLOORS.minCarbsGrams));
  
  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams,
    source: "calculated",
  };
}

/**
 * Default fallback targets when no data is available
 */
const FALLBACK_TARGETS: NutritionTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  source: "fallback",
  warning: "Complete your profile to get personalized targets",
};

export const useNutritionTargets = (clientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["nutrition-targets", clientId || user?.id],
    queryFn: async (): Promise<NutritionTargets> => {
      // Determine which client to fetch for
      let targetClientId = clientId;
      
      if (!targetClientId && user) {
        const { data: profile } = await db
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        targetClientId = profile?.id;
      }
      
      if (!targetClientId) {
        return FALLBACK_TARGETS;
      }
      
      // 1. Check for coach-assigned nutrition plan (using db alias to avoid deep type instantiation)
      const planAssignmentsResult = await db
        .from("plan_assignments")
        .select("id, plan_id")
        .eq("client_id", targetClientId)
        .eq("is_active", true)
        .order("assigned_at", { ascending: false });
      
      const planAssignments = planAssignmentsResult.data as Array<{ id: string; plan_id: string }> | null;
      
      // Fetch nutrition plans separately if assignments exist
      if (planAssignments && planAssignments.length > 0) {
        const planIds = planAssignments.map(pa => pa.plan_id).filter(Boolean);
        if (planIds.length > 0) {
          const nutritionPlanResult = await db
            .from("training_plans")
            .select("id, plan_type, content")
            .in("id", planIds)
            .eq("plan_type", "nutrition")
            .limit(1)
            .maybeSingle();
          
          const nutritionPlan = nutritionPlanResult.data as { id: string; plan_type: string; content: Record<string, unknown> } | null;
          
          if (nutritionPlan?.content) {
            const content = nutritionPlan.content;
            if (content?.daily_calories || content?.calories) {
              return {
                calories: Number(content.daily_calories || content.calories || 2000),
                protein: Number(content.protein_g || content.protein || 150),
                carbs: Number(content.carbs_g || content.carbs || 200),
                fat: Number(content.fat_g || content.fat || 65),
                source: "coach" as const,
              };
            }
          }
        }
      }
      
      // 2. Calculate from client profile
      const { data: clientProfile } = await db
        .from("client_profiles")
        .select("id, weight_kg, height_cm, age, gender, activity_level, fitness_goals")
        .eq("id", targetClientId)
        .single() as { data: ClientProfileForNutrition | null };
      
      if (clientProfile) {
        const calculated = calculateTargets(clientProfile);
        if (calculated) {
          return calculated;
        }
      }
      
      // 3. Fallback
      return FALLBACK_TARGETS;
    },
    enabled: !!(clientId || user?.id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
