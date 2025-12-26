import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Award,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar, getAvatarImageUrl } from "@/hooks/useAvatars";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { cn } from "@/lib/utils";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";

const CoachProfileSummary = () => {
  const { t } = useTranslation(["coach", "common"]);
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { profile } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');
  const { data: coachProfile } = useCoachProfile();
  const { data, isLoading } = useCoachDashboardStats();
  
  const stats = data?.stats;

  const displayName = profile?.display_name || profile?.first_name || t("common:profile.coach");
  const avatarUrl = selectedAvatar ? getAvatarImageUrl(selectedAvatar.slug) : (coachProfile?.profile_image_url || profile?.avatar_url);
  const initials = displayName?.slice(0, 2).toUpperCase() || "C";
  const subscriptionTier = coachProfile?.subscription_tier || "free";
  const isVerified = coachProfile?.is_verified;

  // Profile completion
  const profileCompletion = coachProfile ? calculateProfileCompletion(coachProfile) : 0;

  const handleNavigate = (path: string) => {
    close();
    navigate(path);
  };

  const statItems = [
    {
      icon: Users,
      label: t("coach:dashboard.activeClients", "Active Clients"),
      value: stats?.activeClients || 0,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Calendar,
      label: t("coach:dashboard.sessionsThisWeek", "Sessions"),
      value: stats?.sessionsThisWeek || 0,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: Star,
      label: t("coach:dashboard.rating", "Rating"),
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "-",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: MessageSquare,
      label: t("coach:dashboard.unreadMessages", "Unread"),
      value: 0, // TODO: Add unread messages to stats
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: TrendingUp,
      label: t("coach:dashboard.pendingLeads", "Leads"),
      value: 0, // TODO: Add leads to stats
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Award,
      label: t("coach:dashboard.reviews", "Reviews"),
      value: stats?.totalReviews || 0,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Avatar and Name Section */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {displayName}
            </h2>
            {isVerified && (
              <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px]">
                ✓ Verified
              </Badge>
            )}
          </div>
          
          {/* Tier Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "mt-1 text-xs capitalize",
              subscriptionTier === "pro" && "border-primary/50 text-primary",
              subscriptionTier === "enterprise" && "border-yellow-500/50 text-yellow-500"
            )}
          >
            {subscriptionTier} {t("common:profile.plan", "Plan")}
          </Badge>
          
          {/* Profile Completion */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">
                {t("coach:profile.completion", "Profile")}
              </span>
              <span className="text-xs font-medium text-primary">{profileCompletion}%</span>
            </div>
            <Progress 
              value={profileCompletion} 
              className="h-1.5 bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid - 3x2 layout */}
      <div className="grid grid-cols-3 gap-2 flex-1 mb-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "glass-subtle flex flex-col items-center justify-center py-3 px-2",
                isLoading && "animate-pulse"
              )}
            >
              <div className={cn("p-1.5 rounded-lg mb-1", item.bgColor)}>
                <Icon className={cn("w-4 h-4", item.color)} />
              </div>
              <span className="text-lg font-bold text-foreground">
                {isLoading ? "-" : item.value}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40"
          onClick={() => handleNavigate("/dashboard/coach/settings")}
        >
          {t("common:profile.viewProfile", "View Profile")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          className="flex-1 glass-interactive border-border/30 hover:border-primary/40"
          onClick={() => handleNavigate("/dashboard/coach/clients")}
        >
          {t("coach:dashboard.manageClients", "Clients")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// Helper function to calculate profile completion
function calculateProfileCompletion(profile: any): number {
  const fields = [
    'display_name',
    'bio',
    'profile_image_url',
    'coach_types',
    'location',
    'hourly_rate',
    'certifications'
  ];
  
  const completed = fields.filter(field => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;
  
  return Math.round((completed / fields.length) * 100);
}

export default CoachProfileSummary;
