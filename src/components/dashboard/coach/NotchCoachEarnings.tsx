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
    <button onClick={handleClick} className="w-full glass-subtle p-3 rounded-xl text-left hover:bg-accent/10 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-primary" />
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
