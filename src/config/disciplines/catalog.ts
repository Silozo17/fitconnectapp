/**
 * Discipline Catalog - All predefined discipline configurations
 * Adding a new discipline = adding one config object here
 */

import { DisciplineConfig } from './types';

// ============================================
// COMBAT SPORTS
// ============================================

export const BOXING: DisciplineConfig = {
  id: 'boxing',
  name: 'Boxing',
  icon: 'Swords',
  theme: {
    gradient: 'from-red-500/20 to-orange-500/10',
    accent: 'text-red-400',
    bgAccent: 'bg-red-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'rounds_30d', label: 'Rounds Sparred', type: 'rounds', timeframe: '30d', sources: { manualEventType: 'rounds_sparred' }, formatter: 'rounds', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' },
    { id: 'active_min_7d', label: 'Active Minutes', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'active_minutes' }, formatter: 'min', computeRule: 'sum' }
  ],
  milestone: { id: 'first_bout', label: 'First Sanctioned Bout', type: 'date', eventType: 'first_bout', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} boxing sessions this week — {rounds_30d} rounds logged this month', fallback: 'Log your first boxing session to unlock insights', primaryMetricId: 'sessions_7d' }
};

export const MMA: DisciplineConfig = {
  id: 'mma',
  name: 'MMA',
  icon: 'Swords',
  theme: {
    gradient: 'from-orange-500/20 to-red-500/10',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'sparring_30d', label: 'Sparring Rounds', type: 'rounds', timeframe: '30d', sources: { manualEventType: 'sparring_rounds' }, formatter: 'rounds', computeRule: 'sum' },
    { id: 'strength_30d', label: 'Strength Sessions', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'strength_session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'active_min_7d', label: 'Active Minutes', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'active_minutes' }, formatter: 'min', computeRule: 'sum' }
  ],
  milestone: { id: 'fight_record', label: 'Fight Record', type: 'fightRecord', eventType: 'fight_record', displayRule: 'latest' },
  highlight: { template: 'Training volume is up — {sessions_7d} sessions this week', fallback: 'Log your first MMA session to track progress', primaryMetricId: 'sessions_7d' }
};

export const MUAY_THAI: DisciplineConfig = {
  id: 'muay_thai',
  name: 'Muay Thai',
  icon: 'Swords',
  theme: {
    gradient: 'from-amber-500/20 to-orange-500/10',
    accent: 'text-amber-400',
    bgAccent: 'bg-amber-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'rounds_30d', label: 'Rounds', type: 'rounds', timeframe: '30d', sources: { manualEventType: 'rounds' }, formatter: 'rounds', computeRule: 'sum' },
    { id: 'calories_7d', label: 'Calories Burned', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' }
  ],
  milestone: { id: 'first_fight', label: 'First Smoker/Fight', type: 'date', eventType: 'first_fight', displayRule: 'latest' },
  highlight: { template: '{rounds_30d} rounds this month — keep building conditioning', fallback: 'Start logging your Muay Thai sessions', primaryMetricId: 'rounds_30d' }
};

export const KICKBOXING: DisciplineConfig = {
  id: 'kickboxing',
  name: 'Kickboxing',
  icon: 'Swords',
  theme: {
    gradient: 'from-rose-500/20 to-pink-500/10',
    accent: 'text-rose-400',
    bgAccent: 'bg-rose-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'rounds_30d', label: 'Rounds', type: 'rounds', timeframe: '30d', sources: { manualEventType: 'rounds' }, formatter: 'rounds', computeRule: 'sum' },
    { id: 'active_min_7d', label: 'Active Minutes', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'active_minutes' }, formatter: 'min', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' }
  ],
  milestone: { id: 'first_competition', label: 'First Competition', type: 'date', eventType: 'first_competition', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} sessions this week — consistency wins', fallback: 'Log your first kickboxing session', primaryMetricId: 'sessions_7d' }
};

export const KARATE: DisciplineConfig = {
  id: 'karate',
  name: 'Karate',
  icon: 'Swords',
  theme: {
    gradient: 'from-slate-500/20 to-gray-500/10',
    accent: 'text-slate-400',
    bgAccent: 'bg-slate-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'kata_min_30d', label: 'Kata Practice', type: 'duration', timeframe: '30d', sources: { manualEventType: 'kata_practice' }, formatter: 'min', computeRule: 'sum' },
    { id: 'active_min_7d', label: 'Active Minutes', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'active_minutes' }, formatter: 'min', computeRule: 'sum' },
    { id: 'streak_weeks', label: 'Training Streak', type: 'streak', timeframe: '90d', sources: { manualEventType: 'session' }, formatter: 'weeks', computeRule: 'streak', computed: true }
  ],
  milestone: { id: 'current_belt', label: 'Current Belt', type: 'belt', eventType: 'belt_awarded', displayRule: 'latest' },
  highlight: { template: 'Streak: {streak_weeks} weeks — next belt is closer', fallback: 'Begin your karate journey', primaryMetricId: 'streak_weeks' }
};

export const BJJ: DisciplineConfig = {
  id: 'bjj',
  name: 'Brazilian Jiu-Jitsu',
  icon: 'Users',
  theme: {
    gradient: 'from-blue-500/20 to-indigo-500/10',
    accent: 'text-blue-400',
    bgAccent: 'bg-blue-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'sessions_30d', label: 'Monthly Sessions', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count', computed: true },
    { id: 'sparring_30d', label: 'Sparring Rounds', type: 'rounds', timeframe: '30d', sources: { manualEventType: 'sparring_rounds' }, formatter: 'rounds', computeRule: 'sum' },
    { id: 'consistency_12w', label: 'Consistency', type: 'streak', timeframe: '90d', sources: { manualEventType: 'session' }, formatter: 'weeks', computeRule: 'streak', computed: true }
  ],
  milestone: { id: 'current_belt', label: 'Current Belt', type: 'belt', eventType: 'belt_awarded', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} sessions this week — momentum stays', fallback: 'Start your BJJ journey', primaryMetricId: 'sessions_7d' }
};

// ============================================
// ENDURANCE SPORTS
// ============================================

export const RUNNING: DisciplineConfig = {
  id: 'running',
  name: 'Running',
  icon: 'PersonStanding',
  theme: {
    gradient: 'from-green-500/20 to-emerald-500/10',
    accent: 'text-green-400',
    bgAccent: 'bg-green-500/10'
  },
  metrics: [
    { id: 'distance_7d', label: 'Distance', type: 'distance', timeframe: '7d', sources: { wearableTypes: ['distance'], manualEventType: 'run' }, formatter: 'km', computeRule: 'sum' },
    { id: 'runs_7d', label: 'Runs', type: 'sessions', timeframe: '7d', sources: { wearableTypes: ['workout'], manualEventType: 'run' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'avg_pace_30d', label: 'Avg Pace', type: 'pace', timeframe: '30d', sources: { wearableTypes: ['pace'], manualEventType: 'run' }, formatter: 'pace', computeRule: 'avg' },
    { id: 'long_run_30d', label: 'Long Run', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['distance'], manualEventType: 'long_run' }, formatter: 'km', computeRule: 'max' }
  ],
  milestone: { id: 'best_5k', label: 'Best 5K Time', type: 'raceTime', eventType: 'race_5k', displayRule: 'max' },
  highlight: { template: '{distance_7d} km this week — pace trending strong', fallback: 'Log your first run to track progress', primaryMetricId: 'distance_7d' }
};

export const SWIMMING: DisciplineConfig = {
  id: 'swimming',
  name: 'Swimming',
  icon: 'Waves',
  theme: {
    gradient: 'from-cyan-500/20 to-blue-500/10',
    accent: 'text-cyan-400',
    bgAccent: 'bg-cyan-500/10'
  },
  metrics: [
    { id: 'sessions_30d', label: 'Swim Sessions', type: 'sessions', timeframe: '30d', sources: { wearableTypes: ['swim'], manualEventType: 'swim_session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'distance_30d', label: 'Total Distance', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['swim_distance'], manualEventType: 'swim_distance' }, formatter: 'm', computeRule: 'sum' },
    { id: 'avg_duration_30d', label: 'Avg Duration', type: 'duration', timeframe: '30d', sources: { wearableTypes: ['swim'], manualEventType: 'swim_session' }, formatter: 'min', computeRule: 'avg' },
    { id: 'fastest_100m', label: 'Fastest 100m', type: 'time', timeframe: '90d', sources: { manualEventType: 'swim_100m' }, formatter: 'time', computeRule: 'max' }
  ],
  milestone: { id: 'longest_swim', label: 'Longest Continuous Swim', type: 'achievement', eventType: 'longest_swim', displayRule: 'max' },
  highlight: { template: '{distance_30d}m swum this month — endurance rising', fallback: 'Start logging your swims', primaryMetricId: 'distance_30d' }
};

export const CYCLING: DisciplineConfig = {
  id: 'cycling',
  name: 'Cycling',
  icon: 'Bike',
  theme: {
    gradient: 'from-yellow-500/20 to-amber-500/10',
    accent: 'text-yellow-400',
    bgAccent: 'bg-yellow-500/10'
  },
  metrics: [
    { id: 'distance_7d', label: 'Distance', type: 'distance', timeframe: '7d', sources: { wearableTypes: ['cycling_distance'], manualEventType: 'ride' }, formatter: 'km', computeRule: 'sum' },
    { id: 'rides_7d', label: 'Rides', type: 'sessions', timeframe: '7d', sources: { wearableTypes: ['cycling'], manualEventType: 'ride' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'elevation_30d', label: 'Elevation Gain', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['elevation'], manualEventType: 'elevation' }, formatter: 'm', computeRule: 'sum' },
    { id: 'avg_speed_30d', label: 'Avg Speed', type: 'pace', timeframe: '30d', sources: { wearableTypes: ['cycling_speed'], manualEventType: 'ride' }, formatter: 'km', computeRule: 'avg' }
  ],
  milestone: { id: 'best_20km', label: 'Best 20km Time Trial', type: 'raceTime', eventType: 'time_trial_20km', displayRule: 'max' },
  highlight: { template: '{rides_7d} rides this week — climbing strong', fallback: 'Log your first ride', primaryMetricId: 'rides_7d' }
};

export const TRIATHLON: DisciplineConfig = {
  id: 'triathlon',
  name: 'Triathlon',
  icon: 'Medal',
  theme: {
    gradient: 'from-purple-500/20 to-pink-500/10',
    accent: 'text-purple-400',
    bgAccent: 'bg-purple-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Total Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'swim_30d', label: 'Swim Distance', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['swim_distance'], manualEventType: 'swim_distance' }, formatter: 'm', computeRule: 'sum' },
    { id: 'run_30d', label: 'Run Distance', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['distance'], manualEventType: 'run_distance' }, formatter: 'km', computeRule: 'sum' },
    { id: 'bike_30d', label: 'Bike Distance', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['cycling_distance'], manualEventType: 'bike_distance' }, formatter: 'km', computeRule: 'sum' }
  ],
  milestone: { id: 'next_race', label: 'Next Race Date', type: 'date', eventType: 'race_scheduled', displayRule: 'latest' },
  highlight: { template: 'Balanced week: swim/bike/run — race prep on track', fallback: 'Start your triathlon training', primaryMetricId: 'sessions_7d' }
};

// ============================================
// STRENGTH SPORTS
// ============================================

export const POWERLIFTING: DisciplineConfig = {
  id: 'powerlifting',
  name: 'Powerlifting',
  icon: 'Dumbbell',
  theme: {
    gradient: 'from-zinc-500/20 to-slate-500/10',
    accent: 'text-zinc-400',
    bgAccent: 'bg-zinc-500/10'
  },
  metrics: [
    { id: 'squat_pb', label: 'Squat PB', type: 'volumeKg', timeframe: 'all-time', sources: { manualEventType: 'squat_pb' }, formatter: 'kg', computeRule: 'max' },
    { id: 'bench_pb', label: 'Bench PB', type: 'volumeKg', timeframe: 'all-time', sources: { manualEventType: 'bench_pb' }, formatter: 'kg', computeRule: 'max' },
    { id: 'deadlift_pb', label: 'Deadlift PB', type: 'volumeKg', timeframe: 'all-time', sources: { manualEventType: 'deadlift_pb' }, formatter: 'kg', computeRule: 'max' },
    { id: 'volume_30d', label: 'Training Volume', type: 'volumeKg', timeframe: '30d', sources: { manualEventType: 'training_volume' }, formatter: 'kg', computeRule: 'sum' }
  ],
  milestone: { id: 'total', label: 'Total (S+B+D)', type: 'pb', eventType: 'total_record', displayRule: 'max' },
  highlight: { template: 'Total: {squat_pb}+{bench_pb}+{deadlift_pb}kg — strength rising', fallback: 'Log your first lifts', primaryMetricId: 'squat_pb' }
};

export const BODYBUILDING: DisciplineConfig = {
  id: 'bodybuilding',
  name: 'Bodybuilding',
  icon: 'Dumbbell',
  theme: {
    gradient: 'from-violet-500/20 to-purple-500/10',
    accent: 'text-violet-400',
    bgAccent: 'bg-violet-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'volume_sets_7d', label: 'Weekly Volume', type: 'count', timeframe: '7d', sources: { manualEventType: 'volume_sets' }, formatter: 'sets', computeRule: 'sum' },
    { id: 'weight_trend', label: 'Weight Trend', type: 'volumeKg', timeframe: '30d', sources: { wearableTypes: ['weight'], manualEventType: 'weight_log' }, formatter: 'kg', computeRule: 'latest' },
    { id: 'calories_7d', label: 'Avg Calories', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'avg' }
  ],
  milestone: { id: 'progress_photo', label: 'Last Progress Photo', type: 'date', eventType: 'progress_photo', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} sessions — weight trend: {weight_trend}kg', fallback: 'Start logging your training', primaryMetricId: 'sessions_7d' }
};

export const CROSSFIT: DisciplineConfig = {
  id: 'crossfit',
  name: 'CrossFit',
  icon: 'Flame',
  theme: {
    gradient: 'from-red-500/20 to-yellow-500/10',
    accent: 'text-red-400',
    bgAccent: 'bg-red-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'metcon_7d', label: 'Metcon Minutes', type: 'duration', timeframe: '7d', sources: { manualEventType: 'metcon' }, formatter: 'min', computeRule: 'sum' },
    { id: 'calories_7d', label: 'Calories Burned', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'sum' },
    { id: 'prs_90d', label: 'Benchmark PRs', type: 'count', timeframe: '90d', sources: { manualEventType: 'benchmark_pr' }, formatter: 'sessions', computeRule: 'count' }
  ],
  milestone: { id: 'best_fran', label: 'Best "Fran" Time', type: 'raceTime', eventType: 'fran_time', displayRule: 'max' },
  highlight: { template: 'Benchmarks: {prs_90d} PRs — keep pushing', fallback: 'Start your CrossFit journey', primaryMetricId: 'prs_90d' }
};

export const CALISTHENICS: DisciplineConfig = {
  id: 'calisthenics',
  name: 'Calisthenics',
  icon: 'PersonStanding',
  theme: {
    gradient: 'from-teal-500/20 to-cyan-500/10',
    accent: 'text-teal-400',
    bgAccent: 'bg-teal-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'skill_holds_30d', label: 'Skill Holds', type: 'duration', timeframe: '30d', sources: { manualEventType: 'skill_hold' }, formatter: 'min', computeRule: 'sum' },
    { id: 'pullups_max', label: 'Max Pull-ups', type: 'count', timeframe: 'all-time', sources: { manualEventType: 'pullups_max' }, formatter: 'sessions', computeRule: 'max' },
    { id: 'streak_weeks', label: 'Training Streak', type: 'streak', timeframe: '90d', sources: { manualEventType: 'session' }, formatter: 'weeks', computeRule: 'streak', computed: true }
  ],
  milestone: { id: 'first_muscle_up', label: 'First Muscle-Up', type: 'achievement', eventType: 'muscle_up', displayRule: 'latest' },
  highlight: { template: 'Skill progress: {skill_holds_30d} mins — strength is compounding', fallback: 'Start your calisthenics journey', primaryMetricId: 'skill_holds_30d' }
};

export const SPARTAN_RACE: DisciplineConfig = {
  id: 'spartan_race',
  name: 'Spartan Race',
  icon: 'Mountain',
  theme: {
    gradient: 'from-orange-500/20 to-red-500/10',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500/10'
  },
  metrics: [
    { id: 'runs_7d', label: 'Runs', type: 'sessions', timeframe: '7d', sources: { wearableTypes: ['workout'], manualEventType: 'run' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'distance_30d', label: 'Total Distance', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['distance'], manualEventType: 'distance' }, formatter: 'km', computeRule: 'sum' },
    { id: 'strength_30d', label: 'Strength Sessions', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'strength_session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'elevation_30d', label: 'Elevation Gain', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['elevation'], manualEventType: 'elevation' }, formatter: 'm', computeRule: 'sum' }
  ],
  milestone: { id: 'next_event', label: 'Next Event Date', type: 'date', eventType: 'event_scheduled', displayRule: 'latest' },
  highlight: { template: 'Terrain prep: {elevation_30d}m climbed this month', fallback: 'Start your Spartan training', primaryMetricId: 'elevation_30d' }
};

// ============================================
// RACKET SPORTS
// ============================================

export const TENNIS: DisciplineConfig = {
  id: 'tennis',
  name: 'Tennis',
  icon: 'Target',
  theme: {
    gradient: 'from-lime-500/20 to-green-500/10',
    accent: 'text-lime-400',
    bgAccent: 'bg-lime-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches Played', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'court_time_7d', label: 'Court Time', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'court_time' }, formatter: 'min', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' }
  ],
  milestone: { id: 'match_record', label: 'Match Record', type: 'fightRecord', eventType: 'match_record', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} sessions — {matches_30d} matches this month', fallback: 'Log your first tennis session', primaryMetricId: 'sessions_7d' }
};

export const BADMINTON: DisciplineConfig = {
  id: 'badminton',
  name: 'Badminton',
  icon: 'Target',
  theme: {
    gradient: 'from-cyan-500/20 to-teal-500/10',
    accent: 'text-cyan-400',
    bgAccent: 'bg-cyan-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'court_time_7d', label: 'Court Time', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'court_time' }, formatter: 'min', computeRule: 'sum' },
    { id: 'calories_7d', label: 'Calories', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'sum' }
  ],
  milestone: { id: 'match_record', label: 'Match Record', type: 'fightRecord', eventType: 'match_record', displayRule: 'latest' },
  highlight: { template: '{matches_30d} matches this month — speed is power', fallback: 'Log your first badminton session', primaryMetricId: 'matches_30d' }
};

export const SQUASH: DisciplineConfig = {
  id: 'squash',
  name: 'Squash',
  icon: 'Target',
  theme: {
    gradient: 'from-orange-500/20 to-amber-500/10',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'games_won_30d', label: 'Games Won', type: 'count', timeframe: '30d', sources: { manualEventType: 'games_won' }, formatter: 'sessions', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' }
  ],
  milestone: { id: 'match_record', label: 'Match Record', type: 'fightRecord', eventType: 'match_record', displayRule: 'latest' },
  highlight: { template: '{matches_30d} matches — intensity builds fitness', fallback: 'Log your first squash session', primaryMetricId: 'matches_30d' }
};

export const TABLE_TENNIS: DisciplineConfig = {
  id: 'table_tennis',
  name: 'Table Tennis',
  icon: 'Target',
  theme: {
    gradient: 'from-blue-500/20 to-indigo-500/10',
    accent: 'text-blue-400',
    bgAccent: 'bg-blue-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'games_30d', label: 'Games Played', type: 'count', timeframe: '30d', sources: { manualEventType: 'games' }, formatter: 'sessions', computeRule: 'sum' },
    { id: 'practice_time_7d', label: 'Practice Time', type: 'duration', timeframe: '7d', sources: { manualEventType: 'practice_time' }, formatter: 'min', computeRule: 'sum' }
  ],
  milestone: { id: 'rating', label: 'Current Rating', type: 'rank', eventType: 'rating_update', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} sessions — reflexes sharpening', fallback: 'Log your first table tennis session', primaryMetricId: 'sessions_7d' }
};

export const PADEL: DisciplineConfig = {
  id: 'padel',
  name: 'Padel',
  icon: 'Target',
  theme: {
    gradient: 'from-pink-500/20 to-rose-500/10',
    accent: 'text-pink-400',
    bgAccent: 'bg-pink-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Sessions', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'court_time_7d', label: 'Court Time', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'court_time' }, formatter: 'min', computeRule: 'sum' },
    { id: 'avg_hr_7d', label: 'Avg HR', type: 'heartRateAvg', timeframe: '7d', sources: { wearableTypes: ['heart_rate'] }, formatter: 'bpm', computeRule: 'avg' }
  ],
  milestone: { id: 'match_record', label: 'Match Record', type: 'fightRecord', eventType: 'match_record', displayRule: 'latest' },
  highlight: { template: '{matches_30d} matches this month — wall game improving', fallback: 'Log your first padel session', primaryMetricId: 'matches_30d' }
};

// ============================================
// TEAM SPORTS
// ============================================

export const FOOTBALL: DisciplineConfig = {
  id: 'football',
  name: 'Football',
  icon: 'Goal',
  theme: {
    gradient: 'from-emerald-500/20 to-green-500/10',
    accent: 'text-emerald-400',
    bgAccent: 'bg-emerald-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Training', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'distance_7d', label: 'Distance', type: 'distance', timeframe: '7d', sources: { wearableTypes: ['distance'], manualEventType: 'distance' }, formatter: 'km', computeRule: 'sum' },
    { id: 'sprints_7d', label: 'Sprints', type: 'count', timeframe: '7d', sources: { wearableTypes: ['sprints'], manualEventType: 'sprints' }, formatter: 'sessions', computeRule: 'sum' }
  ],
  milestone: { id: 'season_stats', label: 'Season Goals/Assists', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{distance_7d} km covered — {matches_30d} matches this month', fallback: 'Log your first football session', primaryMetricId: 'distance_7d' }
};

export const BASKETBALL: DisciplineConfig = {
  id: 'basketball',
  name: 'Basketball',
  icon: 'Circle',
  theme: {
    gradient: 'from-orange-500/20 to-amber-500/10',
    accent: 'text-orange-400',
    bgAccent: 'bg-orange-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Training', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'games_30d', label: 'Games', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'game' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'court_time_7d', label: 'Court Time', type: 'duration', timeframe: '7d', sources: { wearableTypes: ['active_minutes'], manualEventType: 'court_time' }, formatter: 'min', computeRule: 'sum' },
    { id: 'calories_7d', label: 'Calories', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'sum' }
  ],
  milestone: { id: 'season_stats', label: 'Season PPG/APG/RPG', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{games_30d} games this month — hoops don\'t stop', fallback: 'Log your first basketball session', primaryMetricId: 'games_30d' }
};

export const AMERICAN_FOOTBALL: DisciplineConfig = {
  id: 'american_football',
  name: 'American Football',
  icon: 'Hexagon',
  theme: {
    gradient: 'from-amber-600/20 to-brown-500/10',
    accent: 'text-amber-500',
    bgAccent: 'bg-amber-600/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Practices', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'games_30d', label: 'Games', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'game' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'strength_30d', label: 'Strength Sessions', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'strength_session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'calories_7d', label: 'Calories', type: 'calories', timeframe: '7d', sources: { wearableTypes: ['calories'], manualEventType: 'calories' }, formatter: 'kcal', computeRule: 'sum' }
  ],
  milestone: { id: 'season_stats', label: 'Season Stats', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{sessions_7d} practices — game day prep on track', fallback: 'Log your first football practice', primaryMetricId: 'sessions_7d' }
};

export const RUGBY: DisciplineConfig = {
  id: 'rugby',
  name: 'Rugby',
  icon: 'Hexagon',
  theme: {
    gradient: 'from-green-600/20 to-teal-500/10',
    accent: 'text-green-500',
    bgAccent: 'bg-green-600/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Training', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'distance_7d', label: 'Distance', type: 'distance', timeframe: '7d', sources: { wearableTypes: ['distance'], manualEventType: 'distance' }, formatter: 'km', computeRule: 'sum' },
    { id: 'contact_sessions_30d', label: 'Contact Sessions', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'contact_session' }, formatter: 'sessions', computeRule: 'count' }
  ],
  milestone: { id: 'season_stats', label: 'Tries/Tackles', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{distance_7d} km — {contact_sessions_30d} contact sessions', fallback: 'Log your first rugby session', primaryMetricId: 'distance_7d' }
};

export const ICE_HOCKEY: DisciplineConfig = {
  id: 'ice_hockey',
  name: 'Ice Hockey',
  icon: 'Snowflake',
  theme: {
    gradient: 'from-sky-500/20 to-blue-500/10',
    accent: 'text-sky-400',
    bgAccent: 'bg-sky-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Practice', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'games_30d', label: 'Games', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'game' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'ice_time_7d', label: 'Ice Time', type: 'duration', timeframe: '7d', sources: { manualEventType: 'ice_time' }, formatter: 'min', computeRule: 'sum' },
    { id: 'shifts_30d', label: 'Shifts Played', type: 'count', timeframe: '30d', sources: { manualEventType: 'shifts' }, formatter: 'sessions', computeRule: 'sum' }
  ],
  milestone: { id: 'season_stats', label: 'Goals/Assists', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{ice_time_7d} min ice time — {games_30d} games this month', fallback: 'Log your first hockey session', primaryMetricId: 'ice_time_7d' }
};

export const VOLLEYBALL: DisciplineConfig = {
  id: 'volleyball',
  name: 'Volleyball',
  icon: 'Circle',
  theme: {
    gradient: 'from-yellow-500/20 to-gold-500/10',
    accent: 'text-yellow-400',
    bgAccent: 'bg-yellow-500/10'
  },
  metrics: [
    { id: 'sessions_7d', label: 'Training', type: 'sessions', timeframe: '7d', sources: { manualEventType: 'session' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'matches_30d', label: 'Matches', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'match' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'sets_played_30d', label: 'Sets Played', type: 'count', timeframe: '30d', sources: { manualEventType: 'sets_played' }, formatter: 'sessions', computeRule: 'sum' },
    { id: 'jumps_7d', label: 'Jump Count', type: 'count', timeframe: '7d', sources: { manualEventType: 'jumps' }, formatter: 'sessions', computeRule: 'sum' }
  ],
  milestone: { id: 'season_stats', label: 'Kills/Blocks/Digs', type: 'achievement', eventType: 'season_record', displayRule: 'latest' },
  highlight: { template: '{sets_played_30d} sets — vertical power building', fallback: 'Log your first volleyball session', primaryMetricId: 'sets_played_30d' }
};

// ============================================
// OTHER SPORTS
// ============================================

export const GOLF: DisciplineConfig = {
  id: 'golf',
  name: 'Golf',
  icon: 'Flag',
  theme: {
    gradient: 'from-green-500/20 to-emerald-500/10',
    accent: 'text-green-400',
    bgAccent: 'bg-green-500/10'
  },
  metrics: [
    { id: 'rounds_30d', label: 'Rounds', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'round' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'practice_30d', label: 'Practice', type: 'sessions', timeframe: '30d', sources: { manualEventType: 'practice' }, formatter: 'sessions', computeRule: 'count' },
    { id: 'best_score_90d', label: 'Best Score', type: 'count', timeframe: '90d', sources: { manualEventType: 'round_score' }, formatter: 'sessions', computeRule: 'max' },
    { id: 'distance_walked_30d', label: 'Distance Walked', type: 'distance', timeframe: '30d', sources: { wearableTypes: ['distance'], manualEventType: 'distance' }, formatter: 'km', computeRule: 'sum' }
  ],
  milestone: { id: 'handicap', label: 'Handicap', type: 'rank', eventType: 'handicap_update', displayRule: 'latest' },
  highlight: { template: '{rounds_30d} rounds this month — short game sharpening', fallback: 'Log your first round', primaryMetricId: 'rounds_30d' }
};

// ============================================
// CATALOG REGISTRY
// ============================================

export const DISCIPLINE_CATALOG: Record<string, DisciplineConfig> = {
  // Combat Sports
  boxing: BOXING,
  mma: MMA,
  muay_thai: MUAY_THAI,
  kickboxing: KICKBOXING,
  karate: KARATE,
  bjj: BJJ,
  // Endurance Sports
  running: RUNNING,
  swimming: SWIMMING,
  cycling: CYCLING,
  triathlon: TRIATHLON,
  spartan_race: SPARTAN_RACE,
  // Strength Sports
  powerlifting: POWERLIFTING,
  bodybuilding: BODYBUILDING,
  crossfit: CROSSFIT,
  calisthenics: CALISTHENICS,
  // Racket Sports
  tennis: TENNIS,
  badminton: BADMINTON,
  squash: SQUASH,
  table_tennis: TABLE_TENNIS,
  padel: PADEL,
  // Team Sports
  football: FOOTBALL,
  basketball: BASKETBALL,
  american_football: AMERICAN_FOOTBALL,
  rugby: RUGBY,
  ice_hockey: ICE_HOCKEY,
  volleyball: VOLLEYBALL,
  // Other Sports
  golf: GOLF,
};

export const DISCIPLINE_LIST = Object.values(DISCIPLINE_CATALOG);

export function getDisciplineConfig(disciplineId: string): DisciplineConfig | null {
  return DISCIPLINE_CATALOG[disciplineId] || null;
}

// Categories for UI grouping
export const DISCIPLINE_CATEGORIES = {
  combat: ['boxing', 'mma', 'muay_thai', 'kickboxing', 'karate', 'bjj'],
  endurance: ['running', 'swimming', 'cycling', 'triathlon', 'spartan_race'],
  strength: ['powerlifting', 'bodybuilding', 'crossfit', 'calisthenics'],
  racket: ['tennis', 'badminton', 'squash', 'table_tennis', 'padel'],
  team: ['football', 'basketball', 'american_football', 'rugby', 'ice_hockey', 'volleyball'],
  other: ['golf'],
};
