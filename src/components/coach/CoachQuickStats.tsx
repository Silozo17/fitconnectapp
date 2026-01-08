import { Award, Video, Users, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY_CONFIG, Rarity } from "@/lib/avatar-utils";
import { useTranslation } from "@/hooks/useTranslation";

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
        "flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/30 transition-all duration-200 hover:scale-[1.02]",
        highlight && !rarity && "border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.15)]",
        rarity && rarityConfig?.border,
        rarity === 'legendary' && "shadow-[0_0_16px_hsl(var(--primary)/0.4)] border-primary/40",
        rarity === 'epic' && "shadow-[0_0_12px_hsl(280_100%_70%/0.3)] border-purple-500/30",
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl",
        highlight && !rarity ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground",
        rarity && rarityConfig?.bg,
        rarity && rarityConfig?.color
      )}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-bold text-foreground",
          rarity && rarityConfig?.color
        )}>{value}</span>
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</span>
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
  const { t } = useTranslation('coaches');
  const experienceRarity = getExperienceRarity(experienceYears);
  
  const stats: (StatItemProps & { show: boolean })[] = [
    {
      icon: <Award className="h-5 w-5" />,
      label: t('profile.experience'),
      value: experienceYears ? t('profile.years', { count: experienceYears }) : t('profile.newCoach'),
      rarity: experienceRarity,
      show: true,
    },
    {
      icon: <Video className="h-5 w-5" />,
      label: t('profile.onlineSessions'),
      value: onlineAvailable ? t('profile.available') : t('profile.notAvailable'),
      highlight: !!onlineAvailable,
      show: true,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: t('profile.inPersonSessions'),
      value: inPersonAvailable ? t('profile.available') : t('profile.notAvailable'),
      highlight: !!inPersonAvailable,
      show: true,
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: t('profile.reviews'),
      value: reviewCount > 0 ? `${averageRating.toFixed(1)} (${reviewCount})` : t('profile.noReviewsYet'),
      highlight: reviewCount > 0 && averageRating >= 4.5,
      show: true,
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: t('profile.responseTime'),
      value: t('profile.within24h'),
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