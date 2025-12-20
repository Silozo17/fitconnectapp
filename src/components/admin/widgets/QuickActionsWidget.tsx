import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function QuickActionsWidget() {
  const { t } = useTranslation('dashboard');

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          {t('admin.widgets.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Link key={action.labelKey} to={action.href}>
              <Button 
                variant={action.variant || "outline"} 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <action.icon className="h-4 w-4" />
                {t(action.labelKey)}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
