import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickActionsWidgetProps {
  onAddClient: () => void;
}

export function QuickActionsWidget({ onAddClient }: QuickActionsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      <Card 
        variant="glass" 
        className="p-5 flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer hover:border-primary/50 transition-all"
        onClick={onAddClient}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-medium">{t("quickActions.addClient")}</span>
      </Card>
      <Link to="/dashboard/coach/schedule">
        <Card variant="glass" className="h-full p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-primary/50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-accent" />
          </div>
          <span className="text-sm font-medium">{t("quickActions.setAvailability")}</span>
        </Card>
      </Link>
      <Link to="/dashboard/coach/plans">
        <Card variant="glass" className="h-full p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-primary/50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-success" />
          </div>
          <span className="text-sm font-medium">{t("quickActions.createPlan")}</span>
        </Card>
      </Link>
      <Link to="/dashboard/coach/messages">
        <Card variant="glass" className="h-full p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-primary/50 transition-all">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-warning" />
          </div>
          <span className="text-sm font-medium">{t("quickActions.sendMessage")}</span>
        </Card>
      </Link>
    </div>
  );
}
