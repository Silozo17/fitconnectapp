import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import { ContentSection } from "@/components/shared/ContentSection";

interface QuickActionsWidgetProps {
  onAddClient: () => void;
}

export function QuickActionsWidget({ onAddClient }: QuickActionsWidgetProps) {
  const { t } = useTranslation("coach");

  const actions = [
    {
      key: "add",
      onClick: onAddClient,
      colorTheme: "primary" as const,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      hoverBorder: "hover:border-primary/50",
      icon: Plus,
      label: t("quickActions.addClient"),
    },
    {
      key: "schedule",
      to: "/dashboard/coach/schedule",
      colorTheme: "blue" as const,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      hoverBorder: "hover:border-blue-500/50",
      icon: Calendar,
      label: t("quickActions.setAvailability"),
    },
    {
      key: "plan",
      to: "/dashboard/coach/plans",
      colorTheme: "green" as const,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      hoverBorder: "hover:border-green-500/50",
      icon: Plus,
      label: t("quickActions.createPlan"),
    },
    {
      key: "message",
      to: "/dashboard/coach/messages",
      colorTheme: "orange" as const,
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
      hoverBorder: "hover:border-orange-500/50",
      icon: MessageSquare,
      label: t("quickActions.sendMessage"),
    },
  ];

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
      <div className="flex gap-3 md:grid md:grid-cols-4 min-w-max md:min-w-0">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <ContentSection
              colorTheme={action.colorTheme}
              className={`p-4 md:p-5 flex flex-col items-center justify-center gap-2 border-dashed cursor-pointer ${action.hoverBorder} transition-all rounded-3xl h-full min-w-[120px] md:min-w-0`}
            >
              <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>
              <span className="text-sm font-medium text-center whitespace-nowrap">{action.label}</span>
            </ContentSection>
          );

          if (action.onClick) {
            return (
              <button key={action.key} onClick={action.onClick} className="text-left flex-shrink-0 md:flex-shrink">
                {content}
              </button>
            );
          }

          return (
            <Link key={action.key} to={action.to!} className="flex-shrink-0 md:flex-shrink">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
