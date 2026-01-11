import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsClientsWidgetProps {
  activeClients: number;
  isLoading?: boolean;
}

export const StatsClientsWidget = memo(function StatsClientsWidget({ activeClients, isLoading }: StatsClientsWidgetProps) {
  const { t } = useTranslation("coach");

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-2xl" />;
  }

  return (
    <MetricCard
      icon={Users}
      label={t("stats.activeClients")}
      value={activeClients}
      color="primary"
      size="default"
    />
  );
});
