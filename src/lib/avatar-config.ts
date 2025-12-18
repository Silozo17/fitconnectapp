// Avatar configuration and unlock requirements

export const UNLOCK_TYPES = {
  workout_count: { label: 'Workouts', unit: 'workouts' },
  habit_streak: { label: 'Day Streak', unit: 'days' },
  progress_entries: { label: 'Progress Entries', unit: 'entries' },
  progress_photos: { label: 'Progress Photos', unit: 'photos' },
  macro_days: { label: 'Macro Tracking', unit: 'days' },
  xp_total: { label: 'Total XP', unit: 'XP' },
  leaderboard_rank: { label: 'Top Leaderboard', unit: '' },
  challenges_completed: { label: 'Challenges', unit: 'completed' },
  coach_role: { label: 'Coach Only', unit: '' },
} as const;

export const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'text-muted-foreground',
    bg: 'bg-muted/50',
    border: 'border-slate-400/50',
    glow: '',
    gradient: 'bg-gradient-to-br from-slate-500 via-slate-400 to-slate-600',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/50',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
    gradient: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/50',
    glow: 'shadow-[0_0_25px_rgba(96,165,250,0.5)]',
    gradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/50',
    glow: 'shadow-[0_0_30px_rgba(192,132,252,0.5)]',
    gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/50',
    glow: 'shadow-[0_0_35px_hsl(var(--primary)/0.6)]',
    gradient: 'bg-gradient-to-br from-cyan-400 via-teal-300 to-primary',
  },
} as const;

// Default avatar for users who haven't selected one
export const DEFAULT_AVATAR = {
  slug: 'strongman_bear',
  name: 'Strongman Bear',
  rarity: 'common' as const,
};

// Free avatars available during onboarding
export const FREE_AVATARS = [
  { slug: 'strongman_bear', name: 'Strongman Bear' },
  { slug: 'weightlifting_lion', name: 'Weightlifting Lion' },
  { slug: 'crossfit_wolf', name: 'CrossFit Wolf' },
  { slug: 'sprinter_cheetah', name: 'Sprinter Cheetah' },
  { slug: 'parkour_monkey', name: 'Parkour Monkey' },
];

export type UnlockType = keyof typeof UNLOCK_TYPES;
export type Rarity = keyof typeof RARITY_CONFIG;

export function getUnlockDescription(unlockType: UnlockType | null, threshold: number | null): string {
  if (!unlockType || threshold === null) return 'Free avatar';
  
  const config = UNLOCK_TYPES[unlockType];
  if (!config) return 'Unknown requirement';
  
  if (unlockType === 'leaderboard_rank') {
    return `Reach Top ${threshold} on leaderboard`;
  }
  if (unlockType === 'coach_role') {
    return 'Exclusive to coaches';
  }
  
  return `${config.label}: ${threshold} ${config.unit}`;
}
