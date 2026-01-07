import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { UserPlus, Dumbbell, Settings, Shield, DollarSign, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";

interface QuickAction {
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  { labelKey: "admin.actions.addUser", icon: UserPlus, href: "/dashboard/admin/users", color: "text-blue-500" },
  { labelKey: "admin.actions.addCoach", icon: Dumbbell, href: "/dashboard/admin/coaches", color: "text-orange-500" },
  { labelKey: "admin.actions.verifications", icon: Shield, href: "/dashboard/admin/verification", color: "text-yellow-500" },
  { labelKey: "admin.actions.revenue", icon: DollarSign, href: "/dashboard/admin/revenue", color: "text-green-500" },
  { labelKey: "admin.actions.settings", icon: Settings, href: "/dashboard/admin/settings", color: "text-purple-500" },
  { labelKey: "admin.actions.analytics", icon: BarChart, href: "/dashboard/admin/analytics", color: "text-cyan-500" },
];

const ActionCard = ({ action, t }: { action: QuickAction; t: (key: string) => string }) => {
  const Icon = action.icon;
  return (
    <Link to={action.href} className="block h-full">
      <Card className="h-full p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer border-border/50">
        <div className={`p-4 rounded-xl bg-muted/50 ${action.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium text-foreground leading-tight">
          {t(action.labelKey)}
        </span>
      </Card>
    </Link>
  );
};

export const QuickActionsWidget = memo(function QuickActionsWidget() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Quick <span className="gradient-text">Actions</span>
        </h3>
        <p className="text-xs text-muted-foreground">Navigate to common admin tasks</p>
      </div>

      <div className="overflow-hidden">
        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <Carousel3D showPagination gap={12}>
            {actions.map((action) => (
              <Carousel3DItem key={action.labelKey} className="w-36 h-[120px]">
                <ActionCard action={action} t={t} />
              </Carousel3DItem>
            ))}
          </Carousel3D>
        </div>
        
        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => (
            <div key={action.labelKey} className="h-[120px]">
              <ActionCard action={action} t={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
