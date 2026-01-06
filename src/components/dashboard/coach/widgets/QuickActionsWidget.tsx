import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import { ContentSection } from "@/components/shared/ContentSection";

interface QuickActionsWidgetProps {
  onAddClient: () => void;
}

export function QuickActionsWidget({ onAddClient }: QuickActionsWidgetProps) {
  const { t } = useTranslation("coach");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
      <button 
        onClick={onAddClient}
        className="w-full text-left"
      >
        <ContentSection 
          colorTheme="primary" 
          className="p-4 md:p-5 flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer hover:border-primary/50 transition-all rounded-3xl h-full"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-center">{t("quickActions.addClient")}</span>
        </ContentSection>
      </button>
      <Link to="/dashboard/coach/schedule">
        <ContentSection colorTheme="blue" className="h-full p-4 md:p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-blue-500/50 transition-all rounded-3xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-sm font-medium text-center">{t("quickActions.setAvailability")}</span>
        </ContentSection>
      </Link>
      <Link to="/dashboard/coach/plans">
        <ContentSection colorTheme="green" className="h-full p-4 md:p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-green-500/50 transition-all rounded-3xl">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-green-400" />
          </div>
          <span className="text-sm font-medium text-center">{t("quickActions.createPlan")}</span>
        </ContentSection>
      </Link>
      <Link to="/dashboard/coach/messages">
        <ContentSection colorTheme="orange" className="h-full p-4 md:p-5 flex flex-col items-center justify-center gap-2 border-dashed hover:border-orange-500/50 transition-all rounded-3xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-orange-400" />
          </div>
          <span className="text-sm font-medium text-center">{t("quickActions.sendMessage")}</span>
        </ContentSection>
      </Link>
    </div>
  );
}
