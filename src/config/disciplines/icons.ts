/**
 * Centralized discipline icon mapping
 * Maps discipline IDs to Lucide icon components
 */

import {
  Swords,
  Octagon,
  Target,
  Zap,
  Hand,
  Shield,
  Footprints,
  Waves,
  Bike,
  Medal,
  Dumbbell,
  UserCircle,
  Flame,
  CircleDot,
  Mountain,
  Award,
  Timer,
  TrendingUp,
  Calendar,
  Trophy,
  LucideIcon,
} from "lucide-react";

// Discipline-specific icons
export const DISCIPLINE_ICONS: Record<string, LucideIcon> = {
  // Combat sports
  boxing: Swords,
  mma: Octagon,
  muay_thai: Target,
  kickboxing: Zap,
  karate: Hand,
  bjj: Shield,
  
  // Endurance sports
  running: Footprints,
  swimming: Waves,
  cycling: Bike,
  triathlon: Medal,
  
  // Strength sports
  powerlifting: Dumbbell,
  bodybuilding: UserCircle,
  crossfit: Flame,
  calisthenics: CircleDot,
  spartan_race: Mountain,
};

// Milestone type icons
export const MILESTONE_ICONS: Record<string, LucideIcon> = {
  belt: Award,
  fightRecord: Swords,
  raceTime: Timer,
  pb: TrendingUp,
  date: Calendar,
  achievement: Trophy,
  rank: Medal,
};

// Get icon for a discipline, with fallback
export function getDisciplineIcon(disciplineId: string): LucideIcon {
  return DISCIPLINE_ICONS[disciplineId] || Dumbbell;
}

// Get icon for a milestone type, with fallback
export function getMilestoneIcon(milestoneType: string): LucideIcon {
  return MILESTONE_ICONS[milestoneType] || Trophy;
}
