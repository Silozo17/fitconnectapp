import { useTranslation } from "react-i18next";
import { Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsClientsWidgetProps {
  activeClients: number;
  isLoading?: boolean;
}

export function StatsClientsWidget({ activeClients, isLoading }: StatsClientsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <Card variant="glass" className="p-6 hover:shadow-float transition-all h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-primary" />
        </div>
        {!isLoading && activeClients > 0 && (
          <span className="text-xs text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {t("stats.active")}
          </span>
        )}
      </div>
      {isLoading ? (
        <Skeleton className="h-9 w-16 mb-1 rounded-xl" />
      ) : (
        <p className="text-3xl font-display font-bold text-foreground">{activeClients}</p>
      )}
      <p className="text-sm text-muted-foreground">{t("stats.activeClients")}</p>
    </Card>
  );
}
