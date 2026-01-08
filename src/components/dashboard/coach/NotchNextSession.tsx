import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCoachDashboardStats } from "@/hooks/useCoachDashboardStats";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { cn } from "@/lib/utils";

const NotchNextSession = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/coach/schedule");
  };
  const { t } = useTranslation("coach");
  const { data, isLoading } = useCoachDashboardStats();

  const nextSession = data?.upcomingSessions?.[0];

  if (isLoading) {
    return (
      <div className="p-3 rounded-2xl animate-pulse bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="h-5 w-24 bg-muted rounded" />
      </div>
    );
  }

  if (!nextSession) {
    return (
      <button onClick={handleClick} className="w-full p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shadow-inner">
            <Calendar className="w-5 h-5 text-cyan-500" />
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
            {t("dashboard.nextSession", "Next Session")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.noUpcoming", "No sessions scheduled")}
        </p>
      </button>
    );
  }

  return (
    <button onClick={handleClick} className="w-full p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-cyan-500/20 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shadow-inner">
          <Clock className="w-5 h-5 text-cyan-500" />
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {t("dashboard.nextSession", "Next Session")}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6 border border-border/30">
          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-medium">
            {nextSession.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {nextSession.client}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {nextSession.time}
          </p>
        </div>
      </div>
      
      <div className="mt-1">
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500"
        )}>
          {nextSession.type}
        </span>
      </div>
    </button>
  );
};

export default NotchNextSession;
