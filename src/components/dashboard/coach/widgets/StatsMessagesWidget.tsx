import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsMessagesWidgetProps {
  unreadMessages: number;
}

export function StatsMessagesWidget({ unreadMessages }: StatsMessagesWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <Card variant="glass" className="p-6 hover:shadow-float transition-all h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-warning" />
        </div>
        {unreadMessages > 0 && (
          <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
            {unreadMessages}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-foreground">{unreadMessages}</p>
      <p className="text-sm text-muted-foreground">{t("stats.unreadMessages")}</p>
    </Card>
  );
}
