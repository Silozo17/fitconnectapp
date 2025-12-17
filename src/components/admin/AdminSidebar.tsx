import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, Users, Dumbbell, Settings, ChevronLeft, ChevronRight, 
  UsersRound, DollarSign, BarChart3,
  MessageSquare, Shield, Trophy, FileText, Search, LogOut, User, Rocket,
  MessageSquarePlus, Plug
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useAdminBadges } from "@/hooks/useSidebarBadges";
import { usePendingFeedbackCount } from "@/hooks/useFeedback";
import { SidebarBadge } from "@/components/shared/SidebarBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

type BadgeKey = "users" | "verification" | "feedback";

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
  { title: "Boosts", url: "/dashboard/admin/boosts", icon: Rocket },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
];

const platformNavItems: NavItem[] = [
  { title: "Challenges", url: "/dashboard/admin/challenges", icon: Trophy },
  { title: "Verification", url: "/dashboard/admin/verification", icon: Shield, badgeKey: "verification", badgeVariant: "warning" },
  { title: "Integrations", url: "/dashboard/admin/integrations", icon: Plug },
  { title: "Feedback", url: "/dashboard/admin/feedback", icon: MessageSquarePlus, badgeKey: "feedback" },
  { title: "Reviews & Disputes", url: "/dashboard/admin/reviews", icon: MessageSquare },
  { title: "Audit Log", url: "/dashboard/admin/audit", icon: FileText },
];

const bottomNavItems: NavItem[] = [
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const AdminSidebar = ({ mobileOpen, setMobileOpen }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { pendingVerifications, newUsers } = useAdminBadges();
  const { data: pendingFeedbackCount = 0 } = usePendingFeedbackCount();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const getBadgeCount = (badgeKey?: BadgeKey): number => {
    switch (badgeKey) {
      case "users":
        return newUsers;
      case "verification":
        return pendingVerifications;
      case "feedback":
        return pendingFeedbackCount;
      default:
        return 0;
    }
  };

  const renderNavItem = (item: NavItem, isCollapsed = false) => {
    const badgeCount = getBadgeCount(item.badgeKey);
    
    return (
      <NavLink
        key={item.url}
        to={item.url}
        end={item.url === "/dashboard/admin"}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
          isCollapsed && "justify-center px-2"
        )}
        activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <div className="relative">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {badgeCount > 0 && isCollapsed && (
            <SidebarBadge count={badgeCount} collapsed variant={item.badgeVariant} />
          )}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.title}</span>
            {badgeCount > 0 && <SidebarBadge count={badgeCount} variant={item.badgeVariant} />}
          </>
        )}
      </NavLink>
    );
  };

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FC</span>
            </div>
            <span className="font-semibold text-foreground">Admin</span>
          </div>
        )}
        {/* Collapse Toggle - Desktop only */}
        {!mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => renderNavItem(item, isCollapsed))}

        {!isCollapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Platform
            </p>
          </div>
        )}
        {isCollapsed && <Separator className="my-2" />}

        {platformNavItems.map((item) => renderNavItem(item, isCollapsed))}
      </nav>

      <div className="p-2 border-t border-border space-y-1">
        {bottomNavItems.map((item) => renderNavItem(item, isCollapsed))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden xl:flex fixed left-0 top-0 h-full bg-card border-r border-border flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FC</span>
              </div>
              <span className="font-semibold text-foreground">Admin</span>
            </div>
          </div>

          {/* Search - Mobile only */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users, coaches..."
                autoFocus={false}
                className="pl-10 bg-muted/50 border-transparent focus:border-primary"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => renderNavItem(item, false))}

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Platform
              </p>
            </div>

            {platformNavItems.map((item) => renderNavItem(item, false))}
          </nav>

          {/* Settings */}
          <div className="p-2 border-t border-border space-y-1">
            {bottomNavItems.map((item) => renderNavItem(item, false))}
          </div>

          {/* Profile Section - Mobile only */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar src={avatarUrl} name={displayName} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{displayName || "Admin"}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/dashboard/profile");
                  setMobileOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminSidebar;
