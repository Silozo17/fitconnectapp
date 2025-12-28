/**
 * Nutrition Validation Library
 * 
 * This library provides validation, distribution, and scaling utilities
 * for meal plans. It ensures AI-generated meal plans match target macros.
 * 
 * CRITICAL: All numeric calculations happen here, NOT in AI prompts.
 */

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealDistribution {
  name: string;
  percentage: number;
  targets: MacroTargets;
}

export interface FoodItem {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlan {
  meals: Array<{
    name: string;
    time: string;
    foods: FoodItem[];
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  isWithinTolerance: boolean;
  tolerancePercent: number;
  actualTotals: MacroTargets;
  targetTotals: MacroTargets;
  discrepancy: {
    calories: number;
    caloriePercent: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Standard meal distribution percentages
 * Based on nutritional science recommendations
 */
export const MEAL_DISTRIBUTION = {
  breakfast: 0.25,    // 25% of daily calories
  morningSnack: 0.10, // 10% of daily calories
  lunch: 0.30,        // 30% of daily calories
  afternoonSnack: 0.10, // 10% of daily calories
  dinner: 0.25,       // 25% of daily calories
};

/**
 * Calculate per-meal macro targets based on daily totals
 */
export function distributeCaloriesToMeals(
  dailyTargets: MacroTargets,
  mealCount: number = 4
): MealDistribution[] {
  const distributions: MealDistribution[] = [];
  
  // Default 4-meal distribution
  if (mealCount === 4) {
    const mealConfigs = [
      { name: 'Breakfast', percentage: 0.25 },
      { name: 'Lunch', percentage: 0.35 },
      { name: 'Dinner', percentage: 0.30 },
      { name: 'Snack', percentage: 0.10 },
    ];
    
    for (const config of mealConfigs) {
      distributions.push({
        name: config.name,
        percentage: config.percentage,
        targets: {
          calories: Math.round(dailyTargets.calories * config.percentage),
          protein: Math.round(dailyTargets.protein * config.percentage),
          carbs: Math.round(dailyTargets.carbs * config.percentage),
          fat: Math.round(dailyTargets.fat * config.percentage),
        },
      });
    }
  } else if (mealCount === 5) {
    const mealConfigs = [
      { name: 'Breakfast', percentage: 0.20 },
      { name: 'Morning Snack', percentage: 0.10 },
      { name: 'Lunch', percentage: 0.30 },
      { name: 'Afternoon Snack', percentage: 0.10 },
      { name: 'Dinner', percentage: 0.30 },
    ];
    
    for (const config of mealConfigs) {
      distributions.push({
        name: config.name,
        percentage: config.percentage,
        targets: {
          calories: Math.round(dailyTargets.calories * config.percentage),
          protein: Math.round(dailyTargets.protein * config.percentage),
          carbs: Math.round(dailyTargets.carbs * config.percentage),
          fat: Math.round(dailyTargets.fat * config.percentage),
        },
      });
    }
  } else {
    // Equal distribution for other meal counts
    const equalPercentage = 1 / mealCount;
    for (let i = 0; i < mealCount; i++) {
      distributions.push({
        name: `Meal ${i + 1}`,
        percentage: equalPercentage,
        targets: {
          calories: Math.round(dailyTargets.calories * equalPercentage),
          protein: Math.round(dailyTargets.protein * equalPercentage),
          carbs: Math.round(dailyTargets.carbs * equalPercentage),
          fat: Math.round(dailyTargets.fat * equalPercentage),
        },
      });
    }
  }
  
  return distributions;
}

/**
 * Recalculate calories from macros (ground truth)
 */
export function recalculateCalories(protein: number, carbs: number, fat: number): number {
  return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
}

/**
 * Calculate totals from a meal plan
 */
export function calculateMealPlanTotals(mealPlan: MealPlan): MacroTargets {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const meal of mealPlan.meals) {
    for (const food of meal.foods) {
      // Use recalculated calories for accuracy
      const actualCalories = recalculateCalories(food.protein, food.carbs, food.fat);
      totalCalories += actualCalories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
  };
}

/**
 * Validate meal plan against target macros
 * Uses strict tolerance for calorie accuracy
 */
export function validateMealPlanMacros(
  mealPlan: MealPlan,
  targets: MacroTargets,
  tolerancePercent: number = 10
): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Calculate actual totals
  const actualTotals = calculateMealPlanTotals(mealPlan);
  
  // Calculate discrepancies
  const calorieDiff = actualTotals.calories - targets.calories;
  const caloriePercent = Math.abs(calorieDiff / targets.calories) * 100;
  
  const discrepancy = {
    calories: calorieDiff,
    caloriePercent: Math.round(caloriePercent * 10) / 10,
    protein: actualTotals.protein - targets.protein,
    carbs: actualTotals.carbs - targets.carbs,
    fat: actualTotals.fat - targets.fat,
  };
  
  // Check tolerance
  const isWithinTolerance = caloriePercent <= tolerancePercent;
  
  // Generate warnings/errors
  if (caloriePercent > tolerancePercent) {
    const direction = calorieDiff > 0 ? 'above' : 'below';
    errors.push(`Total calories (${actualTotals.calories}) are ${Math.round(caloriePercent)}% ${direction} target (${targets.calories})`);
  } else if (caloriePercent > 5) {
    const direction = calorieDiff > 0 ? 'above' : 'below';
    warnings.push(`Total calories slightly ${direction} target by ${Math.round(caloriePercent)}%`);
  }
  
  // Check protein (critical for fitness apps)
  const proteinDiffPercent = Math.abs(discrepancy.protein / targets.protein) * 100;
  if (proteinDiffPercent > 15) {
    warnings.push(`Protein ${discrepancy.protein > 0 ? 'exceeds' : 'falls short of'} target by ${Math.round(proteinDiffPercent)}%`);
  }
  
  // Validate individual food macro consistency
  for (const meal of mealPlan.meals) {
    for (const food of meal.foods) {
      const expectedCalories = recalculateCalories(food.protein, food.carbs, food.fat);
      if (Math.abs(expectedCalories - food.calories) > 15) {
        warnings.push(`${food.name}: stated calories (${food.calories}) differ from macro calculation (${expectedCalories})`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    isWithinTolerance,
    tolerancePercent,
    actualTotals,
    targetTotals: targets,
    discrepancy,
    warnings,
    errors,
  };
}

/**
 * Scale meal portions to match target calories
 * This applies a uniform scaling factor to all portions
 */
export function scaleMealPortions(
  mealPlan: MealPlan,
  targetCalories: number
): MealPlan {
  const currentTotals = calculateMealPlanTotals(mealPlan);
  
  if (currentTotals.calories === 0) {
    return mealPlan; // Can't scale if no calories
  }
  
  const scaleFactor = targetCalories / currentTotals.calories;
  
  // Don't scale if factor is too extreme (would indicate bad data)
  if (scaleFactor < 0.5 || scaleFactor > 2.0) {
    console.warn(`Scale factor ${scaleFactor} too extreme, skipping scaling`);
    return mealPlan;
  }
  
  const scaledMeals = mealPlan.meals.map(meal => ({
    ...meal,
    foods: meal.foods.map(food => {
      const scaledProtein = Math.round(food.protein * scaleFactor * 10) / 10;
      const scaledCarbs = Math.round(food.carbs * scaleFactor * 10) / 10;
      const scaledFat = Math.round(food.fat * scaleFactor * 10) / 10;
      const scaledCalories = recalculateCalories(scaledProtein, scaledCarbs, scaledFat);
      
      return {
        ...food,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        calories: scaledCalories,
        // Update serving description to indicate scaling
        serving: scaleFactor !== 1 
          ? `${food.serving} (adjusted)` 
          : food.serving,
      };
    }),
  }));
  
  return { meals: scaledMeals };
}

/**
 * Fix food calories to match macro calculation
 */
export function fixFoodCalories(mealPlan: MealPlan): MealPlan {
  const fixedMeals = mealPlan.meals.map(meal => ({
    ...meal,
    foods: meal.foods.map(food => ({
      ...food,
      calories: recalculateCalories(food.protein, food.carbs, food.fat),
      protein: Math.round(food.protein * 10) / 10,
      carbs: Math.round(food.carbs * 10) / 10,
      fat: Math.round(food.fat * 10) / 10,
    })),
  }));
  
  return { meals: fixedMeals };
}

/**
 * Validate food substitution macros for realism
 */
export function validateSubstitutionMacros(
  macros: MacroTargets,
  servingSize: string
): { isRealistic: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check if calories match macro calculation
  const calculatedCalories = recalculateCalories(macros.protein, macros.carbs, macros.fat);
  if (Math.abs(calculatedCalories - macros.calories) > 15) {
    warnings.push('Calorie value adjusted to match macros');
  }
  
  // Check for unrealistic protein density (>50g protein per 100g is rare)
  // Estimate serving size in grams (rough)
  const servingMatch = servingSize.match(/(\d+)\s*g/i);
  if (servingMatch) {
    const servingGrams = parseInt(servingMatch[1]);
    const proteinPer100g = (macros.protein / servingGrams) * 100;
    if (proteinPer100g > 50) {
      warnings.push(`Unusually high protein density (${Math.round(proteinPer100g)}g/100g)`);
    }
  }
  
  // Check for impossible macro combinations
  const totalMacroGrams = macros.protein + macros.carbs + macros.fat;
  if (totalMacroGrams > macros.calories) {
    warnings.push('Macro grams exceed calorie limit - values may be inaccurate');
  }
  
  return {
    isRealistic: warnings.length === 0,
    warnings,
  };
}

/**
 * Compare generated meal plan to expected targets
 * Returns user-friendly message about accuracy
 */
export function getAccuracyMessage(validation: ValidationResult): {
  severity: 'success' | 'warning' | 'error';
  message: string;
} {
  if (validation.discrepancy.caloriePercent <= 5) {
    return {
      severity: 'success',
      message: `Meal plan matches your targets (${validation.actualTotals.calories} of ${validation.targetTotals.calories} kcal)`,
    };
  } else if (validation.isWithinTolerance) {
    const direction = validation.discrepancy.calories > 0 ? 'above' : 'below';
    return {
      severity: 'warning',
      message: `Meal plan is ${Math.round(validation.discrepancy.caloriePercent)}% ${direction} your calorie target. Consider adjusting portions.`,
    };
  } else {
    const direction = validation.discrepancy.calories > 0 ? 'above' : 'below';
    return {
      severity: 'error',
      message: `Meal plan is significantly ${direction} target (${validation.actualTotals.calories} vs ${validation.targetTotals.calories} kcal). Review and adjust meals.`,
    };
  }
}
