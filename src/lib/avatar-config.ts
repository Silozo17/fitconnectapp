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
    border: 'border-muted',
    glow: '',
    gradient: 'bg-gradient-to-br from-slate-400 to-slate-500',
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/50',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
    gradient: 'bg-gradient-to-br from-emerald-400 to-green-500',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    gradient: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/50',
    glow: 'shadow-[0_0_25px_hsl(var(--primary)/0.5)]',
    gradient: 'bg-gradient-to-br from-cyan-400 to-lime-400',
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
