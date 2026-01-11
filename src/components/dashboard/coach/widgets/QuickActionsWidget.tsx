import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  Users, 
  DollarSign, 
  Package, 
  Zap,
  ClipboardList
} from "lucide-react";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";
import { Card, CardContent } from "@/components/ui/card";
import { IconSquare } from "@/components/ui/icon-square";

interface QuickActionsWidgetProps {
  onAddClient: () => void;
  activeClients?: number;
  unreadMessages?: number;
}

export const QuickActionsWidget = memo(function QuickActionsWidget({ 
  onAddClient, 
  activeClients = 0,
  unreadMessages = 0 
}: QuickActionsWidgetProps) {
  const { t } = useTranslation("coach");

  const actions = [
    {
      key: "add",
      onClick: onAddClient,
      color: "primary" as const,
      icon: Plus,
      label: t("quickActions.addClient"),
      description: "Invite a new client",
    },
    {
      key: "clients",
      to: "/dashboard/coach/clients",
      color: "purple" as const,
      icon: Users,
      label: t("quickActions.myClients", "My Clients"),
      description: `${activeClients} active clients`,
    },
    {
      key: "schedule",
      to: "/dashboard/coach/schedule",
      color: "blue" as const,
      icon: Calendar,
      label: t("quickActions.setAvailability"),
      description: "Set availability",
    },
    {
      key: "plan",
      to: "/dashboard/coach/plans",
      color: "green" as const,
      icon: ClipboardList,
      label: t("quickActions.createPlan"),
      description: "Workout/nutrition",
    },
    {
      key: "message",
      to: "/dashboard/coach/messages",
      color: "orange" as const,
      icon: MessageSquare,
      label: t("quickActions.sendMessage"),
      description: unreadMessages > 0 ? `${unreadMessages} unread` : "Chat with clients",
    },
    {
      key: "earnings",
      to: "/dashboard/coach/earnings",
      color: "green" as const,
      icon: DollarSign,
      label: t("quickActions.earnings", "Earnings"),
      description: "View revenue",
    },
    {
      key: "packages",
      to: "/dashboard/coach/packages",
      color: "cyan" as const,
      icon: Package,
      label: t("quickActions.packages", "Packages"),
      description: "Manage offerings",
    },
    {
      key: "automations",
      to: "/dashboard/coach/automations",
      color: "pink" as const,
      icon: Zap,
      label: t("quickActions.automations", "Automations"),
      description: "Auto check-ins",
    },
  ];

  const renderActionCard = (action: typeof actions[0]) => {
    const content = (
      <Card variant="elevated" className="h-full rounded-3xl group-hover:shadow-lg transition-shadow">
        <CardContent className="p-5 flex flex-col items-center text-center gap-3">
          <IconSquare icon={action.icon} color={action.color} size="md" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">{action.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
          </div>
        </CardContent>
      </Card>
    );

    if (action.onClick) {
      return (
        <button 
          key={action.key} 
          onClick={action.onClick} 
          className="text-left w-full h-full group"
        >
          {content}
        </button>
      );
    }

    return (
      <Link key={action.key} to={action.to!} className="block w-full h-full group">
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile: 3D Carousel */}
      <div className="md:hidden -mx-5">
        <Carousel3D gap={12} showPagination={actions.length > 3}>
          {actions.map((action) => (
            <Carousel3DItem key={action.key} className="w-[170px]">
              {renderActionCard(action)}
            </Carousel3DItem>
          ))}
        </Carousel3D>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <div key={action.key}>
            {renderActionCard(action)}
          </div>
        ))}
      </div>
    </>
  );
});
