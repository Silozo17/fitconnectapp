import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSessionsWidgetProps {
  sessionsThisWeek: number;
  isLoading?: boolean;
}

export function StatsSessionsWidget({ sessionsThisWeek, isLoading }: StatsSessionsWidgetProps) {
  const { t } = useTranslation("coach");

  if (isLoading) {
    return <Skeleton className="h-[120px] w-full rounded-2xl" />;
  }

  return (
    <MetricCard
      icon={Calendar}
      label={t("stats.sessionsScheduled")}
      value={sessionsThisWeek}
      color="blue"
      size="default"
      description={t("stats.thisWeek")}
    />
  );
}
