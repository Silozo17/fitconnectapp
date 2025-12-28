/**
 * Deterministic Fitness Calculation Library
 * 
 * IMPORTANT: This library contains all fitness-related calculations.
 * AI should NEVER perform these calculations - it should only receive
 * computed values and provide explanations/suggestions.
 * 
 * All formulas are industry-standard and verified.
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp';
export type DietaryPreference = 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

// Goal calorie adjustments
export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,    // 500 calorie deficit for ~1lb/week loss
  maintain: 0,
  build_muscle: 300,    // Moderate surplus for lean gains
  body_recomp: -100,    // Slight deficit with high protein
};

export interface MacroResult {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MacroPercentages {
  protein: number;
  carbs: number;
  fat: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroResult;
  percentages: MacroPercentages;
  caloriesFromMacros: number;
  isValid: boolean;
  warnings: string[];
}

/**
 * Calculate BMR using Mifflin-St Jeor equation (most accurate for modern populations)
 * 
 * Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  const adjustment = gender === 'male' ? 5 : -161;
  return Math.round(base + adjustment);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories based on goal
 */
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  const adjustment = GOAL_ADJUSTMENTS[goal];
  const target = tdee + adjustment;
  // Ensure minimum safe calories (women: 1200, men: 1500 - using 1200 as floor)
  return Math.max(1200, Math.round(target));
}

/**
 * Calculate macros based on target calories, goal, and dietary preference
 * Returns macros in grams
 */
export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  dietaryPreference: DietaryPreference
): MacroResult {
  let proteinRatio: number;
  let fatRatio: number;
  let carbRatio: number;

  // Determine macro ratios based on dietary preference
  switch (dietaryPreference) {
    case 'high_protein':
      proteinRatio = 0.35;
      fatRatio = 0.30;
      carbRatio = 0.35;
      break;
    case 'low_carb':
      proteinRatio = 0.30;
      fatRatio = 0.40;
      carbRatio = 0.30;
      break;
    case 'keto':
      proteinRatio = 0.25;
      fatRatio = 0.70;
      carbRatio = 0.05;
      break;
    case 'vegan':
    case 'balanced':
    default:
      proteinRatio = 0.25;
      fatRatio = 0.30;
      carbRatio = 0.45;
      break;
  }

  // Adjust protein for muscle building or body recomp goals
  if (goal === 'build_muscle' || goal === 'body_recomp') {
    // Aim for 1.6-2.2g per kg for muscle building
    const minProteinGrams = Math.round(weightKg * 1.8);
    const proteinFromRatio = Math.round((targetCalories * proteinRatio) / 4);
    
    if (proteinFromRatio < minProteinGrams) {
      const proteinCalories = minProteinGrams * 4;
      proteinRatio = proteinCalories / targetCalories;
      // Redistribute remaining calories
      const remaining = 1 - proteinRatio;
      const originalFatCarb = fatRatio + carbRatio;
      fatRatio = (fatRatio / originalFatCarb) * remaining;
      carbRatio = remaining - fatRatio;
    }
  }

  // Calculate grams from calories
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const proteinGrams = Math.round((targetCalories * proteinRatio) / 4);
  const carbsGrams = Math.round((targetCalories * carbRatio) / 4);
  const fatGrams = Math.round((targetCalories * fatRatio) / 9);
  
  // Fiber recommendation: 14g per 1000 calories
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
    fiber: fiberGrams,
  };
}

/**
 * Calculate actual calories from macro grams
 * Used for validation
 */
export function calculateCaloriesFromMacros(macros: MacroResult): number {
  return Math.round(
    (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9)
  );
}

/**
 * Validate that macro calories match target (within tolerance)
 */
export function validateMacroCalorieMatch(
  targetCalories: number,
  macros: MacroResult,
  tolerancePercent: number = 5
): { isValid: boolean; actualCalories: number; difference: number; differencePercent: number } {
  const actualCalories = calculateCaloriesFromMacros(macros);
  const difference = Math.abs(actualCalories - targetCalories);
  const differencePercent = (difference / targetCalories) * 100;
  
  return {
    isValid: differencePercent <= tolerancePercent,
    actualCalories,
    difference,
    differencePercent: Math.round(differencePercent * 10) / 10,
  };
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(macros: MacroResult): MacroPercentages {
  const totalCalories = calculateCaloriesFromMacros(macros);
  
  return {
    protein: Math.round(((macros.protein * 4) / totalCalories) * 100),
    carbs: Math.round(((macros.carbs * 4) / totalCalories) * 100),
    fat: Math.round(((macros.fat * 9) / totalCalories) * 100),
  };
}

/**
 * Complete calculation with all validations
 * This is the main function that should be used
 */
export function calculateAll(
  age: number,
  gender: Gender,
  weightKg: number,
  heightCm: number,
  activityLevel: ActivityLevel,
  goal: Goal,
  dietaryPreference: DietaryPreference
): CalculationResult {
  const warnings: string[] = [];

  // Input validation
  if (age < 15 || age > 100) {
    warnings.push('Age outside typical range (15-100). Results may be less accurate.');
  }
  if (weightKg < 30 || weightKg > 300) {
    warnings.push('Weight outside typical range. Results may be less accurate.');
  }
  if (heightCm < 120 || heightCm > 250) {
    warnings.push('Height outside typical range. Results may be less accurate.');
  }

  // Calculate all values
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateTargetCalories(tdee, goal);
  const macros = calculateMacros(targetCalories, weightKg, goal, dietaryPreference);
  const percentages = calculateMacroPercentages(macros);
  const caloriesFromMacros = calculateCaloriesFromMacros(macros);
  
  // Validate
  const validation = validateMacroCalorieMatch(targetCalories, macros);
  if (!validation.isValid) {
    warnings.push(`Macro calories (${caloriesFromMacros}) differ from target (${targetCalories}) by ${validation.differencePercent}%`);
  }

  return {
    bmr,
    tdee,
    targetCalories,
    macros,
    percentages,
    caloriesFromMacros,
    isValid: validation.isValid,
    warnings,
  };
}

/**
 * Calculate meal macros from total day macros
 */
export function calculatePerMealMacros(
  macros: MacroResult,
  numberOfMeals: number = 4
): MacroResult {
  return {
    protein: Math.round(macros.protein / numberOfMeals),
    carbs: Math.round(macros.carbs / numberOfMeals),
    fat: Math.round(macros.fat / numberOfMeals),
    fiber: Math.round(macros.fiber / numberOfMeals),
  };
}

/**
 * Validate AI-generated meal data
 * Returns corrected values if possible, or flags issues
 */
export function validateMealMacros(
  foods: Array<{ calories: number; protein: number; carbs: number; fat: number }>,
  expectedTotals: { calories: number; protein: number; carbs: number; fat: number },
  tolerancePercent: number = 15
): {
  isValid: boolean;
  actualTotals: { calories: number; protein: number; carbs: number; fat: number };
  differences: { calories: number; protein: number; carbs: number; fat: number };
  warnings: string[];
} {
  const actualTotals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein || 0),
      carbs: acc.carbs + (food.carbs || 0),
      fat: acc.fat + (food.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const warnings: string[] = [];
  const differences = {
    calories: Math.abs(actualTotals.calories - expectedTotals.calories),
    protein: Math.abs(actualTotals.protein - expectedTotals.protein),
    carbs: Math.abs(actualTotals.carbs - expectedTotals.carbs),
    fat: Math.abs(actualTotals.fat - expectedTotals.fat),
  };

  const calorieDiffPercent = (differences.calories / expectedTotals.calories) * 100;
  
  if (calorieDiffPercent > tolerancePercent) {
    warnings.push(`Meal calories (${actualTotals.calories}) differ from target (${expectedTotals.calories}) by ${Math.round(calorieDiffPercent)}%`);
  }

  // Validate that calories from macros match stated calories for each food
  for (const food of foods) {
    const calculatedCals = (food.protein * 4) + (food.carbs * 4) + (food.fat * 9);
    const diff = Math.abs(calculatedCals - food.calories);
    if (diff > 20) { // Allow 20 cal variance for rounding
      warnings.push(`Food macro calories (${Math.round(calculatedCals)}) don't match stated calories (${food.calories})`);
    }
  }

  return {
    isValid: calorieDiffPercent <= tolerancePercent && warnings.length === 0,
    actualTotals,
    differences,
    warnings,
  };
}

/**
 * Recalculate food calories from macros (for fixing AI inconsistencies)
 */
export function recalculateFoodCalories(food: { protein: number; carbs: number; fat: number }): number {
  return Math.round((food.protein * 4) + (food.carbs * 4) + (food.fat * 9));
}
