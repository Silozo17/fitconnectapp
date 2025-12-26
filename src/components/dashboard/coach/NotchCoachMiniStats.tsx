import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Award 
} from "lucide-react";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { cn } from "@/lib/utils";

const NotchCoachMiniStats = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  const { t } = useTranslation("coach");
  const { data, isLoading } = useCoachDashboardStats();
  
  const stats = data?.stats;

  const handleClick = (route: string) => {
    close();
    navigate(route);
  };

  const statItems = [
    {
      icon: Users,
      value: stats?.activeClients || 0,
      label: t("dashboard.clients", "Clients"),
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/dashboard/coach/clients"
    },
    {
      icon: Calendar,
      value: stats?.sessionsThisWeek || 0,
      label: t("dashboard.sessions", "Sessions"),
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      route: "/dashboard/coach/schedule"
    },
    {
      icon: Star,
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "-",
      label: t("dashboard.rating", "Rating"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      route: "/dashboard/coach/reviews"
    },
    {
      icon: Award,
      value: stats?.totalReviews || 0,
      label: t("dashboard.reviews", "Reviews"),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      route: "/dashboard/coach/reviews"
    },
    {
      icon: TrendingUp,
      value: 0, // TODO: Implement leads count
      label: t("dashboard.leads", "Leads"),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      route: "/dashboard/coach/clients"
    },
    {
      icon: MessageSquare,
      value: 0, // TODO: Implement unread messages
      label: t("dashboard.messages", "Msgs"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      route: "/dashboard/coach/messages"
    }
  ];

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => handleClick(item.route)}
            className={cn(
              "glass-subtle flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-accent/10 transition-colors",
              isLoading && "animate-pulse"
            )}
          >
            <div className={cn("p-1 rounded-md mb-0.5", item.bgColor)}>
              <Icon className={cn("w-3 h-3", item.color)} />
            </div>
            <span className="text-sm font-bold text-foreground">
              {isLoading ? "-" : item.value}
            </span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wide text-center leading-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default NotchCoachMiniStats;
