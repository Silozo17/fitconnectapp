import { useMemo } from 'react';
import { useHealthAggregation } from './useHealthAggregation';
import { format, subDays, differenceInDays } from 'date-fns';

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
  dataConfidence: 'high' | 'medium' | 'low';
}

/**
 * Industry-standard readiness score calculation based on WHOOP, Oura, and Garmin methodologies.
 * 
 * Key principles:
 * - Uses LAST NIGHT's sleep (recorded today)
 * - Uses YESTERDAY's activity for strain calculation
 * - Compares against personal baselines (14-day weighted average)
 * - Activity balance matters: both too much AND too little activity reduce readiness
 */
export function useReadinessScore() {
  // Fetch 30 days for robust baseline calculations
  const { data, isLoading } = useHealthAggregation({ days: 30 });

  const readiness = useMemo((): ReadinessScore | null => {
    if (!data || data.length === 0) return null;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    // === DATA EXTRACTION ===
    
    // Get LAST NIGHT's sleep (recorded today - represents sleep that ended this morning)
    const lastNightSleep = data.find(d => 
      d.data_type === 'sleep' && d.recorded_at.startsWith(today)
    );

    // Get YESTERDAY's activity/strain metrics (key insight from research)
    const yesterdayActiveMinutes = data.find(d => 
      d.data_type === 'active_minutes' && d.recorded_at.startsWith(yesterday)
    );
    const yesterdaySteps = data.find(d => 
      d.data_type === 'steps' && d.recorded_at.startsWith(yesterday)
    );

    // Get TODAY's morning resting HR (best indicator of overnight recovery)
    const todayRestingHR = data.find(d => 
      d.data_type === 'heart_rate' && d.recorded_at.startsWith(today)
    );

    // === PERSONAL BASELINE CALCULATIONS (Oura-style weighted averages) ===
    
    const getWeightedAverage = (type: string): number => {
      const entries = data.filter(d => d.data_type === type);
      if (entries.length === 0) return 0;
      
      let weightedSum = 0;
      let totalWeight = 0;
      
      entries.forEach(entry => {
        const daysAgo = differenceInDays(new Date(), new Date(entry.recorded_at));
        if (daysAgo <= 0) return; // Exclude today from baseline
        
        // Exponential decay: recent days weighted more heavily (7-day half-life)
        const weight = Math.exp(-daysAgo / 7);
        weightedSum += entry.value * weight;
        totalWeight += weight;
      });
      
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    };

    // Personal baselines (14-day weighted averages)
    const baselineRestingHR = getWeightedAverage('heart_rate');
    const baselineSleep = getWeightedAverage('sleep');
    const baselineActiveMinutes = getWeightedAverage('active_minutes');

    // Track data availability
    const hasSleepData = lastNightSleep !== undefined;
    const hasRecoveryData = todayRestingHR !== undefined && baselineRestingHR > 0;
    const hasActivityData = yesterdayActiveMinutes !== undefined || yesterdaySteps !== undefined;

    // If no relevant data at all, return null
    if (!hasSleepData && !hasRecoveryData && !hasActivityData) return null;

    // === COMPONENT SCORE CALCULATIONS ===

    // SLEEP SCORE (40% weight - most important for next-day readiness)
    const calculateSleepScore = (): number => {
      if (!lastNightSleep) return 50; // Neutral if no data
      
      const sleepMinutes = lastNightSleep.value;
      const sleepHours = sleepMinutes / 60;
      
      // Duration score: Optimal 7-9 hours
      let durationScore = 0;
      if (sleepHours >= 7 && sleepHours <= 9) {
        durationScore = 100;
      } else if (sleepHours >= 6) {
        durationScore = 60 + ((sleepHours - 6) * 40); // 60-100
      } else if (sleepHours >= 5) {
        durationScore = 30 + ((sleepHours - 5) * 30); // 30-60
      } else {
        durationScore = Math.max(10, sleepHours * 6); // 0-30
      }
      
      // Sleep Balance comparison (Oura concept)
      const balanceScore = baselineSleep > 0 
        ? Math.min(100, (sleepMinutes / baselineSleep) * 80 + 20)
        : 70;
      
      // Weight: 70% absolute duration, 30% vs personal baseline
      return Math.round(durationScore * 0.7 + balanceScore * 0.3);
    };

    // RECOVERY SCORE (30% weight - based on morning resting HR vs baseline)
    const calculateRecoveryScore = (): number => {
      if (!todayRestingHR || baselineRestingHR === 0) return 50;
      
      const currentHR = todayRestingHR.value;
      const ratio = currentHR / baselineRestingHR;
      
      // Oura-style deviation interpretation:
      // - Slightly below baseline = optimal recovery
      // - At baseline = normal
      // - Above baseline = stress/incomplete recovery
      if (ratio >= 0.90 && ratio <= 0.98) {
        return 100; // Slightly below baseline = optimal
      } else if (ratio >= 0.85 && ratio < 0.90) {
        return 85; // Significantly lower - could indicate low arousal
      } else if (ratio > 0.98 && ratio <= 1.02) {
        return 80; // At baseline - normal recovery
      } else if (ratio > 1.02 && ratio <= 1.05) {
        return 60; // Slightly elevated - mild stress
      } else if (ratio > 1.05 && ratio <= 1.10) {
        return 40; // Elevated - significant stress
      } else if (ratio > 1.10) {
        return Math.max(15, 40 - (ratio - 1.10) * 250); // Very elevated
      } else {
        return 70; // Very low HR - unusual but not alarming
      }
    };

    // ACTIVITY BALANCE SCORE (30% weight - yesterday's strain affects today's readiness)
    const calculateActivityScore = (): number => {
      const yesterdayActive = yesterdayActiveMinutes?.value || 0;
      const yesterdayStepsVal = yesterdaySteps?.value || 0;
      
      if (yesterdayActive === 0 && yesterdayStepsVal === 0 && !hasActivityData) return 50;
      
      // Calculate strain relative to personal baseline
      const activeRatio = baselineActiveMinutes > 0 
        ? yesterdayActive / baselineActiveMinutes 
        : 1;
      
      // Key insight from research: Both too much AND too little activity hurt readiness
      // Sweet spot is 80-120% of normal activity
      if (activeRatio >= 0.8 && activeRatio <= 1.2) {
        // Optimal range - balanced activity
        return 90 + ((1 - Math.abs(activeRatio - 1)) * 10); // 90-100
      } else if (activeRatio > 1.2 && activeRatio <= 1.5) {
        // Moderately high activity yesterday = slightly reduced readiness today
        return 70 + ((1.5 - activeRatio) * 66); // 70-90
      } else if (activeRatio > 1.5 && activeRatio <= 2.0) {
        // High activity = reduced readiness (recovery needed)
        return 50 + ((2.0 - activeRatio) * 40); // 50-70
      } else if (activeRatio > 2.0) {
        // Very high activity = significantly reduced readiness
        return Math.max(30, 50 - (activeRatio - 2.0) * 20);
      } else if (activeRatio < 0.8 && activeRatio >= 0.5) {
        // Low activity = slightly reduced (movement is good for recovery)
        return 70 + ((activeRatio - 0.5) * 66); // 70-90
      } else {
        // Very low activity
        return 50 + (activeRatio * 40); // 50-70
      }
    };

    // Calculate individual component scores
    const sleepScore = calculateSleepScore();
    const recoveryScore = calculateRecoveryScore();
    const activityScore = calculateActivityScore();

    // === DYNAMIC WEIGHTING BASED ON DATA AVAILABILITY ===
    
    let weights = { sleep: 0.40, recovery: 0.30, activity: 0.30 };
    let dataConfidence: 'high' | 'medium' | 'low' = 'high';

    const availableComponents = [hasSleepData, hasRecoveryData, hasActivityData].filter(Boolean).length;
    
    if (availableComponents === 3) {
      // All data available - use standard weights
      weights = { sleep: 0.40, recovery: 0.30, activity: 0.30 };
      dataConfidence = 'high';
    } else if (availableComponents === 2) {
      dataConfidence = 'medium';
      if (!hasRecoveryData) {
        weights = { sleep: 0.55, recovery: 0, activity: 0.45 };
      } else if (!hasActivityData) {
        weights = { sleep: 0.55, recovery: 0.45, activity: 0 };
      } else if (!hasSleepData) {
        weights = { sleep: 0, recovery: 0.55, activity: 0.45 };
      }
    } else {
      dataConfidence = 'low';
      if (hasSleepData) {
        weights = { sleep: 1.0, recovery: 0, activity: 0 };
      } else if (hasRecoveryData) {
        weights = { sleep: 0, recovery: 1.0, activity: 0 };
      } else {
        weights = { sleep: 0, recovery: 0, activity: 1.0 };
      }
    }

    // Calculate final score
    const totalScore = Math.round(
      sleepScore * weights.sleep +
      recoveryScore * weights.recovery +
      activityScore * weights.activity
    );

    // === SCORE INTERPRETATION (Oura-aligned thresholds) ===
    
    let level: ReadinessScore['level'];
    let color: string;
    let recommendation: string;

    if (totalScore >= 85) {
      level = 'optimal';
      color = 'text-green-500';
      recommendation = dataConfidence === 'high'
        ? 'Excellent recovery! You\'re primed for high-intensity training or challenging activities.'
        : 'Looking good! Consider syncing more health data for better accuracy.';
    } else if (totalScore >= 70) {
      level = 'good';
      color = 'text-lime-500';
      recommendation = 'Good readiness. A moderate workout would be ideal today.';
    } else if (totalScore >= 60) {
      level = 'moderate';
      color = 'text-amber-500';
      recommendation = 'Fair recovery. Consider lighter activity—focus on technique or mobility work.';
    } else {
      level = 'low';
      color = 'text-red-500';
      // Context-specific recommendations based on which score is lowest
      if (activityScore < sleepScore && activityScore < recoveryScore) {
        recommendation = 'Yesterday\'s training was demanding. Prioritize active recovery and rest.';
      } else if (sleepScore < recoveryScore) {
        recommendation = 'Sleep quality was below optimal. Focus on recovery and earlier bedtime tonight.';
      } else {
        recommendation = 'Your body signals indicate a need for rest. Light movement only recommended.';
      }
    }

    return {
      score: totalScore,
      level,
      color,
      components: {
        sleep: { 
          score: Math.round(sleepScore), 
          value: lastNightSleep ? Math.round(lastNightSleep.value / 60 * 10) / 10 : null, 
          unit: 'hrs' 
        },
        recovery: { 
          score: Math.round(recoveryScore), 
          value: todayRestingHR?.value ?? null, 
          unit: 'bpm' 
        },
        activity: { 
          score: Math.round(activityScore), 
          value: yesterdayActiveMinutes?.value ?? null, 
          unit: 'min' 
        },
      },
      recommendation,
      dataConfidence,
    };
  }, [data]);

  return {
    readiness,
    isLoading,
    hasData: data && data.length > 0,
  };
}
