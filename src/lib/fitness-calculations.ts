/**
 * Deterministic Fitness Calculation Library
 * 
 * IMPORTANT: This library contains all fitness-related calculations.
 * AI should NEVER perform these calculations - it should only receive
 * computed values and provide explanations/suggestions.
 * 
 * All formulas are industry-standard and verified.
 * 
 * CALCULATION ORDER (Protein-First Approach):
 * 1. Calculate BMR (Mifflin-St Jeor)
 * 2. Calculate TDEE (BMR × activity multiplier)
 * 3. Calculate target calories (TDEE ± goal adjustment)
 * 4. Calculate PROTEIN FIRST (bodyweight × requirement) - NON-NEGOTIABLE
 * 5. Apply diet constraints for CARBS (hard limits for keto/low-carb)
 * 6. Calculate FAT from remaining calories
 * 7. Validate and adjust if needed
 */

import {
  Gender,
  ActivityLevel,
  Goal,
  DietaryPreference,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  DIET_CONSTRAINTS,
  SAFETY_FLOORS,
  FIBER_PER_1000_KCAL,
  getProteinRequirement,
  getCarbConstraint,
  checkDietGoalConflicts,
  getMinimumSafeCalories,
} from './nutrition-science-config';

// Re-export types for convenience
export type { Gender, ActivityLevel, Goal, DietaryPreference };
export { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS };

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
  dietType: DietaryPreference;
  proteinPerKg: number;
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
export function calculateTargetCalories(tdee: number, goal: Goal, gender: Gender): number {
  const adjustment = GOAL_ADJUSTMENTS[goal];
  const target = tdee + adjustment;
  const minCalories = getMinimumSafeCalories(gender);
  return Math.max(minCalories, Math.round(target));
}

/**
 * Calculate physiological macros using PROTEIN-FIRST approach
 * 
 * This is the CORRECT way to calculate macros:
 * 1. Protein is a REQUIREMENT based on bodyweight, not a percentage
 * 2. Carbs are constrained by diet type (hard limits for keto/low-carb)
 * 3. Fat fills the remaining calories
 */
export function calculatePhysiologicalMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  dietaryPreference: DietaryPreference,
  gender: Gender
): { macros: MacroResult; warnings: string[]; proteinPerKg: number } {
  const warnings: string[] = [];
  
  // Check for diet/goal conflicts
  const conflicts = checkDietGoalConflicts(dietaryPreference, goal);
  warnings.push(...conflicts);
  
  // STEP 1: Calculate PROTEIN FIRST (non-negotiable requirement)
  const proteinReq = getProteinRequirement(weightKg, goal, dietaryPreference);
  let proteinGrams = proteinReq.grams;
  
  if (proteinReq.warning) {
    warnings.push(proteinReq.warning);
  }
  
  // STEP 2: Calculate CARBS based on diet type
  let carbsGrams: number;
  const carbConstraint = getCarbConstraint(dietaryPreference);
  
  if (carbConstraint) {
    // Hard carb limit (keto or low-carb) - use the max of the range
    carbsGrams = carbConstraint.max;
  } else {
    // For balanced/high-protein/vegan: calculate from remainder after ensuring min fat
    // We'll calculate this after determining fat
    carbsGrams = 0; // Will be recalculated
  }
  
  // STEP 3: Calculate FAT from remaining calories
  const dietConfig = DIET_CONSTRAINTS[dietaryPreference];
  const proteinCalories = proteinGrams * 4;
  const carbCalories = carbsGrams * 4;
  
  let fatGrams: number;
  
  if (carbConstraint) {
    // Diet with fixed carbs: fat gets the remainder
    const remainingCalories = targetCalories - proteinCalories - carbCalories;
    fatGrams = Math.round(remainingCalories / 9);
  } else {
    // Balanced/high-protein/vegan: calculate fat %, then carbs from remainder
    const avgFatPercent = (dietConfig.fatPercent.min + dietConfig.fatPercent.max) / 2;
    const remainingAfterProtein = targetCalories - proteinCalories;
    
    // Fat gets its percentage of remaining calories
    const fatCalories = remainingAfterProtein * avgFatPercent;
    fatGrams = Math.round(fatCalories / 9);
    
    // Carbs get what's left
    const carbCaloriesRemaining = targetCalories - proteinCalories - (fatGrams * 9);
    carbsGrams = Math.round(carbCaloriesRemaining / 4);
  }
  
  // STEP 4: Apply safety floors and validate
  
  // Ensure minimum fat
  if (fatGrams < SAFETY_FLOORS.minFatGrams) {
    const neededFatCalories = SAFETY_FLOORS.minFatGrams * 9;
    const currentFatCalories = fatGrams * 9;
    const caloriesNeeded = neededFatCalories - currentFatCalories;
    
    // Take from carbs if possible
    if (!carbConstraint && carbsGrams * 4 > caloriesNeeded + (SAFETY_FLOORS.minCarbsGrams * 4)) {
      carbsGrams -= Math.ceil(caloriesNeeded / 4);
      fatGrams = SAFETY_FLOORS.minFatGrams;
      warnings.push('Fat increased to minimum safe level');
    } else {
      fatGrams = SAFETY_FLOORS.minFatGrams;
      warnings.push('Fat set to minimum; calories may not match exactly');
    }
  }
  
  // Ensure minimum carbs for non-keto diets
  if (dietaryPreference !== 'keto' && carbsGrams < SAFETY_FLOORS.minCarbsGrams) {
    carbsGrams = SAFETY_FLOORS.minCarbsGrams;
    warnings.push('Carbs set to minimum safe level for brain function');
  }
  
  // Ensure protein doesn't get squeezed (this is NON-NEGOTIABLE)
  const totalMacroCalories = (proteinGrams * 4) + (carbsGrams * 4) + (fatGrams * 9);
  if (totalMacroCalories > targetCalories * 1.1) {
    // Over budget by >10% - reduce fat first (never reduce protein)
    const excessCalories = totalMacroCalories - targetCalories;
    const fatReduction = Math.min(Math.floor(excessCalories / 9), fatGrams - SAFETY_FLOORS.minFatGrams);
    
    if (fatReduction > 0) {
      fatGrams -= fatReduction;
    }
  }
  
  // Fiber recommendation
  const fiberGrams = Math.round((targetCalories / 1000) * FIBER_PER_1000_KCAL);
  
  return {
    macros: {
      protein: proteinGrams,
      carbs: carbsGrams,
      fat: fatGrams,
      fiber: fiberGrams,
    },
    warnings,
    proteinPerKg: proteinReq.gPerKg,
  };
}

/**
 * Legacy function for backwards compatibility
 * Now uses the protein-first approach internally
 */
export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal,
  dietaryPreference: DietaryPreference
): MacroResult {
  const result = calculatePhysiologicalMacros(
    targetCalories,
    weightKg,
    goal,
    dietaryPreference,
    'male' // Default gender for legacy function
  );
  return result.macros;
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
  
  if (totalCalories === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
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

  // Calculate all values using protein-first approach
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateTargetCalories(tdee, goal, gender);
  
  const macroResult = calculatePhysiologicalMacros(
    targetCalories,
    weightKg,
    goal,
    dietaryPreference,
    gender
  );
  
  const macros = macroResult.macros;
  warnings.push(...macroResult.warnings);
  
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
    dietType: dietaryPreference,
    proteinPerKg: macroResult.proteinPerKg,
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

/**
 * Validate diet constraints for a meal plan
 */
export function validateDietConstraints(
  totals: { carbs: number; protein: number; fat: number },
  diet: DietaryPreference,
  weightKg: number
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const dietConfig = DIET_CONSTRAINTS[diet];
  
  // Check carb constraints
  if (dietConfig.carbsGrams) {
    if (totals.carbs > dietConfig.carbsGrams.max + 10) {
      errors.push(`Carbs (${totals.carbs}g) exceed ${diet} limit of ${dietConfig.carbsGrams.max}g`);
    } else if (totals.carbs > dietConfig.carbsGrams.max) {
      warnings.push(`Carbs (${totals.carbs}g) slightly above ${diet} target of ${dietConfig.carbsGrams.max}g`);
    }
    
    if (totals.carbs < dietConfig.carbsGrams.min - 10) {
      warnings.push(`Carbs (${totals.carbs}g) below minimum of ${dietConfig.carbsGrams.min}g`);
    }
  }
  
  // Check protein requirements
  const minProtein = weightKg * SAFETY_FLOORS.minProteinGPerKg;
  if (totals.protein < minProtein) {
    errors.push(`Protein (${totals.protein}g) below minimum requirement of ${Math.round(minProtein)}g`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
