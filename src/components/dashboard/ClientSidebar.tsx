import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Dumbbell,
  Heart,
  Target,
  Trophy,
  Medal,
  Flame,
  BookOpen,
  ShoppingCart,
  Calculator,
  Wrench,
  UserPlus,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useClientBadges } from "@/hooks/useSidebarBadges";
import { SidebarBadge } from "@/components/shared/SidebarBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

type BadgeKey = "messages" | "plans" | "connections";

interface MenuItem {
  title: string;
  icon: typeof Home;
  path: string;
  badgeKey?: BadgeKey;
}

interface MenuGroup {
  id: string;
  label?: string;
  icon?: typeof Home;
  items: MenuItem[];
  collapsible: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    id: "main",
    collapsible: false,
    items: [
      { title: "Home", icon: Home, path: "/dashboard/client" },
      { title: "Messages", icon: MessageSquare, path: "/dashboard/client/messages", badgeKey: "messages" },
      { title: "Connections", icon: UserPlus, path: "/dashboard/client/connections", badgeKey: "connections" },
    ],
  },
  {
    id: "training",
    label: "My Training",
    icon: Dumbbell,
    collapsible: true,
    items: [
      { title: "My Coaches", icon: Users, path: "/dashboard/client/coaches" },
      { title: "Sessions", icon: Calendar, path: "/dashboard/client/sessions" },
      { title: "My Plans", icon: ClipboardList, path: "/dashboard/client/plans", badgeKey: "plans" },
    ],
  },
  {
    id: "progress",
    label: "Progress & Habits",
    icon: TrendingUp,
    collapsible: true,
    items: [
      { title: "Progress", icon: TrendingUp, path: "/dashboard/client/progress" },
      { title: "Habits", icon: Target, path: "/dashboard/client/habits" },
      { title: "My Library", icon: BookOpen, path: "/dashboard/client/library" },
    ],
  },
  {
    id: "competition",
    label: "Competition",
    icon: Trophy,
    collapsible: true,
    items: [
      { title: "Achievements", icon: Trophy, path: "/dashboard/client/achievements" },
      { title: "Leaderboard", icon: Medal, path: "/dashboard/client/leaderboard" },
      { title: "Challenges", icon: Flame, path: "/dashboard/client/challenges" },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: Wrench,
    collapsible: true,
    items: [
      { title: "Tools", icon: Calculator, path: "/dashboard/client/tools" },
      { title: "Shopping", icon: ShoppingCart, path: "/dashboard/client/grocery" },
      { title: "Favourites", icon: Heart, path: "/dashboard/client/favourites" },
    ],
  },
];

const settingsItem: MenuItem = { title: "Settings", icon: Settings, path: "/dashboard/client/settings" };

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const ClientSidebar = ({ collapsed, onToggle, mobileOpen, setMobileOpen }: ClientSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { unreadCount } = useUnreadMessages();
  const { newPlans, pendingConnections } = useClientBadges();

  // Initialize open groups based on current path
  const getInitialOpenGroups = () => {
    const openGroups: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      if (group.collapsible) {
        const isActiveGroup = group.items.some((item) => location.pathname === item.path);
        openGroups[group.id] = isActiveGroup;
      }
    });
    return openGroups;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups);

  // Update open groups when route changes
  useEffect(() => {
    menuGroups.forEach((group) => {
      if (group.collapsible) {
        const isActiveGroup = group.items.some((item) => location.pathname === item.path);
        if (isActiveGroup) {
          setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const getBadgeCount = (badgeKey?: BadgeKey): number => {
    switch (badgeKey) {
      case "messages":
        return unreadCount;
      case "plans":
        return newPlans;
      case "connections":
        return pendingConnections;
      default:
        return 0;
    }
  };

  const getGroupBadgeCount = (group: MenuGroup): number => {
    return group.items.reduce((sum, item) => sum + getBadgeCount(item.badgeKey), 0);
  };

  const isGroupActive = (group: MenuGroup): boolean => {
    return group.items.some((item) => location.pathname === item.path);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderMenuItem = (item: MenuItem, indented = false, isCollapsed = false) => {
    const isActive = location.pathname === item.path;
    const badgeCount = getBadgeCount(item.badgeKey);

    if (isCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.path}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-colors relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {badgeCount > 0 && <SidebarBadge count={badgeCount} collapsed />}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
          indented && "ml-4",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{item.title}</span>
        {badgeCount > 0 && <SidebarBadge count={badgeCount} />}
      </Link>
    );
  };

  const renderGroup = (group: MenuGroup, isCollapsed = false) => {
    if (!group.collapsible) {
      return (
        <div key={group.id} className="space-y-1">
          {group.items.map((item) => renderMenuItem(item, false, isCollapsed))}
        </div>
      );
    }

    const isOpen = openGroups[group.id];
    const groupBadgeCount = getGroupBadgeCount(group);
    const GroupIcon = group.icon!;
    const isActive = isGroupActive(group);

    if (isCollapsed) {
      return (
        <Tooltip key={group.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleGroup(group.id)}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-colors relative w-full",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="relative">
                <GroupIcon className="w-5 h-5" />
                {groupBadgeCount > 0 && <SidebarBadge count={groupBadgeCount} collapsed />}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {group.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <GroupIcon className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold text-sm flex-1">{group.label}</span>
            {groupBadgeCount > 0 && !isOpen && (
              <SidebarBadge count={groupBadgeCount} />
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {group.items.map((item) => renderMenuItem(item, true, false))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg text-foreground">FitConnect</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuGroups.map((group, index) => (
          <div key={group.id}>
            {index > 0 && <div className="my-2 border-t border-border/50" />}
            {renderGroup(group, isCollapsed)}
          </div>
        ))}
      </nav>

      {/* Settings - Fixed at bottom */}
      <div className="p-2 border-t border-border space-y-1">
        {renderMenuItem(settingsItem, false, isCollapsed)}
      </div>

      {/* Collapse Toggle - Desktop only */}
      {!mobileOpen && (
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-full justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <TooltipProvider>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden xl:flex fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">FitConnect</span>
            </Link>
          </div>

          {/* Search - Mobile only */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-muted/50 border-transparent focus:border-primary"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
            {menuGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <div className="my-2 border-t border-border/50" />}
                {renderGroup(group, false)}
              </div>
            ))}
          </nav>

          {/* Settings */}
          <div className="p-2 border-t border-border space-y-1">
            {renderMenuItem(settingsItem, false, false)}
          </div>

          {/* Profile Section - Mobile only */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar src={avatarUrl} name={displayName} className="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{displayName || "Client"}</p>
                <p className="text-xs text-muted-foreground">Client</p>
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
    </TooltipProvider>
  );
};

export default ClientSidebar;
