import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useCoachEarnings, useCoachProfile } from "@/hooks/useCoachEarnings";
import { useProfilePanel } from "@/contexts/ProfilePanelContext";
import { cn } from "@/lib/utils";

const NotchCoachEarnings = () => {
  const navigate = useNavigate();
  const { close } = useProfilePanel();
  
  const handleClick = () => {
    close();
    navigate("/dashboard/coach/earnings");
  };
  const { t } = useTranslation("coach");
  const { data: coachProfile } = useCoachProfile();
  const { stats, isLoading } = useCoachEarnings(coachProfile?.id || null, "month");

  const currency = coachProfile?.currency || "GBP";
  const currencySymbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";

  if (isLoading) {
    return (
      <div className="glass-subtle p-3 rounded-xl animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-muted" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
        <div className="h-6 w-20 bg-muted rounded" />
      </div>
    );
  }

  const netRevenue = stats?.netRevenue || 0;
  const revenueChange = stats?.revenueChange || 0;
  const isPositive = revenueChange >= 0;

  return (
    <button onClick={handleClick} className="w-full p-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-primary/20 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shadow-inner">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
          {t("dashboard.earnings", "Earnings")}
        </span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground">
          {currencySymbol}{netRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
        {revenueChange !== 0 && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-medium",
            isPositive ? "text-emerald-500" : "text-rose-500"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{isPositive ? "+" : ""}{revenueChange}%</span>
          </div>
        )}
      </div>
      
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {t("dashboard.thisMonth", "This month")}
      </p>
    </button>
  );
};

export default NotchCoachEarnings;
