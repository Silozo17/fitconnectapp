import { Award, Video, Users, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  className?: string;
}

function StatItem({ icon, label, value, highlight, className }: StatItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/50",
        highlight && "bg-primary/5 border-primary/20",
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg",
        highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{value}</span>
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
  const stats: (StatItemProps & { show: boolean })[] = [
    {
      icon: <Award className="h-5 w-5" />,
      label: "Experience",
      value: experienceYears ? `${experienceYears} years` : "New Coach",
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
