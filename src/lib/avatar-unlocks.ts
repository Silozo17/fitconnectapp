// Avatar unlock descriptions and requirements
// Icons are Lucide icon names (not emojis) for consistent SVG rendering
export const UNLOCK_DESCRIPTIONS: Record<string, { label: string; icon: string; verb: string }> = {
  workout_count: { label: 'Workouts', icon: 'Dumbbell', verb: 'Complete' },
  habit_streak: { label: 'Day Streak', icon: 'Flame', verb: 'Maintain a' },
  progress_entries: { label: 'Progress Entries', icon: 'BarChart3', verb: 'Log' },
  progress_photos: { label: 'Progress Photos', icon: 'Camera', verb: 'Upload' },
  macro_days: { label: 'Days Tracking Macros', icon: 'Utensils', verb: 'Track macros for' },
  xp_total: { label: 'XP', icon: 'Zap', verb: 'Earn' },
  challenges_completed: { label: 'Challenges', icon: 'Target', verb: 'Complete' },
  leaderboard_rank: { label: 'Leaderboard Rank', icon: 'Trophy', verb: 'Reach top' },
};

export function getUnlockDescription(unlockType: string | null, threshold: number | null): string {
  if (!unlockType || !threshold) return 'Free avatar';
  const info = UNLOCK_DESCRIPTIONS[unlockType];
  if (!info) return `Unlock requirement: ${threshold}`;
  
  if (unlockType === 'leaderboard_rank') {
    return `${info.verb} ${threshold} on the leaderboard`;
  }
  
  return `${info.verb} ${threshold.toLocaleString()} ${info.label}`;
}

export function getUnlockProgress(
  unlockType: string | null,
  threshold: number | null,
  stats: {
    workoutCount: number;
    habitStreak: number;
    progressEntries: number;
    progressPhotos: number;
    macroDays: number;
    xpTotal: number;
    challengesCompleted: number;
    leaderboardRank: number;
  }
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
