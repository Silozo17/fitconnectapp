import {
  Dumbbell,
  Salad,
  Swords,
  Shield,
  Flower2,
  Heart,
  Star,
  Activity,
  Target,
  Zap,
  Trophy,
  Users,
  Footprints,
  Wind,
  Hand,
  Brain,
  Sparkles,
  Medal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CoachTypeCategory {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface CoachType {
  id: string;
  label: string;
  category: string;
  icon: LucideIcon;
}

export const COACH_TYPE_CATEGORIES: CoachTypeCategory[] = [
  { id: "combat", label: "Combat Sports", icon: Swords },
  { id: "fitness", label: "Fitness & Strength", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Salad },
  { id: "mindBody", label: "Mind-Body", icon: Flower2 },
  { id: "therapy", label: "Therapy & Recovery", icon: Heart },
  { id: "specialist", label: "Specialist", icon: Star },
];

export const COACH_TYPES: CoachType[] = [
  // Combat Sports
  { id: "boxing", label: "Boxing", category: "combat", icon: Swords },
  { id: "mma", label: "MMA", category: "combat", icon: Shield },
  { id: "jiu_jitsu", label: "Jiu Jitsu", category: "combat", icon: Shield },
  { id: "karate", label: "Karate", category: "combat", icon: Hand },
  { id: "muay_thai", label: "Muay Thai", category: "combat", icon: Swords },
  { id: "kickboxing", label: "Kickboxing", category: "combat", icon: Zap },
  { id: "wrestling", label: "Wrestling", category: "combat", icon: Users },

  // Fitness & Strength
  { id: "personal_training", label: "Personal Training", category: "fitness", icon: Dumbbell },
  { id: "strength_conditioning", label: "Strength & Conditioning", category: "fitness", icon: Activity },
  { id: "strength_training", label: "Strength Training", category: "fitness", icon: Dumbbell },
  { id: "bodybuilding", label: "Bodybuilding", category: "fitness", icon: Trophy },
  { id: "crossfit", label: "CrossFit", category: "fitness", icon: Zap },
  { id: "hiit", label: "HIIT Training", category: "fitness", icon: Activity },
  { id: "running", label: "Running Coach", category: "fitness", icon: Footprints },
  { id: "swimming", label: "Swimming Coach", category: "fitness", icon: Wind },
  { id: "athletics", label: "Athletics", category: "fitness", icon: Medal },
  { id: "functional_training", label: "Functional Training", category: "fitness", icon: Activity },
  { id: "mobility", label: "Mobility & Flexibility", category: "fitness", icon: Flower2 },
  { id: "calisthenics", label: "Calisthenics", category: "fitness", icon: Dumbbell },

  // Nutrition
  { id: "nutritionist", label: "Nutritionist", category: "nutrition", icon: Salad },
  { id: "dietician", label: "Dietician", category: "nutrition", icon: Salad },
  { id: "sports_nutrition", label: "Sports Nutrition", category: "nutrition", icon: Target },

  // Mind-Body
  { id: "yoga", label: "Yoga", category: "mindBody", icon: Flower2 },
  { id: "pilates", label: "Pilates", category: "mindBody", icon: Flower2 },
  { id: "meditation", label: "Meditation & Mindfulness", category: "mindBody", icon: Brain },
  { id: "nervous_system_regulation", label: "Nervous System Regulation", category: "mindBody", icon: Brain },
  { id: "somatic_work", label: "Somatic Work", category: "mindBody", icon: Heart },
  { id: "breathwork", label: "Breathwork", category: "mindBody", icon: Wind },

  // Therapy & Recovery
  { id: "physio", label: "Physiotherapy", category: "therapy", icon: Heart },
  { id: "osteopath", label: "Osteopath", category: "therapy", icon: Heart },
  { id: "sports_massage", label: "Sports Massage", category: "therapy", icon: Hand },
  { id: "regeneration_recovery", label: "Regeneration & Recovery", category: "therapy", icon: Heart },
  { id: "injury_rehab", label: "Injury Rehabilitation", category: "therapy", icon: Activity },

  // Specialist
  { id: "posing", label: "Posing Coach", category: "specialist", icon: Sparkles },
  { id: "pre_postnatal", label: "Pre/Postnatal Fitness", category: "specialist", icon: Heart },
  { id: "wellness_coaching", label: "Life & Wellness Coaching", category: "specialist", icon: Star },
  { id: "sleep_coaching", label: "Sleep Coaching", category: "specialist", icon: Brain },
];

// Helper to get types by category
export const getCoachTypesByCategory = (categoryId: string): CoachType[] => {
  return COACH_TYPES.filter((type) => type.category === categoryId);
};

// Helper to get a coach type by ID
export const getCoachTypeById = (id: string): CoachType | undefined => {
  return COACH_TYPES.find((type) => type.id === id);
};

// Helper to get coach type label by ID (for display)
export const getCoachTypeLabel = (id: string): string => {
  const type = getCoachTypeById(id);
  return type?.label || id;
};

// Flat list of labels for filters (backwards compatibility)
export const COACH_TYPE_LABELS = COACH_TYPES.map((type) => type.label);

// Map from label to ID (for filter compatibility)
export const COACH_TYPE_LABEL_TO_ID: Record<string, string> = COACH_TYPES.reduce(
  (acc, type) => ({ ...acc, [type.label]: type.id }),
  {}
);

// Map from ID to label
export const COACH_TYPE_ID_TO_LABEL: Record<string, string> = COACH_TYPES.reduce(
  (acc, type) => ({ ...acc, [type.id]: type.label }),
  {}
);

// Helper to get display label for any coach type (handles custom types)
export const getCoachTypeDisplayLabel = (type: string): string => {
  // First check if it's an ID in the predefined list
  const byId = getCoachTypeById(type);
  if (byId) return byId.label;
  
  // Check if it matches a label directly
  const byLabel = COACH_TYPES.find(t => t.label === type);
  if (byLabel) return byLabel.label;
  
  // It's a custom type - clean up the display
  if (type.startsWith("custom_")) {
    return type.replace("custom_", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Return as-is but with title case
  return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};
