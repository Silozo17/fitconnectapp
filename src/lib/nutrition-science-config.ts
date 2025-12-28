/**
 * Evidence-Based Nutrition Science Configuration
 * 
 * This is the SINGLE SOURCE OF TRUTH for all nutrition constants.
 * All AI tools and calculations MUST use these values.
 * 
 * Sources:
 * - BMR: Mifflin-St Jeor equation (most accurate for modern populations)
 * - Protein: ISSN Position Stand on Protein and Exercise (2017)
 * - Diet types: Dietary Guidelines for Americans, ketogenic research
 * 
 * IMPORTANT: Do NOT invent numbers. All values are evidence-based.
 */

// ============================================
// TYPES
// ============================================

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp';
export type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

// ============================================
// PROTEIN REQUIREMENTS (g/kg bodyweight)
// Based on ISSN Position Stand on Protein (2017)
// ============================================

export interface ProteinRequirement {
  min: number;  // g/kg - minimum for this goal
  max: number;  // g/kg - maximum for this goal  
  default: number; // g/kg - recommended default
}

export const PROTEIN_REQUIREMENTS: Record<Goal, ProteinRequirement> = {
  lose_weight: { min: 1.6, max: 2.2, default: 2.0 },   // High protein preserves muscle in deficit
  maintain: { min: 1.2, max: 1.6, default: 1.4 },      // General health maintenance
  build_muscle: { min: 1.6, max: 2.2, default: 2.0 },  // Hypertrophy requires elevated protein
  body_recomp: { min: 1.8, max: 2.4, default: 2.2 },   // Highest - deficit + muscle preservation
};

// ============================================
// ACTIVITY MULTIPLIERS (TDEE = BMR × multiplier)
// Standard Mifflin-St Jeor activity factors
// ============================================

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise, desk job
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job, or 2x/day training
};

// ============================================
// GOAL CALORIE ADJUSTMENTS
// Evidence-based deficit/surplus for sustainable progress
// ============================================

export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,    // ~500 cal deficit = ~0.5kg/week loss (safe, sustainable)
  maintain: 0,          // No adjustment
  build_muscle: 300,    // Moderate surplus for lean gains (minimizes fat gain)
  body_recomp: -100,    // Slight deficit with high protein
};

// ============================================
// DIET TYPE CONSTRAINTS
// Hard macro constraints per diet type
// ============================================

export interface DietConstraints {
  name: string;
  description: string;
  
  // Carb constraints (grams) - if set, this is a HARD limit
  carbsGrams?: { min: number; max: number };
  
  // Fat as percentage of remaining calories (after protein)
  fatPercent: { min: number; max: number };
  
  // Protein modifier (multiplier on base requirement)
  proteinMultiplier?: number;
  
  // Special flags
  proteinModerate?: boolean;    // Keto: avoid excess protein (gluconeogenesis)
  proteinCapped?: boolean;      // Vegan: cap due to food source density
  maxRealisticProtein?: number; // Vegan: g/kg ceiling for plant-based
}

export const DIET_CONSTRAINTS: Record<DietaryPreference, DietConstraints> = {
  balanced: {
    name: 'Balanced',
    description: 'Flexible macro distribution with no hard restrictions',
    fatPercent: { min: 0.25, max: 0.35 },
    // No carb restrictions - calculated from remainder
  },
  
  high_protein: {
    name: 'High Protein',
    description: 'Elevated protein for muscle retention and satiety',
    proteinMultiplier: 1.2, // 20% boost to protein requirement
    fatPercent: { min: 0.20, max: 0.30 },
    // Carbs fill the remainder
  },
  
  low_carb: {
    name: 'Low Carb',
    description: 'Moderate carb restriction (NOT ketogenic)',
    carbsGrams: { min: 70, max: 130 }, // HARD LIMIT - this is the defining feature
    fatPercent: { min: 0.35, max: 0.50 },
  },
  
  keto: {
    name: 'Ketogenic',
    description: 'Very low carb, high fat for ketosis',
    carbsGrams: { min: 20, max: 30 }, // True ketosis requires ≤30g
    fatPercent: { min: 0.65, max: 0.75 },
    proteinModerate: true, // Avoid excess protein (gluconeogenesis)
  },
  
  vegan: {
    name: 'Vegan',
    description: 'Plant-based macro distribution',
    fatPercent: { min: 0.25, max: 0.35 },
    proteinCapped: true,
    maxRealisticProtein: 1.8, // g/kg - practical ceiling for plant-based
  },
};

// ============================================
// SAFETY FLOORS (Minimum safe values)
// Based on medical guidelines
// ============================================

export const SAFETY_FLOORS = {
  // Minimum daily calories (varies by gender)
  minCalories: { male: 1500, female: 1200 },
  
  // Minimum protein for anyone (prevents muscle loss)
  minProteinGPerKg: 1.2,
  
  // Minimum fat for essential fatty acids
  minFatGrams: 40,
  
  // Minimum carbs for brain function (non-keto)
  minCarbsGrams: 50,
  
  // Keto minimum carbs
  ketoCarbsMax: 30,
};

// ============================================
// MEAL DISTRIBUTION (% of daily calories)
// Based on nutritional science recommendations
// ============================================

export interface MealDistributionConfig {
  name: string;
  percentage: number;
}

export const MEAL_DISTRIBUTIONS: Record<number, MealDistributionConfig[]> = {
  3: [
    { name: 'Breakfast', percentage: 0.25 },
    { name: 'Lunch', percentage: 0.40 },
    { name: 'Dinner', percentage: 0.35 },
  ],
  4: [
    { name: 'Breakfast', percentage: 0.25 },
    { name: 'Lunch', percentage: 0.35 },
    { name: 'Dinner', percentage: 0.30 },
    { name: 'Snack', percentage: 0.10 },
  ],
  5: [
    { name: 'Breakfast', percentage: 0.20 },
    { name: 'Morning Snack', percentage: 0.10 },
    { name: 'Lunch', percentage: 0.30 },
    { name: 'Afternoon Snack', percentage: 0.10 },
    { name: 'Dinner', percentage: 0.30 },
  ],
};

// ============================================
// FIBER RECOMMENDATION
// ============================================

export const FIBER_PER_1000_KCAL = 14; // grams per 1000 calories

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get protein requirement for a user based on goal and diet
 */
export function getProteinRequirement(
  weightKg: number,
  goal: Goal,
  diet: DietaryPreference
): { grams: number; gPerKg: number; warning?: string } {
  const baseReq = PROTEIN_REQUIREMENTS[goal];
  const dietConfig = DIET_CONSTRAINTS[diet];
  
  let gPerKg = baseReq.default;
  let warning: string | undefined;
  
  // Apply diet multiplier (high protein)
  if (dietConfig.proteinMultiplier) {
    gPerKg = Math.min(gPerKg * dietConfig.proteinMultiplier, baseReq.max * 1.1);
  }
  
  // Moderate for keto (avoid gluconeogenesis)
  if (dietConfig.proteinModerate) {
    gPerKg = Math.min(gPerKg, 1.8); // Cap at 1.8 g/kg for keto
  }
  
  // Cap for vegan (practical ceiling)
  if (dietConfig.proteinCapped && dietConfig.maxRealisticProtein) {
    if (gPerKg > dietConfig.maxRealisticProtein) {
      gPerKg = dietConfig.maxRealisticProtein;
      warning = `Protein capped at ${dietConfig.maxRealisticProtein} g/kg for plant-based diet`;
    }
  }
  
  // Never go below minimum
  gPerKg = Math.max(gPerKg, SAFETY_FLOORS.minProteinGPerKg);
  
  return {
    grams: Math.round(weightKg * gPerKg),
    gPerKg: Math.round(gPerKg * 10) / 10,
    warning,
  };
}

/**
 * Get carb constraint for a diet type
 */
export function getCarbConstraint(
  diet: DietaryPreference
): { min: number; max: number } | null {
  const config = DIET_CONSTRAINTS[diet];
  return config.carbsGrams || null;
}

/**
 * Check if diet + goal combination has conflicts
 */
export function checkDietGoalConflicts(
  diet: DietaryPreference,
  goal: Goal
): string[] {
  const warnings: string[] = [];
  
  // Keto + high protein goal conflict
  if (diet === 'keto' && (goal === 'build_muscle' || goal === 'body_recomp')) {
    warnings.push('Ketogenic diets may limit protein intake, which can affect muscle building. Consider low-carb instead if muscle gain is priority.');
  }
  
  // Vegan + build muscle (harder to hit protein)
  if (diet === 'vegan' && goal === 'build_muscle') {
    warnings.push('Meeting high protein targets on a vegan diet requires careful planning. Focus on protein-rich plant foods like legumes, tofu, tempeh, and seitan.');
  }
  
  return warnings;
}

/**
 * Get minimum safe calories for a person
 */
export function getMinimumSafeCalories(gender: Gender): number {
  return SAFETY_FLOORS.minCalories[gender];
}

/**
 * Generate diet-specific meal plan prompt for AI
 */
export function getDietPromptConstraints(diet: DietaryPreference): string {
  const config = DIET_CONSTRAINTS[diet];
  const lines: string[] = [];
  
  lines.push(`Diet Type: ${config.name}`);
  lines.push(`Description: ${config.description}`);
  
  if (config.carbsGrams) {
    lines.push(`CRITICAL: Total carbohydrates MUST be between ${config.carbsGrams.min}g and ${config.carbsGrams.max}g`);
    
    if (diet === 'keto') {
      lines.push('Focus on high-fat foods: avocado, olive oil, nuts, fatty fish, eggs, cheese');
      lines.push('Avoid: grains, bread, pasta, rice, potatoes, sugary foods, most fruits');
    } else if (diet === 'low_carb') {
      lines.push('Limit: grains, bread, pasta, rice. Focus on vegetables, proteins, healthy fats');
    }
  }
  
  if (diet === 'vegan') {
    lines.push('All foods MUST be plant-based. No meat, fish, dairy, or eggs.');
    lines.push('Good protein sources: legumes, tofu, tempeh, seitan, edamame, quinoa, lentils');
  }
  
  if (diet === 'high_protein') {
    lines.push('Emphasize protein-rich foods at every meal');
    lines.push('Good sources: lean meats, fish, eggs, Greek yogurt, cottage cheese, legumes');
  }
  
  return lines.join('\n');
}
