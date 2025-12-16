import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Dumbbell, Settings, Shield, DollarSign, BarChart, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
  variant?: "default" | "outline";
}

const actions: QuickAction[] = [
  { label: "Add User", icon: UserPlus, href: "/dashboard/admin/users", variant: "default" },
  { label: "Add Coach", icon: Dumbbell, href: "/dashboard/admin/coaches", variant: "outline" },
  { label: "Verifications", icon: Shield, href: "/dashboard/admin/verification", variant: "outline" },
  { label: "Revenue", icon: DollarSign, href: "/dashboard/admin/revenue", variant: "outline" },
  { label: "Settings", icon: Settings, href: "/dashboard/admin/settings", variant: "outline" },
  { label: "Analytics", icon: BarChart, href: "/dashboard/admin/analytics", variant: "outline" },
];

export function QuickActionsWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Button 
                variant={action.variant || "outline"} 
                className="w-full justify-start gap-2"
                size="sm"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
