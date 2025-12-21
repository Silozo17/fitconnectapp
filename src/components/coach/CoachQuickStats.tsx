import { Award, Video, Users, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG, Rarity } from "@/lib/avatar-utils";

interface CoachQuickStatsProps {
  experienceYears: number | null;
  onlineAvailable: boolean | null;
  inPersonAvailable: boolean | null;
  reviewCount: number;
  averageRating: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  rarity?: Rarity;
  className?: string;
}

function getExperienceRarity(years: number | null): Rarity {
  if (!years || years < 2) return 'common';
  if (years <= 4) return 'uncommon';
  if (years <= 9) return 'rare';
  if (years <= 19) return 'epic';
  return 'legendary';
}

function StatItem({ icon, label, value, highlight, rarity, className }: StatItemProps) {
  const rarityConfig = rarity ? RARITY_CONFIG[rarity] : null;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/50",
        highlight && !rarity && "bg-primary/5 border-primary/20",
        rarity && rarityConfig?.bg,
        rarity && rarityConfig?.border,
        rarity === 'legendary' && "shadow-[0_0_12px_hsl(var(--primary)/0.3)]",
        rarity === 'epic' && "shadow-[0_0_8px_hsl(280_100%_70%/0.2)]",
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg",
        highlight && !rarity ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        rarity && rarityConfig?.bg,
        rarity && rarityConfig?.color
      )}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-semibold text-foreground",
          rarity && rarityConfig?.color
        )}>{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function CoachQuickStats({
  experienceYears,
  onlineAvailable,
  inPersonAvailable,
  reviewCount,
  averageRating,
}: CoachQuickStatsProps) {
  const experienceRarity = getExperienceRarity(experienceYears);
  
  const stats: (StatItemProps & { show: boolean })[] = [
    {
      icon: <Award className="h-5 w-5" />,
      label: "Experience",
      value: experienceYears ? `${experienceYears} years` : "New Coach",
      rarity: experienceRarity,
      show: true,
    },
    {
      icon: <Video className="h-5 w-5" />,
      label: "Online Sessions",
      value: onlineAvailable ? "Available" : "Not Available",
      highlight: !!onlineAvailable,
      show: true,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "In-Person",
      value: inPersonAvailable ? "Available" : "Not Available",
      highlight: !!inPersonAvailable,
      show: true,
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "Reviews",
      value: reviewCount > 0 ? `${averageRating.toFixed(1)} (${reviewCount})` : "No reviews yet",
      highlight: reviewCount > 0 && averageRating >= 4.5,
      show: true,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Response Time",
      value: "Within 24h",
      show: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.filter(s => s.show).map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
}
