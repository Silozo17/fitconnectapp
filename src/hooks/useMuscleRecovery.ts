import { useMemo } from 'react';
import { useTrainingLogs } from './useTrainingLogs';
import { differenceInHours } from 'date-fns';

// Mapping of common exercises to muscle groups
const exerciseMuscleMap: Record<string, string[]> = {
  // Chest
  'bench press': ['chest', 'triceps', 'shoulders'],
  'incline bench press': ['chest', 'triceps', 'shoulders'],
  'dumbbell press': ['chest', 'triceps', 'shoulders'],
  'chest fly': ['chest'],
  'push up': ['chest', 'triceps', 'shoulders'],
  'dips': ['chest', 'triceps'],
  
  // Back
  'deadlift': ['back', 'hamstrings', 'glutes'],
  'pull up': ['back', 'biceps'],
  'lat pulldown': ['back', 'biceps'],
  'barbell row': ['back', 'biceps'],
  'dumbbell row': ['back', 'biceps'],
  'seated row': ['back', 'biceps'],
  
  // Shoulders
  'overhead press': ['shoulders', 'triceps'],
  'military press': ['shoulders', 'triceps'],
  'shoulder press': ['shoulders', 'triceps'],
  'lateral raise': ['shoulders'],
  'front raise': ['shoulders'],
  'face pull': ['shoulders', 'back'],
  
  // Legs
  'squat': ['quads', 'glutes', 'hamstrings'],
  'back squat': ['quads', 'glutes', 'hamstrings'],
  'front squat': ['quads', 'glutes'],
  'leg press': ['quads', 'glutes'],
  'lunges': ['quads', 'glutes', 'hamstrings'],
  'leg extension': ['quads'],
  'leg curl': ['hamstrings'],
  'romanian deadlift': ['hamstrings', 'glutes', 'back'],
  'hip thrust': ['glutes', 'hamstrings'],
  'calf raise': ['calves'],
  
  // Arms
  'bicep curl': ['biceps'],
  'hammer curl': ['biceps'],
  'tricep extension': ['triceps'],
  'tricep pushdown': ['triceps'],
  'skull crusher': ['triceps'],
  
  // Core
  'plank': ['core'],
  'crunch': ['core'],
  'leg raise': ['core'],
  'ab wheel': ['core'],
};

export interface MuscleStatus {
  muscle: string;
  lastTrained: string | null;
  hoursAgo: number | null;
  recoveryPercent: number;
  status: 'recovered' | 'recovering' | 'fresh';
  suggestedWait: number; // hours until recovered
}

// Recovery time in hours based on intensity
const BASE_RECOVERY_HOURS = 48;
const HIGH_INTENSITY_RECOVERY = 72;

/**
 * Tracks muscle group recovery based on training logs.
 */
export function useMuscleRecovery() {
  const { data: logs, isLoading } = useTrainingLogs();

  const muscleStatus = useMemo((): MuscleStatus[] => {
    if (!logs || logs.length === 0) return [];

    const muscleLastTrained = new Map<string, { date: string; intensity: 'low' | 'moderate' | 'high' }>();
    const now = new Date();

    // Find last training date for each muscle group
    for (const log of logs) {
      if (!log.exercises) continue;

      for (const exercise of log.exercises) {
        const exerciseNameLower = exercise.exercise_name.toLowerCase();
        
        // Find matching muscle groups
        let muscleGroups: string[] = [];
        for (const [pattern, muscles] of Object.entries(exerciseMuscleMap)) {
          if (exerciseNameLower.includes(pattern)) {
            muscleGroups = [...muscleGroups, ...muscles];
          }
        }

        // If no match found, try to guess from exercise name
        if (muscleGroups.length === 0) {
          if (exerciseNameLower.includes('chest')) muscleGroups.push('chest');
          if (exerciseNameLower.includes('back')) muscleGroups.push('back');
          if (exerciseNameLower.includes('leg') || exerciseNameLower.includes('quad')) muscleGroups.push('quads');
          if (exerciseNameLower.includes('shoulder')) muscleGroups.push('shoulders');
          if (exerciseNameLower.includes('arm') || exerciseNameLower.includes('bicep')) muscleGroups.push('biceps');
          if (exerciseNameLower.includes('tricep')) muscleGroups.push('triceps');
          if (exerciseNameLower.includes('core') || exerciseNameLower.includes('ab')) muscleGroups.push('core');
        }

        // Determine intensity from fatigue level or default to moderate
        const intensity = log.fatigue_level || 'moderate';

        for (const muscle of new Set(muscleGroups)) {
          const existing = muscleLastTrained.get(muscle);
          if (!existing || new Date(log.logged_at) > new Date(existing.date)) {
            muscleLastTrained.set(muscle, { date: log.logged_at, intensity });
          }
        }
      }
    }

    // Calculate recovery status for each muscle
    const allMuscles = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'biceps', 'triceps', 'core', 'calves'];
    
    return allMuscles.map(muscle => {
      const lastTrained = muscleLastTrained.get(muscle);
      
      if (!lastTrained) {
        return {
          muscle,
          lastTrained: null,
          hoursAgo: null,
          recoveryPercent: 100,
          status: 'fresh' as const,
          suggestedWait: 0,
        };
      }

      const hoursAgo = differenceInHours(now, new Date(lastTrained.date));
      const recoveryTime = lastTrained.intensity === 'high' ? HIGH_INTENSITY_RECOVERY : BASE_RECOVERY_HOURS;
      const recoveryPercent = Math.min(100, Math.round((hoursAgo / recoveryTime) * 100));
      
      let status: 'recovered' | 'recovering' | 'fresh' = 'recovered';
      if (hoursAgo < recoveryTime * 0.5) {
        status = 'recovering';
      } else if (hoursAgo < recoveryTime) {
        status = 'recovering';
      }
      
      const suggestedWait = Math.max(0, recoveryTime - hoursAgo);

      return {
        muscle,
        lastTrained: lastTrained.date,
        hoursAgo,
        recoveryPercent,
        status,
        suggestedWait,
      };
    }).sort((a, b) => a.recoveryPercent - b.recoveryPercent);
  }, [logs]);

  // Suggest muscles ready to train
  const readyToTrain = useMemo(() => 
    muscleStatus.filter(m => m.status === 'recovered' || m.status === 'fresh'),
  [muscleStatus]);

  // Muscles still recovering
  const stillRecovering = useMemo(() => 
    muscleStatus.filter(m => m.status === 'recovering'),
  [muscleStatus]);

  return {
    muscleStatus,
    readyToTrain,
    stillRecovering,
    isLoading,
    hasData: muscleStatus.length > 0,
  };
}
