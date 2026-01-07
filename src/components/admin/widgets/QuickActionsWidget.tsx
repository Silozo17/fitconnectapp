import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { UserPlus, Dumbbell, Settings, Shield, DollarSign, BarChart, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickAction {
  labelKey: string;
  icon: React.ComponentType<any>;
  href: string;
  variant?: "default" | "outline";
}

const actions: QuickAction[] = [
  { labelKey: "admin.actions.addUser", icon: UserPlus, href: "/dashboard/admin/users", variant: "default" },
  { labelKey: "admin.actions.addCoach", icon: Dumbbell, href: "/dashboard/admin/coaches", variant: "outline" },
  { labelKey: "admin.actions.verifications", icon: Shield, href: "/dashboard/admin/verification", variant: "outline" },
  { labelKey: "admin.actions.revenue", icon: DollarSign, href: "/dashboard/admin/revenue", variant: "outline" },
  { labelKey: "admin.actions.settings", icon: Settings, href: "/dashboard/admin/settings", variant: "outline" },
  { labelKey: "admin.actions.analytics", icon: BarChart, href: "/dashboard/admin/analytics", variant: "outline" },
];

export const QuickActionsWidget = memo(function QuickActionsWidget() {
  const { t } = useTranslation('dashboard');

  return (
    <div className="relative bg-gradient-to-br from-cyan-500/10 via-background to-cyan-600/5 rounded-2xl border border-cyan-500/20 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/60 via-cyan-500/40 to-transparent" />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <div className="p-2 rounded-xl bg-cyan-500/20">
          <Zap className="h-4 w-4 text-cyan-400" />
        </div>
        <h3 className="font-semibold text-foreground text-base">{t('admin.widgets.quickActions')}</h3>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Link key={action.labelKey} to={action.href}>
              <Button 
                variant={action.variant || "outline"} 
                className="w-full justify-start gap-2 rounded-xl"
                size="sm"
              >
                <action.icon className="h-4 w-4" />
                {t(action.labelKey)}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
});
