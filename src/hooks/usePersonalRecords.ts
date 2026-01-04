import { useMemo } from 'react';
import { useTrainingLogs } from './useTrainingLogs';

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  achievedAt: string;
  previousBest?: number;
  improvement?: number;
}

/**
 * Calculates personal records from training logs.
 * Uses Brzycki formula for 1RM estimation: weight × (36 / (37 - reps))
 */
export function usePersonalRecords() {
  const { data: logs, isLoading } = useTrainingLogs();

  const records = useMemo((): PersonalRecord[] => {
    if (!logs || logs.length === 0) return [];

    const prMap = new Map<string, PersonalRecord>();

    // Process all logs to find PRs
    for (const log of logs) {
      if (!log.exercises) continue;

      for (const exercise of log.exercises) {
        if (!exercise.sets) continue;

        for (const set of exercise.sets) {
          if (set.is_warmup || !set.weight_kg || !set.reps) continue;
          if (set.reps > 12) continue; // Skip high-rep sets for 1RM calc

          // Calculate estimated 1RM using Brzycki formula
          const weight = set.weight_kg;
          const reps = set.reps;
          const estimatedOneRM = Math.round(weight * (36 / (37 - reps)));

          const exerciseKey = exercise.exercise_name.toLowerCase().trim();
          const existing = prMap.get(exerciseKey);

          if (!existing || estimatedOneRM > existing.estimatedOneRM) {
            const previousBest = existing?.estimatedOneRM;
            prMap.set(exerciseKey, {
              exerciseName: exercise.exercise_name,
              weight,
              reps,
              estimatedOneRM,
              achievedAt: log.logged_at,
              previousBest,
              improvement: previousBest ? estimatedOneRM - previousBest : undefined,
            });
          }
        }
      }
    }

    // Sort by estimated 1RM descending
    return Array.from(prMap.values())
      .sort((a, b) => b.estimatedOneRM - a.estimatedOneRM)
      .slice(0, 10); // Top 10 PRs
  }, [logs]);

  // Get recent PRs (achieved in last 7 days)
  const recentPRs = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return records.filter(pr => new Date(pr.achievedAt) > weekAgo);
  }, [records]);

  return {
    records,
    recentPRs,
    isLoading,
    hasRecords: records.length > 0,
  };
}
