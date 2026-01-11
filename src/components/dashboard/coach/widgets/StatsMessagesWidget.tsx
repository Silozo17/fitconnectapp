import { memo } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";

interface StatsMessagesWidgetProps {
  unreadMessages: number;
}

export const StatsMessagesWidget = memo(function StatsMessagesWidget({ unreadMessages }: StatsMessagesWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <MetricCard
      icon={MessageSquare}
      label={t("stats.unreadMessages")}
      value={unreadMessages}
      color="orange"
      size="default"
      trend={unreadMessages > 0 ? { value: unreadMessages, direction: "up" } : undefined}
    />
  );
});
