import { useTranslation } from "react-i18next";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSessionsWidgetProps {
  sessionsThisWeek: number;
  isLoading?: boolean;
}

export function StatsSessionsWidget({ sessionsThisWeek, isLoading }: StatsSessionsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <Card variant="glass" className="p-6 hover:shadow-float transition-all h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Calendar className="w-7 h-7 text-accent" />
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {t("stats.thisWeek")}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
      ) : (
        <p className="text-3xl font-display font-bold text-foreground">{sessionsThisWeek}</p>
      )}
      <p className="text-sm text-muted-foreground">{t("stats.sessionsScheduled")}</p>
    </Card>
  );
}
