/**
 * Activity Level & Gender Configuration
 * 
 * Single source of truth for activity levels and gender options used across
 * onboarding, settings, macro calculator, and all nutrition/fitness tools.
 */

import type { ActivityLevel } from './nutrition-science-config';

// ============================================
// ACTIVITY LEVELS
// ============================================

export interface ActivityLevelOption {
  value: ActivityLevel;
  label: string;
  description: string;
}

export const ACTIVITY_LEVELS: ActivityLevelOption[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Office job, no exercise' },
  { value: 'light', label: 'Light', description: '1-2 days/week' },
  { value: 'moderate', label: 'Moderate', description: '3-5 days/week' },
  { value: 'active', label: 'Active', description: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Athlete / physical job' },
] as const;

export const DEFAULT_ACTIVITY_LEVEL: ActivityLevel = 'moderate';

// ============================================
// GENDER OPTIONS
// ============================================

export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface GenderOption {
  value: Gender;
  label: string;
}

export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Returns the gender to use for BMR calculation.
 * When gender is "prefer_not_to_say" or null, defaults to 'male' for calculation.
 * 
 * Note: Male BMR formula typically yields ~5-10% higher values than female.
 * Using male as default provides a conservative middle-ground estimate.
 */
export function getGenderForCalculation(gender: Gender | string | null): 'male' | 'female' {
  if (gender === 'female') return 'female';
  // Default to male for 'prefer_not_to_say', null, or unknown values
  return 'male';
}

/**
 * Validates and returns a valid activity level, defaulting to 'moderate' if invalid.
 */
export function getValidActivityLevel(level: string | null | undefined): ActivityLevel {
  const validLevels: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  if (level && validLevels.includes(level as ActivityLevel)) {
    return level as ActivityLevel;
  }
  return DEFAULT_ACTIVITY_LEVEL;
}

/**
 * Gets the label for an activity level.
 */
export function getActivityLevelLabel(level: ActivityLevel | string | null): string {
  const option = ACTIVITY_LEVELS.find(a => a.value === level);
  return option?.label || 'Moderate';
}

/**
 * Gets the label for a gender.
 */
export function getGenderLabel(gender: Gender | string | null): string {
  const option = GENDER_OPTIONS.find(g => g.value === gender);
  return option?.label || 'Not specified';
}
