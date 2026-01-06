import { useMemo } from 'react';
import { useHealthAggregation } from './useHealthAggregation';
import { format } from 'date-fns';

export interface ReadinessScore {
  score: number; // 0-100
  level: 'low' | 'moderate' | 'good' | 'optimal';
  color: string;
  components: {
    sleep: { score: number; value: number | null; unit: string };
    recovery: { score: number; value: number | null; unit: string };
    activity: { score: number; value: number | null; unit: string };
  };
  recommendation: string;
}

/**
 * Calculates a daily readiness score based on wearable data.
 * Score is calculated from sleep quality, heart rate variability/resting HR, and previous day activity.
 */
export function useReadinessScore() {
  const { data, isLoading, getDailyAverage } = useHealthAggregation({ days: 14 });

  const readiness = useMemo((): ReadinessScore | null => {
    if (!data || data.length === 0) return null;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Get TODAY's data only - no fallback to previous days
    const getTodayValue = (type: string): number | null => {
      const todayEntry = data.find(d => d.data_type === type && d.recorded_at.startsWith(today));
      return todayEntry?.value ?? null;
    };

    // Get current values for TODAY only
    const currentSleep = getTodayValue('sleep');
    const currentRestingHR = getTodayValue('heart_rate');
    const currentActiveMinutes = getTodayValue('active_minutes');

    // If no data for today at all, return null to show empty state
    const hasTodayData = currentSleep !== null || currentRestingHR !== null || currentActiveMinutes !== null;
    if (!hasTodayData) return null;

    // Get baseline averages (7-day) for comparison calculations
    const avgSleep = getDailyAverage('sleep', 7);
    const avgRestingHR = getDailyAverage('heart_rate', 7);
    const avgActiveMinutes = getDailyAverage('active_minutes', 7);
    
    // Track which components have data for weighted calculation
    let hasRecoveryData = currentRestingHR !== null && avgRestingHR > 0;
    let hasSleepData = currentSleep !== null;
    let hasActivityData = currentActiveMinutes !== null;

    // Calculate component scores (0-100)
    let sleepScore = 50;
    if (currentSleep !== null) {
      // Sleep in minutes, 7-9 hours (420-540 min) is optimal
      if (currentSleep >= 420 && currentSleep <= 540) {
        sleepScore = 100;
      } else if (currentSleep >= 360) {
        sleepScore = 70 + ((currentSleep - 360) / 60) * 30;
      } else if (currentSleep >= 300) {
        sleepScore = 40 + ((currentSleep - 300) / 60) * 30;
      } else {
        sleepScore = Math.max(10, (currentSleep / 300) * 40);
      }
    }

    let recoveryScore = 50;
    if (hasRecoveryData) {
      // Lower resting HR relative to average = better recovery
      const hrRatio = currentRestingHR! / avgRestingHR;
      if (hrRatio <= 0.95) {
        recoveryScore = 100;
      } else if (hrRatio <= 1.0) {
        recoveryScore = 80 + (1.0 - hrRatio) * 400;
      } else if (hrRatio <= 1.1) {
        recoveryScore = 50 + (1.1 - hrRatio) * 300;
      } else {
        recoveryScore = Math.max(20, 50 - (hrRatio - 1.1) * 200);
      }
    }

    let activityScore = 50;
    if (currentActiveMinutes !== null) {
      // 30-60 active minutes is optimal for recovery
      if (currentActiveMinutes >= 30 && currentActiveMinutes <= 90) {
        activityScore = 100;
      } else if (currentActiveMinutes > 90) {
        // High activity yesterday might mean lower readiness today
        activityScore = Math.max(40, 100 - (currentActiveMinutes - 90) * 0.5);
      } else {
        activityScore = 50 + (currentActiveMinutes / 30) * 50;
      }
    }

    // Dynamic weighting based on available data
    let weights = { sleep: 0.5, recovery: 0.3, activity: 0.2 };
    
    // If no recovery data, redistribute weights
    if (!hasRecoveryData) {
      weights = { sleep: 0.65, recovery: 0, activity: 0.35 };
    }
    // If only sleep data available
    if (!hasRecoveryData && !hasActivityData) {
      weights = { sleep: 1.0, recovery: 0, activity: 0 };
    }
    // If only activity data available
    if (!hasSleepData && !hasRecoveryData) {
      weights = { sleep: 0, recovery: 0, activity: 1.0 };
    }

    const totalScore = Math.round(
      sleepScore * weights.sleep +
      recoveryScore * weights.recovery +
      activityScore * weights.activity
    );

    // Determine level and recommendation
    let level: ReadinessScore['level'];
    let color: string;
    let recommendation: string;

    if (totalScore >= 80) {
      level = 'optimal';
      color = 'text-green-500';
      recommendation = 'Great recovery! You\'re ready for high-intensity training today.';
    } else if (totalScore >= 60) {
      level = 'good';
      color = 'text-lime-500';
      recommendation = 'Good readiness. A moderate workout would be ideal.';
    } else if (totalScore >= 40) {
      level = 'moderate';
      color = 'text-amber-500';
      recommendation = 'Consider a lighter session today. Focus on mobility or technique.';
    } else {
      level = 'low';
      color = 'text-red-500';
      recommendation = 'Your body needs rest. Prioritize recovery activities today.';
    }

    return {
      score: totalScore,
      level,
      color,
      components: {
        sleep: { 
          score: Math.round(sleepScore), 
          value: currentSleep ? Math.round(currentSleep / 60 * 10) / 10 : null, 
          unit: 'hrs' 
        },
        recovery: { 
          score: Math.round(recoveryScore), 
          value: currentRestingHR, 
          unit: 'bpm' 
        },
        activity: { 
          score: Math.round(activityScore), 
          value: currentActiveMinutes, 
          unit: 'min' 
        },
      },
      recommendation,
    };
  }, [data, getDailyAverage]);

  return {
    readiness,
    isLoading,
    hasData: data && data.length > 0,
  };
}
