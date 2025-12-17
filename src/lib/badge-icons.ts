import {
  FileEdit,
  BadgeCheck,
  UserPlus,
  Dumbbell,
  Star,
  CircleDollarSign,
  TrendingUp,
  Rocket,
  Medal,
  ShieldCheck,
  ThumbsUp,
  Sparkles,
  Gem,
  Award,
  Crown,
  Trophy,
  LucideIcon,
  HelpCircle,
} from "lucide-react";

// Map badge icon names stored in DB to actual Lucide components
export const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  FileEdit,
  BadgeCheck,
  UserPlus,
  Dumbbell,
  Star,
  MessageSquareStar: Star, // Alias since MessageSquareStar doesn't exist
  CircleDollarSign,
  TrendingUp,
  Rocket,
  Medal,
  ShieldCheck,
  ThumbsUp,
  Sparkles,
  Gem,
  Award,
  Crown,
  Trophy,
};

export function getBadgeIcon(iconName: string): LucideIcon {
  return BADGE_ICON_MAP[iconName] || HelpCircle;
}
