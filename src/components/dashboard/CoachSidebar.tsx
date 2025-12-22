import { useState, useEffect, memo, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  ClipboardList,
  DollarSign,
  Settings,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  ShoppingBag,
  Star,
  Kanban,
  Trophy,
  Search,
  LogOut,
  User,
  Rocket,
  UserPlus,
  Lock,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useCoachBadges } from "@/hooks/useSidebarBadges";
import { SidebarBadge } from "@/components/shared/SidebarBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { Rarity } from "@/lib/avatar-utils";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FeatureKey } from "@/lib/feature-config";
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

type BadgeKey = "messages" | "pipeline" | "schedule" | "clients" | "connections";

interface MenuItem {
  titleKey: string;
  icon: typeof LayoutDashboard;
  path: string;
  badgeKey?: BadgeKey;
  badgeVariant?: "default" | "warning" | "urgent";
  requiredFeature?: FeatureKey;
}

interface MenuGroup {
  id: string;
  labelKey?: string;
  icon?: typeof LayoutDashboard;
  items: MenuItem[];
  collapsible: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    id: "main",
    collapsible: false,
    items: [
      { titleKey: "navigation.coach.overview", icon: LayoutDashboard, path: "/dashboard/coach" },
      { titleKey: "navigation.coach.pipeline", icon: Kanban, path: "/dashboard/coach/pipeline", badgeKey: "pipeline", badgeVariant: "warning" },
      { titleKey: "navigation.coach.messages", icon: MessageSquare, path: "/dashboard/coach/messages", badgeKey: "messages" },
      { titleKey: "navigation.coach.connections", icon: UserPlus, path: "/dashboard/coach/connections", badgeKey: "connections", badgeVariant: "warning" },
    ],
  },
  {
    id: "clients",
    labelKey: "navigation.coach.clientManagement",
    icon: Users,
    collapsible: true,
    items: [
      { titleKey: "navigation.coach.clients", icon: Users, path: "/dashboard/coach/clients", badgeKey: "clients", badgeVariant: "warning" },
      { titleKey: "navigation.coach.schedule", icon: Calendar, path: "/dashboard/coach/schedule", badgeKey: "schedule", badgeVariant: "warning" },
      { titleKey: "navigation.coach.trainingPlans", icon: ClipboardList, path: "/dashboard/coach/plans", requiredFeature: "workout_plan_builder" },
    ],
  },
  {
    id: "products",
    labelKey: "navigation.coach.productsPricing",
    icon: Package,
    collapsible: true,
    items: [
      { titleKey: "navigation.coach.packages", icon: Package, path: "/dashboard/coach/packages" },
      { titleKey: "navigation.coach.digitalProducts", icon: ShoppingBag, path: "/dashboard/coach/products" },
    ],
  },
  {
    id: "business",
    labelKey: "navigation.coach.business",
    icon: DollarSign,
    collapsible: true,
    items: [
      { titleKey: "navigation.coach.boost", icon: Rocket, path: "/dashboard/coach/boost", requiredFeature: "boost_marketing" },
      { titleKey: "navigation.coach.earnings", icon: DollarSign, path: "/dashboard/coach/earnings", requiredFeature: "basic_analytics" },
      { titleKey: "navigation.coach.financial", icon: Receipt, path: "/dashboard/coach/financial" },
      { titleKey: "navigation.coach.reviews", icon: Star, path: "/dashboard/coach/reviews" },
      { titleKey: "navigation.coach.integrations", icon: Settings, path: "/dashboard/coach/integrations", requiredFeature: "custom_integrations" },
    ],
  },
  {
    id: "gamification",
    labelKey: "navigation.coach.gamification",
    icon: Trophy,
    collapsible: true,
    items: [
      { titleKey: "navigation.coach.achievements", icon: Trophy, path: "/dashboard/coach/achievements" },
    ],
  },
];

const settingsItem: MenuItem = { titleKey: "navigation.coach.settings", icon: Settings, path: "/dashboard/coach/settings" };

interface CoachSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const CoachSidebar = memo(({ collapsed, onToggle, mobileOpen, setMobileOpen }: CoachSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');
  const { unreadCount } = useUnreadMessages();
  const { badges: { newLeads, pendingBookings, pendingClientRequests, pendingFriendRequests } } = useCoachBadges();
  const { hasFeature } = useFeatureAccess();

  // Initialize open groups based on current path
  const getInitialOpenGroups = useCallback(() => {
    const openGroups: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      if (group.collapsible) {
        const isActiveGroup = group.items.some((item) => location.pathname === item.path);
        openGroups[group.id] = isActiveGroup;
      }
    });
    return openGroups;
  }, [location.pathname]);

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

  const getBadgeCount = useCallback((badgeKey?: BadgeKey): number => {
    switch (badgeKey) {
      case "messages":
        return unreadCount;
      case "pipeline":
        return newLeads;
      case "schedule":
        return pendingBookings;
      case "clients":
        return pendingClientRequests;
      case "connections":
        return pendingFriendRequests;
      default:
        return 0;
    }
  }, [unreadCount, newLeads, pendingBookings, pendingClientRequests, pendingFriendRequests]);

  const getGroupBadgeCount = useCallback((group: MenuGroup): number => {
    return group.items.reduce((sum, item) => sum + getBadgeCount(item.badgeKey), 0);
  }, [getBadgeCount]);

  const isGroupActive = useCallback((group: MenuGroup): boolean => {
    return group.items.some((item) => location.pathname === item.path);
  }, [location.pathname]);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const renderMenuItem = (item: MenuItem, indented = false, isCollapsed = false) => {
    const isActive = location.pathname === item.path;
    const badgeCount = getBadgeCount(item.badgeKey);
    const isLocked = item.requiredFeature && !hasFeature(item.requiredFeature);
    const title = t(item.titleKey);

    if (isCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.path}
              className={cn(
                "flex items-center justify-center p-2.5 rounded-lg transition-colors relative",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : isLocked
                    ? "text-sidebar-foreground/40 hover:bg-sidebar-accent/50"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {isLocked && (
                  <Lock className="w-3 h-3 absolute -top-1 -right-1 text-warning" />
                )}
                {badgeCount > 0 && !isLocked && <SidebarBadge count={badgeCount} collapsed variant={item.badgeVariant} />}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {title} {isLocked && t("navigation.upgradeRequired")}
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
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : isLocked
              ? "text-sidebar-foreground/40 hover:bg-sidebar-accent/50"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{title}</span>
        {isLocked && <Lock className="w-3.5 h-3.5 text-warning" />}
        {badgeCount > 0 && !isLocked && <SidebarBadge count={badgeCount} variant={item.badgeVariant} />}
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
    const groupLabel = group.labelKey ? t(group.labelKey) : "";

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
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <div className="relative">
                <GroupIcon className="w-5 h-5" />
                {groupBadgeCount > 0 && <SidebarBadge count={groupBadgeCount} collapsed />}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {groupLabel}
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
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <GroupIcon className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold text-sm flex-1">{groupLabel}</span>
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
      {/* Logo with Collapse Toggle */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-xl text-sidebar-foreground">
              {t("app.name")}
            </span>
          )}
        </div>
        {/* Collapse Toggle - Desktop only */}
        {!mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto" aria-label="Dashboard navigation">
        {menuGroups.map((group, index) => (
          <div key={group.id} role="group" aria-label={group.labelKey ? t(group.labelKey) : t("navigation.mainMenu")}>
            {index > 0 && <div className="my-2 border-t border-sidebar-border/50" aria-hidden="true" />}
            {renderGroup(group, isCollapsed)}
          </div>
        ))}
      </nav>

      {/* Settings - Fixed at bottom */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {renderMenuItem(settingsItem, false, isCollapsed)}
      </div>
    </>
  );

  return (
    <TooltipProvider>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden xl:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col bg-sidebar" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-sidebar-foreground">
                {t("app.name")}
              </span>
            </div>
          </div>

          {/* Search - Mobile only */}
          <div className="p-3 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("navigation.searchPlaceholder")}
                autoFocus={false}
                className="pl-10 bg-sidebar-accent/50 border-transparent focus:border-primary"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
            {menuGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <div className="my-2 border-t border-sidebar-border/50" />}
                {renderGroup(group, false)}
              </div>
            ))}
          </nav>

          {/* Settings */}
          <div className="p-2 border-t border-sidebar-border space-y-1">
            {renderMenuItem(settingsItem, false, false)}
          </div>

          {/* Profile Section - Mobile only */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar 
                src={avatarUrl} 
                avatarSlug={selectedAvatar?.slug}
                avatarRarity={selectedAvatar?.rarity as Rarity}
                name={displayName} 
                className="w-10 h-10" 
                showRarityBorder
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-sidebar-foreground">{displayName || t("navigation.roleCoach")}</p>
                <p className="text-xs text-sidebar-foreground/60">{t("navigation.roleCoach")}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => {
                  navigate("/dashboard/profile");
                  setMobileOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                {t("navigation.myProfile")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-sidebar-accent"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("navigation.signOut")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
});

CoachSidebar.displayName = "CoachSidebar";

export default CoachSidebar;
