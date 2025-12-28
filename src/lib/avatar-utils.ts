// Consolidated avatar configuration, unlock requirements, and utilities

// ==================== UNLOCK TYPES ====================
export const UNLOCK_TYPES = {
  workout_count: { label: 'Workouts', unit: 'workouts', icon: 'Dumbbell', verb: 'Complete' },
  habit_streak: { label: 'Day Streak', unit: 'days', icon: 'Flame', verb: 'Maintain a' },
  progress_entries: { label: 'Progress Entries', unit: 'entries', icon: 'BarChart3', verb: 'Log' },
  progress_photos: { label: 'Progress Photos', unit: 'photos', icon: 'Camera', verb: 'Upload' },
  macro_days: { label: 'Macro Tracking', unit: 'days', icon: 'Utensils', verb: 'Track macros for' },
  xp_total: { label: 'Total XP', unit: 'XP', icon: 'Zap', verb: 'Earn' },
  leaderboard_rank: { label: 'Top Leaderboard', unit: '', icon: 'Trophy', verb: 'Reach top' },
  challenges_completed: { label: 'Challenges', unit: 'completed', icon: 'Target', verb: 'Complete' },
  coach_role: { label: 'Coach Only', unit: '', icon: 'Award', verb: '' },
} as const;

export type UnlockType = keyof typeof UNLOCK_TYPES;

// ==================== RARITY CONFIGURATION ====================
export const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-slate-400/50',
    glow: '',
    gradient: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/50',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]',
    gradient: 'bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-400',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/50',
    glow: 'shadow-[0_0_25px_rgba(96,165,250,0.6)]',
    gradient: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/50',
    glow: 'shadow-[0_0_30px_rgba(192,132,252,0.6)]',
    gradient: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/50',
    glow: 'shadow-[0_0_40px_rgba(0,255,170,0.6)]',
    gradient: 'bg-gradient-to-br from-cyan-400 via-emerald-400 to-lime-400',
  },
} as const;

export type Rarity = keyof typeof RARITY_CONFIG;

// ==================== DEFAULT AVATARS ====================
export const DEFAULT_AVATAR = {
  slug: 'strongman_bear',
  name: 'Strongman Bear',
  rarity: 'common' as const,
};

export type FreeAvatarItem = {
  slug: string;
  name: string;
  gender: 'male' | 'female';
};

export const FREE_AVATARS_MALE: FreeAvatarItem[] = [
  { slug: 'strongman_bear', name: 'Strongman Bear', gender: 'male' },
  { slug: 'weightlifting_lion', name: 'Weightlifting Lion', gender: 'male' },
  { slug: 'crossfit_wolf', name: 'CrossFit Wolf', gender: 'male' },
  { slug: 'sprinter_cheetah', name: 'Sprinter Cheetah', gender: 'male' },
  { slug: 'parkour_monkey', name: 'Parkour Monkey', gender: 'male' },
];

export const FREE_AVATARS_FEMALE: FreeAvatarItem[] = [
  { slug: 'strongwoman_bear_female', name: 'Strongwoman Bear', gender: 'female' },
  { slug: 'weightlifting_tigress', name: 'Weightlifting Tigress', gender: 'female' },
  { slug: 'crossfit_wolf_female', name: 'CrossFit Wolf', gender: 'female' },
  { slug: 'sprinter_cheetah_female', name: 'Sprinter Cheetah', gender: 'female' },
  { slug: 'parkour_monkey_female', name: 'Parkour Monkey', gender: 'female' },
];

// Combined for backwards compatibility
export const FREE_AVATARS = FREE_AVATARS_MALE;

/**
 * Get free avatars filtered by gender
 */
export function getFreeAvatarsByGender(gender: string | null): FreeAvatarItem[] {
  if (gender === 'female') return FREE_AVATARS_FEMALE;
  if (gender === 'male') return FREE_AVATARS_MALE;
  // For 'prefer_not_to_say' or null, return all
  return [...FREE_AVATARS_MALE, ...FREE_AVATARS_FEMALE];
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get human-readable description for an unlock requirement
 */
export function getUnlockDescription(unlockType: string | null, threshold: number | null): string {
  if (!unlockType || threshold === null) return 'Free avatar';
  
  const config = UNLOCK_TYPES[unlockType as UnlockType];
  if (!config) return `Unlock requirement: ${threshold}`;
  
  if (unlockType === 'leaderboard_rank') {
    return `${config.verb} ${threshold} on the leaderboard`;
  }
  if (unlockType === 'coach_role') {
    return 'Exclusive to coaches';
  }
  
  return `${config.verb} ${threshold.toLocaleString()} ${config.label}`;
}

/**
 * Get unlock icon name for a given unlock type
 */
export function getUnlockIcon(unlockType: string | null): string {
  if (!unlockType) return 'Gift';
  const config = UNLOCK_TYPES[unlockType as UnlockType];
  return config?.icon || 'Lock';
}

/**
 * Calculate progress towards unlocking an avatar
 */
export interface UnlockStats {
  workoutCount: number;
  habitStreak: number;
  progressEntries: number;
  progressPhotos: number;
  macroDays: number;
  xpTotal: number;
  challengesCompleted: number;
  leaderboardRank: number;
}

export function getUnlockProgress(
  unlockType: string | null,
  threshold: number | null,
  stats: UnlockStats
): { current: number; target: number; percentage: number } | null {
  if (!unlockType || !threshold) return null;
  
  let current = 0;
  switch (unlockType) {
    case 'workout_count': current = stats.workoutCount; break;
    case 'habit_streak': current = stats.habitStreak; break;
    case 'progress_entries': current = stats.progressEntries; break;
    case 'progress_photos': current = stats.progressPhotos; break;
    case 'macro_days': current = stats.macroDays; break;
    case 'xp_total': current = stats.xpTotal; break;
    case 'challenges_completed': current = stats.challengesCompleted; break;
    case 'leaderboard_rank': 
      // For leaderboard, lower is better
      return { 
        current: stats.leaderboardRank, 
        target: threshold, 
        percentage: stats.leaderboardRank <= threshold ? 100 : Math.max(0, 100 - ((stats.leaderboardRank - threshold) * 10))
      };
  }
  
  return { 
    current, 
    target: threshold, 
    percentage: Math.min(100, (current / threshold) * 100) 
  };
}

// Legacy export for backward compatibility with UNLOCK_DESCRIPTIONS
export const UNLOCK_DESCRIPTIONS = UNLOCK_TYPES;
