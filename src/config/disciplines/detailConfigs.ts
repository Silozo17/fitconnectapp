/**
 * Sport-Specific Detail Configurations
 * Defines proper logging fields for each discipline
 */

import { DisciplineDetailConfig, BeltConfig } from './types';

// ============================================
// BELT CONFIGURATIONS
// ============================================

export const BJJ_BELT_CONFIG: BeltConfig = {
  belts: [
    { id: 'white', name: 'White', color: 'bg-white border border-gray-300', textColor: 'text-gray-900', maxStripes: 4 },
    { id: 'blue', name: 'Blue', color: 'bg-blue-600', textColor: 'text-white', maxStripes: 4 },
    { id: 'purple', name: 'Purple', color: 'bg-purple-600', textColor: 'text-white', maxStripes: 4 },
    { id: 'brown', name: 'Brown', color: 'bg-amber-800', textColor: 'text-white', maxStripes: 4 },
    { id: 'black', name: 'Black', color: 'bg-black', textColor: 'text-white', maxStripes: 6 }, // Black has degrees
    { id: 'red_black', name: 'Red/Black (Coral)', color: 'bg-gradient-to-r from-red-600 to-black', textColor: 'text-white', maxStripes: 0 },
    { id: 'red', name: 'Red', color: 'bg-red-600', textColor: 'text-white', maxStripes: 0 },
  ],
  stripeColor: 'white',
};

export const KARATE_BELT_CONFIG: BeltConfig = {
  belts: [
    { id: 'white', name: 'White (10th Kyu)', color: 'bg-white border border-gray-300', textColor: 'text-gray-900', maxStripes: 0 },
    { id: 'yellow', name: 'Yellow (9th-8th Kyu)', color: 'bg-yellow-400', textColor: 'text-gray-900', maxStripes: 2 },
    { id: 'orange', name: 'Orange (7th-6th Kyu)', color: 'bg-orange-500', textColor: 'text-white', maxStripes: 2 },
    { id: 'green', name: 'Green (5th-4th Kyu)', color: 'bg-green-600', textColor: 'text-white', maxStripes: 2 },
    { id: 'blue', name: 'Blue (3rd Kyu)', color: 'bg-blue-600', textColor: 'text-white', maxStripes: 0 },
    { id: 'brown', name: 'Brown (2nd-1st Kyu)', color: 'bg-amber-800', textColor: 'text-white', maxStripes: 2 },
    { id: 'black_1', name: 'Black 1st Dan', color: 'bg-black', textColor: 'text-white', maxStripes: 0 },
    { id: 'black_2', name: 'Black 2nd Dan', color: 'bg-black', textColor: 'text-white', maxStripes: 0 },
    { id: 'black_3', name: 'Black 3rd Dan', color: 'bg-black', textColor: 'text-white', maxStripes: 0 },
    { id: 'black_4', name: 'Black 4th Dan', color: 'bg-black', textColor: 'text-white', maxStripes: 0 },
    { id: 'black_5', name: 'Black 5th Dan+', color: 'bg-black', textColor: 'text-white', maxStripes: 0 },
  ],
  stripeColor: 'black',
};

// ============================================
// DISCIPLINE DETAIL CONFIGS
// ============================================

export const DISCIPLINE_DETAIL_CONFIGS: Record<string, DisciplineDetailConfig> = {
  // ===========================================
  // COMBAT SPORTS - BELT SYSTEMS
  // ===========================================
  bjj: {
    milestoneFields: [
      {
        id: 'current_belt',
        label: 'Current Belt',
        type: 'belt_with_stripes',
        options: BJJ_BELT_CONFIG,
      },
    ],
    additionalLogFields: [
      { id: 'gi_nogi', label: 'Session Type', type: 'dropdown', options: { choices: ['Gi', 'No-Gi', 'Both'] } },
      { id: 'competition_wins', label: 'Competition Wins', type: 'number', options: { unit: 'wins' } },
    ],
  },

  karate: {
    milestoneFields: [
      {
        id: 'current_belt',
        label: 'Current Belt/Rank',
        type: 'belt_with_stripes',
        options: KARATE_BELT_CONFIG,
      },
    ],
    additionalLogFields: [
      { id: 'kata_name', label: 'Kata Practiced', type: 'dropdown', options: { choices: ['Heian Shodan', 'Heian Nidan', 'Heian Sandan', 'Heian Yondan', 'Heian Godan', 'Tekki Shodan', 'Bassai Dai', 'Other'] } },
    ],
  },

  // ===========================================
  // COMBAT SPORTS - FIGHT RECORDS
  // ===========================================
  boxing: {
    milestoneFields: [
      { id: 'fight_record', label: 'Fight Record', type: 'fight_record', options: { fields: ['wins', 'losses', 'draws', 'ko_wins', 'ko_losses'] } },
      { id: 'first_bout', label: 'First Bout Date', type: 'event_date' },
    ],
    additionalLogFields: [
      { id: 'weight_class', label: 'Weight Class', type: 'dropdown', options: { choices: ['Minimumweight', 'Light Flyweight', 'Flyweight', 'Super Flyweight', 'Bantamweight', 'Super Bantamweight', 'Featherweight', 'Super Featherweight', 'Lightweight', 'Super Lightweight', 'Welterweight', 'Super Welterweight', 'Middleweight', 'Super Middleweight', 'Light Heavyweight', 'Cruiserweight', 'Heavyweight'] } },
    ],
  },

  mma: {
    milestoneFields: [
      { id: 'fight_record', label: 'Fight Record', type: 'fight_record', options: { fields: ['wins', 'losses', 'draws', 'ko_wins', 'submission_wins'] } },
      { id: 'first_fight', label: 'First Fight Date', type: 'event_date' },
    ],
    additionalLogFields: [
      { id: 'weight_class', label: 'Weight Class', type: 'dropdown', options: { choices: ['Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight'] } },
      { id: 'training_focus', label: 'Training Focus', type: 'dropdown', options: { choices: ['Striking', 'Wrestling', 'BJJ', 'Conditioning', 'Mixed'] } },
    ],
  },

  muay_thai: {
    milestoneFields: [
      { id: 'fight_record', label: 'Fight Record', type: 'fight_record', options: { fields: ['wins', 'losses', 'draws', 'ko_wins'] } },
      { id: 'first_fight', label: 'First Fight Date', type: 'event_date' },
      { id: 'prajiad_level', label: 'Prajiad Level', type: 'dropdown', options: { choices: ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Red', 'Brown', 'Black'] } },
    ],
  },

  kickboxing: {
    milestoneFields: [
      { id: 'fight_record', label: 'Fight Record', type: 'fight_record', options: { fields: ['wins', 'losses', 'draws', 'ko_wins'] } },
      { id: 'first_competition', label: 'First Competition Date', type: 'event_date' },
    ],
    additionalLogFields: [
      { id: 'style', label: 'Style', type: 'dropdown', options: { choices: ['K-1 Rules', 'American Kickboxing', 'Dutch Style', 'Glory Rules', 'Other'] } },
    ],
  },

  // ===========================================
  // ENDURANCE SPORTS - RACE TIMES
  // ===========================================
  running: {
    milestoneFields: [
      { id: '5k_pb', label: '5K Personal Best', type: 'race_time', options: { format: 'mm:ss' } },
      { id: '10k_pb', label: '10K Personal Best', type: 'race_time', options: { format: 'mm:ss' } },
      { id: 'half_marathon_pb', label: 'Half Marathon PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'marathon_pb', label: 'Marathon PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
    ],
    additionalLogFields: [
      { id: 'terrain', label: 'Terrain', type: 'dropdown', options: { choices: ['Road', 'Trail', 'Track', 'Treadmill'] } },
    ],
  },

  swimming: {
    milestoneFields: [
      { id: '100m_pb', label: '100m Freestyle PB', type: 'race_time', options: { format: 'mm:ss.ms' } },
      { id: '200m_pb', label: '200m Freestyle PB', type: 'race_time', options: { format: 'mm:ss.ms' } },
      { id: 'longest_swim', label: 'Longest Continuous Swim', type: 'pb_weight', options: { unit: 'm' } },
    ],
    additionalLogFields: [
      { id: 'stroke', label: 'Primary Stroke', type: 'dropdown', options: { choices: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM'] } },
      { id: 'pool_type', label: 'Pool Type', type: 'dropdown', options: { choices: ['25m Pool', '50m Pool', 'Open Water'] } },
    ],
  },

  cycling: {
    milestoneFields: [
      { id: '20km_tt', label: '20km Time Trial PB', type: 'race_time', options: { format: 'mm:ss' } },
      { id: '40km_tt', label: '40km Time Trial PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'ftp', label: 'FTP (Functional Threshold Power)', type: 'pb_weight', options: { unit: 'W' } },
    ],
    additionalLogFields: [
      { id: 'bike_type', label: 'Bike Type', type: 'dropdown', options: { choices: ['Road', 'TT/Triathlon', 'Gravel', 'Mountain', 'Indoor/Trainer'] } },
    ],
  },

  triathlon: {
    milestoneFields: [
      { id: 'sprint_pb', label: 'Sprint Tri PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'olympic_pb', label: 'Olympic Tri PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'half_ironman_pb', label: '70.3 PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'ironman_pb', label: 'Ironman PB', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'next_race', label: 'Next Race', type: 'event_date' },
    ],
  },

  // ===========================================
  // STRENGTH SPORTS - PB TRACKING
  // ===========================================
  powerlifting: {
    milestoneFields: [
      { id: 'squat_pb', label: 'Squat 1RM', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'bench_pb', label: 'Bench 1RM', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'deadlift_pb', label: 'Deadlift 1RM', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'weight_class', label: 'Weight Class', type: 'dropdown', options: { choices: ['52kg', '56kg', '60kg', '67.5kg', '75kg', '82.5kg', '90kg', '100kg', '110kg', '125kg', '140kg', '140kg+'] } },
    ],
    additionalLogFields: [
      { id: 'federation', label: 'Federation', type: 'dropdown', options: { choices: ['IPF', 'USAPL', 'GBPF', 'IPL', 'WRPF', 'Other'] } },
      { id: 'equipped', label: 'Equipment', type: 'dropdown', options: { choices: ['Raw', 'Classic Raw', 'Single-Ply', 'Multi-Ply'] } },
    ],
  },

  bodybuilding: {
    milestoneFields: [
      { id: 'stage_weight', label: 'Stage Weight', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'off_season_weight', label: 'Off-Season Weight', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'division', label: 'Division', type: 'dropdown', options: { choices: ['Classic Physique', "Men's Physique", 'Bodybuilding', 'Bikini', 'Figure', 'Wellness', "Women's Physique"] } },
      { id: 'last_show', label: 'Last Competition', type: 'event_date' },
    ],
    additionalLogFields: [
      { id: 'federation', label: 'Federation', type: 'dropdown', options: { choices: ['IFBB Pro', 'NPC', 'UKBFF', 'WBFF', 'OCB', 'Other'] } },
    ],
  },

  crossfit: {
    milestoneFields: [
      { id: 'fran_time', label: 'Fran Time', type: 'benchmark_time', options: { format: 'mm:ss' } },
      { id: 'grace_time', label: 'Grace Time', type: 'benchmark_time', options: { format: 'mm:ss' } },
      { id: 'murph_time', label: 'Murph Time', type: 'benchmark_time', options: { format: 'mm:ss' } },
      { id: 'clean_jerk_pb', label: 'Clean & Jerk 1RM', type: 'pb_weight', options: { unit: 'kg' } },
      { id: 'snatch_pb', label: 'Snatch 1RM', type: 'pb_weight', options: { unit: 'kg' } },
    ],
    additionalLogFields: [
      { id: 'rx_scaled', label: 'WOD Type', type: 'dropdown', options: { choices: ['Rx', 'Scaled', 'Rx+'] } },
    ],
  },

  calisthenics: {
    milestoneFields: [
      {
        id: 'skills_unlocked',
        label: 'Skills Unlocked',
        type: 'skill_checklist',
        options: {
          skills: [
            'Muscle Up',
            'Front Lever',
            'Back Lever',
            'Planche (Tuck)',
            'Planche (Straddle)',
            'Full Planche',
            'Human Flag',
            'One Arm Pull-up',
            'One Arm Push-up',
            'Handstand Push-up',
            'Free Handstand (30s+)',
            'L-Sit (30s+)',
            '360 Pull-up',
            'Victorian',
            'Iron Cross',
            'Maltese',
          ],
        },
      },
      { id: 'max_pullups', label: 'Max Pull-ups', type: 'pb_weight', options: { unit: 'reps' } },
      { id: 'max_pushups', label: 'Max Push-ups', type: 'pb_weight', options: { unit: 'reps' } },
      { id: 'max_dips', label: 'Max Dips', type: 'pb_weight', options: { unit: 'reps' } },
    ],
  },

  spartan_race: {
    milestoneFields: [
      { id: 'trifecta_status', label: 'Trifecta Status', type: 'dropdown', options: { choices: ['None', 'Sprint Complete', 'Super Complete', 'Beast Complete', 'Trifecta Complete', 'Double Trifecta', 'Triple Trifecta'] } },
      { id: 'best_sprint', label: 'Best Sprint Time', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'best_super', label: 'Best Super Time', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'best_beast', label: 'Best Beast Time', type: 'race_time', options: { format: 'hh:mm:ss' } },
      { id: 'next_event', label: 'Next Event', type: 'event_date' },
    ],
    additionalLogFields: [
      { id: 'age_group', label: 'Age Group', type: 'dropdown', options: { choices: ['Elite', 'Age Group', 'Open'] } },
    ],
  },
};

// Get detail config for a discipline, with fallback
export function getDisciplineDetailConfig(disciplineId: string): DisciplineDetailConfig | null {
  return DISCIPLINE_DETAIL_CONFIGS[disciplineId] || null;
}
