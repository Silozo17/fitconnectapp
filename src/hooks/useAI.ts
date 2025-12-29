import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { 
  validateMacroCalorieMatch, 
  calculateCaloriesFromMacros 
} from '@/lib/fitness-calculations';

// Types for AI responses
export interface WorkoutPlan {
  planName: string;
  description: string;
  days: WorkoutDay[];
  tips?: string[];
}

export interface WorkoutDay {
  dayNumber: number;
  name: string;
  focus?: string;
  exercises: WorkoutExercise[];
  warmup?: string;
  cooldown?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface ExerciseAlternative {
  name: string;
  equipment?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  musclesWorked: string[];
  whyGoodAlternative: string;
  formTips?: string;
  setsRepsRecommendation?: string;
}

export interface FoodSubstitution {
  name: string;
  servingSize: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  whyGoodSubstitute: string;
  prepTips?: string;
  whereToBuy?: string;
  // Verification fields
  external_id?: string | null;
  source?: 'openfoodfacts' | 'fatsecret' | 'manual' | 'ai_generated';
}

export interface MacroCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  percentages?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  explanation: string;
  tips?: string[];
  mealSuggestion?: {
    meals: number;
    proteinPerMeal: number;
    carbsPerMeal: number;
    fatPerMeal: number;
  };
  // Nutrition context for downstream tools (Meal Planner, Shopping List)
  nutritionContext?: {
    clientId?: string;
    clientName?: string;
    allergies?: string[];
    dietaryRestrictions?: string[];
    medicalConditions?: string[];
    inferredDietType?: string;
  };
  // Validation metadata
  _validation?: {
    isServerCalculated: boolean;
    caloriesFromMacros: number;
    isValid: boolean;
  };
}

export interface ProgressAnalysis {
  overallAssessment: {
    status: 'excellent' | 'good' | 'on_track' | 'needs_attention' | 'stalled';
    summary: string;
    score?: number;
  };
  trends: Array<{
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    rate?: string;
    insight: string;
  }>;
  achievements?: string[];
  areasForImprovement?: Array<{
    area: string;
    currentState?: string;
    recommendation: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    category: string;
    suggestion: string;
    impact?: string;
  }>;
  prediction?: {
    twoWeeks?: string;
    oneMonth?: string;
    threeMonths?: string;
  };
  motivationalMessage: string;
}

// Hook for AI Workout Generator
export const useAIWorkoutGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = async (params: {
    goal: string;
    experienceLevel: string;
    daysPerWeek: number;
    equipment: string;
    focusAreas?: string[];
    injuries?: string[];
    sessionDuration: number;
  }): Promise<WorkoutPlan | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-workout-generator', {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      return data?.plan || null;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to generate workout');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateWorkout, isLoading, error };
};

// Hook for AI Exercise Alternatives
export const useAIExerciseAlternatives = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findAlternatives = async (params: {
    exerciseName: string;
    reason: 'injury' | 'equipment' | 'preference' | 'difficulty';
    availableEquipment?: string;
    targetMuscles?: string;
    constraints?: string;
  }): Promise<{ originalExercise: string; alternatives: ExerciseAlternative[] } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-exercise-alternatives', {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      return data || null;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to find alternatives');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { findAlternatives, isLoading, error };
};

// Hook for AI Food Substitutions
// PHASE 6: Updated to require FatSecret-verified data
export const useAIFoodSubstitutions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findSubstitutions = async (params: {
    foodName: string;
    reason: 'allergy' | 'dietary' | 'preference' | 'availability';
    currentMacros?: { calories: number; protein: number; carbs: number; fat: number };
    dietaryRestrictions?: string[];
    allergies?: string[];
  }): Promise<{ originalFood: string; substitutions: FoodSubstitution[]; hasUnverifiedResults?: boolean } | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-food-substitutions', {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (!data?.substitutions) {
        return data || null;
      }

      // PHASE 6: Filter to only FatSecret-verified substitutions
      const verifiedSubstitutions: FoodSubstitution[] = [];
      let hasUnverifiedResults = false;

      for (const sub of data.substitutions as FoodSubstitution[]) {
        // Check for verified source (Open Food Facts or FatSecret)
        if (sub.external_id && (sub.source === 'openfoodfacts' || sub.source === 'fatsecret')) {
          // Verified substitution - keep as-is (macros come from verified source)
          verifiedSubstitutions.push(sub);
        } else {
          // Unverified - log and skip
          console.warn(`Rejecting unverified substitution: ${sub.name} (source: ${sub.source}, external_id: ${sub.external_id})`);
          hasUnverifiedResults = true;
        }
      }

      // If no verified substitutions found, return with warning
      if (verifiedSubstitutions.length === 0 && data.substitutions.length > 0) {
        console.error('All substitutions were unverified and rejected');
        toast.warning('No verified food alternatives found. Try a different search.');
      }

      return {
        originalFood: data.originalFood,
        substitutions: verifiedSubstitutions,
        hasUnverifiedResults,
      };
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to find substitutions');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { findSubstitutions, isLoading, error };
};

// Hook for AI Macro Calculator
export const useAIMacroCalculator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateMacros = async (params: {
    age: number;
    gender: 'male' | 'female';
    weightKg: number;
    heightCm: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal: 'lose_weight' | 'maintain' | 'build_muscle' | 'body_recomp';
    dietaryPreference: 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegan';
  }): Promise<MacroCalculation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-macro-calculator', {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      if (!data) return null;

      // VALIDATION: Ensure macros add up correctly
      // The backend now calculates these server-side, but we double-check
      if (data.macros) {
        const validation = validateMacroCalorieMatch(data.targetCalories, {
          protein: data.macros.protein,
          carbs: data.macros.carbs,
          fat: data.macros.fat,
          fiber: data.macros.fiber || 0,
        });

        if (!validation.isValid) {
          console.warn('Macro validation warning:', {
            target: data.targetCalories,
            calculated: validation.actualCalories,
            difference: validation.difference,
          });
        }

        // Add validation metadata
        data._validation = {
          isServerCalculated: true,
          caloriesFromMacros: validation.actualCalories,
          isValid: validation.isValid,
        };
      }

      return data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to calculate macros');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { calculateMacros, isLoading, error };
};

// Hook for AI Progress Analysis
export const useAIProgressAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProgress = async (params: {
    progressData: unknown[];
    goal?: string;
    timeframeDays?: number;
  }): Promise<ProgressAnalysis | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-progress-analysis', {
        body: params,
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      return data || null;
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to analyze progress');
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeProgress, isLoading, error };
};
