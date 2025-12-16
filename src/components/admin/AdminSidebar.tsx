import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, Users, Dumbbell, Settings, ChevronLeft, ChevronRight, 
  UsersRound, DollarSign, BarChart3, User, CreditCard, Sliders, 
  MessageSquare, Shield, Trophy, FileText
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAdminBadges } from "@/hooks/useSidebarBadges";
import { SidebarBadge } from "@/components/shared/SidebarBadge";

type BadgeKey = "users" | "verification";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badgeKey?: BadgeKey;
  badgeVariant?: "default" | "warning" | "urgent";
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Users", url: "/dashboard/admin/users", icon: Users, badgeKey: "users" },
  { title: "Coaches", url: "/dashboard/admin/coaches", icon: Dumbbell },
  { title: "Team", url: "/dashboard/admin/team", icon: UsersRound },
  { title: "Revenue", url: "/dashboard/admin/revenue", icon: DollarSign },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
];

const platformNavItems: NavItem[] = [
  { title: "Challenges", url: "/dashboard/admin/challenges", icon: Trophy },
  { title: "Verification", url: "/dashboard/admin/verification", icon: Shield, badgeKey: "verification", badgeVariant: "warning" },
  { title: "Pricing Plans", url: "/dashboard/admin/plans", icon: CreditCard },
  { title: "Feature Control", url: "/dashboard/admin/features", icon: Sliders },
  { title: "Reviews & Disputes", url: "/dashboard/admin/reviews", icon: MessageSquare },
  { title: "Audit Log", url: "/dashboard/admin/audit", icon: FileText },
];

const bottomNavItems: NavItem[] = [
  { title: "My Profile", url: "/dashboard/admin/profile", icon: User },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pendingVerifications, newUsers } = useAdminBadges();

  const getBadgeCount = (badgeKey?: BadgeKey): number => {
    switch (badgeKey) {
      case "users":
        return newUsers;
      case "verification":
        return pendingVerifications;
      default:
        return 0;
    }
  };

  const renderNavItem = (item: NavItem) => {
    const badgeCount = getBadgeCount(item.badgeKey);
    
    return (
      <NavLink
        key={item.url}
        to={item.url}
        end={item.url === "/dashboard/admin"}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
          collapsed && "justify-center px-2"
        )}
        activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <div className="relative">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {badgeCount > 0 && collapsed && (
            <SidebarBadge count={badgeCount} collapsed variant={item.badgeVariant} />
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {badgeCount > 0 && <SidebarBadge count={badgeCount} variant={item.badgeVariant} />}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FC</span>
            </div>
            <span className="font-semibold text-foreground">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {mainNavItems.map(renderNavItem)}

        {!collapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Platform
            </p>
          </div>
        )}
        {collapsed && <Separator className="my-2" />}

        {platformNavItems.map(renderNavItem)}
      </nav>

      <div className="p-2 border-t border-border space-y-1">
        {bottomNavItems.map(renderNavItem)}
      </div>
    </aside>
  );
};

export default AdminSidebar;
