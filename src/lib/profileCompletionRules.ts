/**
 * Centralised profile completion rules
 * Single source of truth for what constitutes a "complete" coach profile
 */

export interface ProfileData {
  bio?: string | null;
  card_image_url?: string | null;
  coach_types?: string[] | null;
  experience_years?: number | null;
  location?: string | null;
  online_available?: boolean | null;
  in_person_available?: boolean | null;
  who_i_work_with?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
  linkedin_url?: string | null;
  threads_url?: string | null;
  stripe_connect_id?: string | null;
  stripe_connect_onboarded?: boolean | null;
}

export interface CompletionContext {
  profile: ProfileData;
  galleryCount: number;
  groupClassCount: number;
}

export interface CompletionRule {
  id: string;
  label: string;
  weight: number;
  check: (ctx: CompletionContext) => boolean;
}

/**
 * All profile completion rules with their weights
 * Total weight: 100
 */
export const PROFILE_COMPLETION_RULES: CompletionRule[] = [
  {
    id: "profile_photo",
    label: "Profile photo",
    weight: 15,
    check: (ctx) => !!ctx.profile.card_image_url,
  },
  {
    id: "bio",
    label: "Bio",
    weight: 15,
    check: (ctx) => !!ctx.profile.bio && ctx.profile.bio.length > 50,
  },
  {
    id: "specialisations",
    label: "Coach specialisations",
    weight: 10,
    check: (ctx) => !!(ctx.profile.coach_types && ctx.profile.coach_types.length > 0),
  },
  {
    id: "experience",
    label: "Years of experience",
    weight: 5,
    check: (ctx) => ctx.profile.experience_years !== null && ctx.profile.experience_years !== undefined,
  },
  {
    id: "location",
    label: "Location",
    weight: 10,
    check: (ctx) => !!ctx.profile.location,
  },
  {
    id: "availability",
    label: "Session availability",
    weight: 10,
    check: (ctx) => !!(ctx.profile.online_available || ctx.profile.in_person_available),
  },
  {
    id: "who_i_work_with",
    label: "Who you work with",
    weight: 10,
    check: (ctx) => !!ctx.profile.who_i_work_with && ctx.profile.who_i_work_with.length > 20,
  },
  {
    id: "gallery",
    label: "Gallery images",
    weight: 10,
    check: (ctx) => ctx.galleryCount >= 1,
  },
  {
    id: "social_links",
    label: "Social media links",
    weight: 10,
    check: (ctx) => !!(
      ctx.profile.instagram_url ||
      ctx.profile.facebook_url ||
      ctx.profile.youtube_url ||
      ctx.profile.tiktok_url ||
      ctx.profile.x_url ||
      ctx.profile.linkedin_url ||
      ctx.profile.threads_url
    ),
  },
  {
    id: "stripe_connected",
    label: "Connect Stripe",
    weight: 5,
    check: (ctx) => !!ctx.profile.stripe_connect_id && !!ctx.profile.stripe_connect_onboarded,
  },
];

export interface CompletionResult {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
}

/**
 * Calculate profile completion from context data
 */
export function calculateProfileCompletion(ctx: CompletionContext): {
  percentage: number;
  results: CompletionResult[];
  completedCount: number;
  totalCount: number;
  incompleteItems: CompletionResult[];
} {
  const results = PROFILE_COMPLETION_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    weight: rule.weight,
    completed: rule.check(ctx),
  }));

  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
  const completedWeight = results.filter((r) => r.completed).reduce((sum, r) => sum + r.weight, 0);
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  const completedCount = results.filter((r) => r.completed).length;
  const incompleteItems = results.filter((r) => !r.completed);

  return {
    percentage,
    results,
    completedCount,
    totalCount: results.length,
    incompleteItems,
  };
}
