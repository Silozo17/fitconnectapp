/**
 * Discipline Widget System - Type Definitions
 * Config-driven architecture for sport-specific widgets
 */

export type MetricType = 
  | 'count' 
  | 'duration' 
  | 'distance' 
  | 'calories' 
  | 'heartRateAvg' 
  | 'volumeKg' 
  | 'pace' 
  | 'rounds' 
  | 'sessions'
  | 'streak'
  | 'time';

export type Timeframe = '7d' | '30d' | '90d' | 'all-time';

export type ComputeRule = 'sum' | 'avg' | 'max' | 'count' | 'streak' | 'latest';

export type MetricFormatter = 
  | 'sessions' 
  | 'rounds' 
  | 'min' 
  | 'km' 
  | 'bpm' 
  | 'kg' 
  | 'kcal'
  | 'weeks'
  | 'pace'
  | 'm'
  | 'sets'
  | 'time';

export type MilestoneType = 
  | 'belt' 
  | 'pb' 
  | 'raceTime' 
  | 'fightRecord' 
  | 'date' 
  | 'rank'
  | 'achievement';

export type DataSource = 'wearable' | 'manual' | 'mixed' | null;

export interface DisciplineMetricConfig {
  id: string;
  label: string;
  type: MetricType;
  timeframe: Timeframe;
  sources: {
    wearableTypes?: string[]; // e.g., ['active_minutes', 'heart_rate']
    manualEventType?: string; // e.g., 'rounds_sparred'
  };
  formatter: MetricFormatter;
  computeRule: ComputeRule;
  computed?: boolean; // If true, metric is derived from other data and should not appear in log modal
}

export interface DisciplineMilestoneConfig {
  id: string;
  label: string;
  type: MilestoneType;
  eventType: string; // e.g., 'belt_awarded', 'pb_recorded'
  displayRule: 'latest' | 'max';
}

export interface DisciplineHighlightConfig {
  template: string; // e.g., "{sessions_7d} sessions this week"
  fallback: string; // "Log your first session to unlock insights"
  primaryMetricId: string;
}

export interface DisciplineTheme {
  gradient: string; // e.g., 'from-red-500/20 to-orange-500/10'
  accent: string;   // e.g., 'text-red-400'
  bgAccent: string; // e.g., 'bg-red-500/10'
}

export interface DisciplineConfig {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  theme: DisciplineTheme;
  metrics: [DisciplineMetricConfig, DisciplineMetricConfig, DisciplineMetricConfig, DisciplineMetricConfig];
  milestone: DisciplineMilestoneConfig;
  highlight: DisciplineHighlightConfig;
}

// Computed metric value with source information
export interface ComputedMetric {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  timeframe: Timeframe;
  source: DataSource;
  formatter: MetricFormatter;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percent: number;
  };
}

// Computed milestone
export interface ComputedMilestone {
  id: string;
  label: string;
  value: string | null;
  type: MilestoneType;
  achievedAt?: string;
}

// Widget data bundle
export interface DisciplineWidgetData {
  config: DisciplineConfig;
  metrics: ComputedMetric[];
  milestone: ComputedMilestone;
  highlight: string;
  isLoading: boolean;
}

// ============================================
// SPORT-SPECIFIC DETAIL TYPES
// ============================================

// Belt system configuration
export interface BeltOption {
  id: string;
  name: string;
  color: string; // Tailwind bg class
  textColor?: string; // Tailwind text class
  maxStripes: number;
}

export interface BeltConfig {
  belts: BeltOption[];
  stripeColor: 'white' | 'black' | 'red';
}

// Sport-specific field types for detail logging
export type DisciplineFieldType = 
  | 'belt_with_stripes'      // BJJ, Karate, Judo
  | 'fight_record'           // Boxing, MMA, Muay Thai, Kickboxing
  | 'race_time'              // Running, Swimming, Cycling, Triathlon
  | 'pb_weight'              // Powerlifting, CrossFit lifts
  | 'benchmark_time'         // CrossFit WODs
  | 'skill_checklist'        // Calisthenics skills
  | 'dropdown'               // Generic dropdown
  | 'event_date'             // Date of achievement
  | 'number';                // Simple number input

export interface DisciplineFieldConfig {
  id: string;
  label: string;
  type: DisciplineFieldType;
  options?: BeltConfig | {
    format?: string;           // 'mm:ss', 'hh:mm:ss', 'mm:ss.ms'
    unit?: string;             // 'kg', 'lbs', 'W', 'reps'
    choices?: string[];        // For dropdowns
    skills?: string[];         // For skill checklists
    fields?: string[];         // For fight records: ['wins', 'losses', 'draws', 'ko_wins']
  };
}

export interface DisciplineDetailConfig {
  milestoneFields: DisciplineFieldConfig[];
  additionalLogFields?: DisciplineFieldConfig[];
}

// Belt value stored in events
export interface BeltValue {
  beltId: string;
  stripes: number;
  achievedAt: string;
}

// Fight record value
export interface FightRecordValue {
  wins: number;
  losses: number;
  draws: number;
  koWins?: number;
  koLosses?: number;
  nc?: number; // no contests
}

// Race time value
export interface RaceTimeValue {
  time: string; // formatted time string
  distance?: string;
  achievedAt: string;
}

// Skill checklist value
export interface SkillChecklistValue {
  skills: Array<{
    skillId: string;
    achieved: boolean;
    achievedAt?: string;
  }>;
}
