/**
 * Client Profile Mapping Utilities
 * 
 * Maps client profile data to form fields for the Macro Calculator.
 * Provides validation, warnings, and context for downstream tools (Meal Planner, Shopping List).
 */

import type { DietaryPreference, Goal } from './nutrition-science-config';

// ============================================
// TYPES
// ============================================

export interface ClientProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  gender_pronouns: string | null;
  fitness_goals: string[] | null;
  dietary_restrictions: string[] | null;
  allergies: string[] | null;
  medical_conditions: string[] | null;
}

export interface NutritionContext {
  clientId: string;
  clientName: string;
  allergies: string[];
  dietaryRestrictions: string[];
  medicalConditions: string[];
  inferredDietType: DietaryPreference;
  inferredGoal: Goal | null;
  warnings: string[];
}

export interface ClientFormData {
  age: number;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  dietaryPreference: DietaryPreference;
  goal: Goal;
}

export interface ProfileValidation {
  isComplete: boolean;
  missingFields: string[];
  warnings: string[];
}

// ============================================
// GENDER MAPPING
// ============================================

/**
 * Maps gender pronouns to binary gender for BMR calculation.
 * Returns 'male' as default if unable to determine.
 */
export function mapGenderPronouns(pronouns: string | null): { 
  gender: 'male' | 'female'; 
  warning?: string;
} {
  if (!pronouns) {
    return { 
      gender: 'male', 
      warning: 'Gender not specified — using male for BMR calculation' 
    };
  }

  const normalized = pronouns.toLowerCase().trim();

  // Female indicators
  if (
    normalized.includes('she') ||
    normalized.includes('her') ||
    normalized === 'female' ||
    normalized === 'f' ||
    normalized === 'woman'
  ) {
    return { gender: 'female' };
  }

  // Male indicators
  if (
    normalized.includes('he') ||
    normalized.includes('him') ||
    normalized === 'male' ||
    normalized === 'm' ||
    normalized === 'man'
  ) {
    return { gender: 'male' };
  }

  // Non-binary or other — default to male for BMR with warning
  return { 
    gender: 'male', 
    warning: `Using male BMR formula for "${pronouns}" — adjust if needed` 
  };
}

// ============================================
// DIETARY PREFERENCE MAPPING
// ============================================

/**
 * Maps dietary restrictions array to a single DietaryPreference.
 * Priority: keto > vegan > low_carb > high_protein > balanced
 */
export function mapDietaryRestrictions(restrictions: string[] | null): {
  preference: DietaryPreference;
  matchedRestriction?: string;
} {
  if (!restrictions || restrictions.length === 0) {
    return { preference: 'balanced' };
  }

  const normalized = restrictions.map(r => r.toLowerCase().trim());

  // Priority order for diet types
  if (normalized.some(r => r.includes('keto') || r.includes('ketogenic'))) {
    return { preference: 'keto', matchedRestriction: 'keto' };
  }

  if (normalized.some(r => r === 'vegan' || r.includes('plant-based') || r.includes('plant based'))) {
    return { preference: 'vegan', matchedRestriction: 'vegan' };
  }

  if (normalized.some(r => r.includes('low carb') || r.includes('low-carb') || r.includes('lowcarb'))) {
    return { preference: 'low_carb', matchedRestriction: 'low carb' };
  }

  if (normalized.some(r => r.includes('high protein') || r.includes('high-protein'))) {
    return { preference: 'high_protein', matchedRestriction: 'high protein' };
  }

  // Default to balanced
  return { preference: 'balanced' };
}

// ============================================
// GOAL MAPPING
// ============================================

/**
 * Maps fitness goals array to a single Goal.
 * Priority: lose_weight > build_muscle > body_recomp > maintain
 */
export function mapFitnessGoals(goals: string[] | null): {
  goal: Goal;
  matchedGoal?: string;
} {
  if (!goals || goals.length === 0) {
    return { goal: 'maintain' };
  }

  const normalized = goals.map(g => g.toLowerCase().trim());

  // Weight loss indicators
  if (normalized.some(g => 
    g.includes('lose weight') || 
    g.includes('weight loss') || 
    g.includes('fat loss') ||
    g.includes('cutting') ||
    g.includes('lean out')
  )) {
    return { goal: 'lose_weight', matchedGoal: 'weight loss' };
  }

  // Muscle building indicators
  if (normalized.some(g => 
    g.includes('build muscle') || 
    g.includes('muscle gain') ||
    g.includes('bulking') ||
    g.includes('hypertrophy') ||
    g.includes('get bigger') ||
    g.includes('gain weight')
  )) {
    return { goal: 'build_muscle', matchedGoal: 'muscle gain' };
  }

  // Body recomposition indicators
  if (normalized.some(g => 
    g.includes('recomp') || 
    g.includes('body composition') ||
    g.includes('tone') ||
    g.includes('lean muscle')
  )) {
    return { goal: 'body_recomp', matchedGoal: 'body recomposition' };
  }

  // Default to maintain
  return { goal: 'maintain' };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validates client profile for macro calculation.
 * Returns list of missing required fields and warnings.
 */
export function validateClientProfile(profile: ClientProfileData): ProfileValidation {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Required fields for BMR calculation
  if (!profile.age || profile.age <= 0) {
    missingFields.push('age');
  } else if (profile.age < 16 || profile.age > 100) {
    warnings.push(`Age ${profile.age} is outside typical range (16-100)`);
  }

  if (!profile.weight_kg || profile.weight_kg <= 0) {
    missingFields.push('weight');
  } else if (profile.weight_kg < 30 || profile.weight_kg > 300) {
    warnings.push(`Weight ${profile.weight_kg}kg is outside typical range (30-300kg)`);
  }

  if (!profile.height_cm || profile.height_cm <= 0) {
    missingFields.push('height');
  } else if (profile.height_cm < 100 || profile.height_cm > 250) {
    warnings.push(`Height ${profile.height_cm}cm is outside typical range (100-250cm)`);
  }

  // Gender warning (not blocking)
  const genderResult = mapGenderPronouns(profile.gender_pronouns);
  if (genderResult.warning) {
    warnings.push(genderResult.warning);
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

// ============================================
// MAIN MAPPING FUNCTION
// ============================================

/**
 * Maps client profile to form data for the Macro Calculator.
 * Returns both the form data and a nutrition context for downstream tools.
 */
export function mapClientProfileToFormData(profile: ClientProfileData): {
  formData: ClientFormData;
  context: NutritionContext;
  validation: ProfileValidation;
} {
  const validation = validateClientProfile(profile);
  const warnings = [...validation.warnings];

  // Map gender
  const genderResult = mapGenderPronouns(profile.gender_pronouns);
  if (genderResult.warning) {
    warnings.push(genderResult.warning);
  }

  // Map dietary preference
  const dietResult = mapDietaryRestrictions(profile.dietary_restrictions);

  // Map goal
  const goalResult = mapFitnessGoals(profile.fitness_goals);

  // Build form data with defaults for missing values
  const formData: ClientFormData = {
    age: profile.age || 30,
    gender: genderResult.gender,
    weightKg: profile.weight_kg || 70,
    heightCm: profile.height_cm || 170,
    dietaryPreference: dietResult.preference,
    goal: goalResult.goal,
  };

  // Build client name
  const clientName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Client';

  // Build nutrition context for downstream tools
  const context: NutritionContext = {
    clientId: profile.id,
    clientName,
    allergies: profile.allergies || [],
    dietaryRestrictions: profile.dietary_restrictions || [],
    medicalConditions: profile.medical_conditions || [],
    inferredDietType: dietResult.preference,
    inferredGoal: goalResult.goal,
    warnings,
  };

  return { formData, context, validation };
}

// ============================================
// DISPLAY HELPERS
// ============================================

/**
 * Gets display name for a client.
 */
export function getClientDisplayName(profile: { 
  first_name: string | null; 
  last_name: string | null; 
  user_id?: string;
}): string {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  return name || 'Unnamed Client';
}

/**
 * Formats a list of constraints for display.
 */
export function formatConstraintsList(items: string[] | null): string {
  if (!items || items.length === 0) return 'None';
  return items.join(', ');
}

/**
 * Gets severity level for a medical condition (for display styling).
 */
export function getConditionSeverity(condition: string): 'low' | 'medium' | 'high' {
  const highSeverity = ['diabetes', 'heart disease', 'kidney disease', 'liver disease'];
  const mediumSeverity = ['hypertension', 'high blood pressure', 'thyroid', 'celiac'];

  const normalized = condition.toLowerCase();

  if (highSeverity.some(c => normalized.includes(c))) {
    return 'high';
  }
  if (mediumSeverity.some(c => normalized.includes(c))) {
    return 'medium';
  }
  return 'low';
}
