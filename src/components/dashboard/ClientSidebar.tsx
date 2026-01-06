import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  ShoppingBag,
  Utensils,
  ShoppingCart,
  Calculator,
  Wrench,
  UserPlus,
  Search,
  LogOut,
  User,
  Plug,
  Receipt,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useClientBadges } from "@/hooks/useSidebarBadges";
import { SidebarBadge } from "@/components/shared/SidebarBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { WebOnlyFeatureDialog } from "@/components/shared/WebOnlyFeatureDialog";
import { Rarity } from "@/lib/avatar-utils";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
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
  titleKey: string;
  icon: typeof Home;
  path: string;
  badgeKey?: BadgeKey;
  /** If true, the item is hidden on iOS native */
  hideOnIOS?: boolean;
  /** If true, the item shows as disabled with "Web Only" on iOS instead of being hidden */
  disabledOnIOS?: boolean;
}

interface MenuGroup {
  id: string;
  labelKey?: string;
  icon?: typeof Home;
  items: MenuItem[];
  collapsible: boolean;
  hideOnIOS?: boolean;
}

const menuGroupsConfig: MenuGroup[] = [
  {
    id: "main",
    collapsible: false,
    items: [
      { titleKey: "navigation.client.home", icon: Home, path: "/dashboard/client" },
      { titleKey: "navigation.client.findCoaches", icon: Search, path: "/dashboard/client/find-coaches" },
      { titleKey: "navigation.client.marketplace", icon: ShoppingBag, path: "/dashboard/client/marketplace", disabledOnIOS: true },
      { titleKey: "navigation.client.messages", icon: MessageSquare, path: "/dashboard/client/messages", badgeKey: "messages" },
      { titleKey: "navigation.client.connections", icon: UserPlus, path: "/dashboard/client/connections", badgeKey: "connections" },
    ],
  },
  {
    id: "training",
    labelKey: "navigation.client.myTraining",
    icon: Dumbbell,
    collapsible: true,
    items: [
      { titleKey: "navigation.client.myCoaches", icon: Users, path: "/dashboard/client/coaches" },
      { titleKey: "navigation.client.sessions", icon: Calendar, path: "/dashboard/client/sessions" },
      { titleKey: "navigation.client.myPlans", icon: ClipboardList, path: "/dashboard/client/plans", badgeKey: "plans" },
      { titleKey: "navigation.client.myLibrary", icon: BookOpen, path: "/dashboard/client/library" },
    ],
  },
  {
    id: "progress",
    labelKey: "navigation.client.progressHabits",
    icon: TrendingUp,
    collapsible: true,
    items: [
      { titleKey: "navigation.client.progress", icon: TrendingUp, path: "/dashboard/client/progress" },
      { titleKey: "navigation.client.habits", icon: Target, path: "/dashboard/client/habits" },
      { titleKey: "navigation.client.foodDiary", icon: Utensils, path: "/dashboard/client/food-diary" },
      { titleKey: "navigation.client.trainingLogs", icon: Dumbbell, path: "/dashboard/client/training-logs" },
    ],
  },
  {
    id: "competition",
    labelKey: "navigation.client.competition",
    icon: Trophy,
    collapsible: true,
    items: [
      { titleKey: "navigation.client.achievements", icon: Trophy, path: "/dashboard/client/achievements" },
      { titleKey: "navigation.client.leaderboard", icon: Medal, path: "/dashboard/client/leaderboard" },
      { titleKey: "navigation.client.challenges", icon: Flame, path: "/dashboard/client/challenges" },
    ],
  },
  {
    id: "utilities",
    labelKey: "navigation.client.utilities",
    icon: Wrench,
    collapsible: true,
    items: [
      { titleKey: "navigation.client.tools", icon: Calculator, path: "/dashboard/client/tools" },
      { titleKey: "navigation.client.shopping", icon: ShoppingCart, path: "/dashboard/client/grocery" },
      { titleKey: "navigation.client.receipts", icon: Receipt, path: "/dashboard/client/receipts" },
      { titleKey: "navigation.client.integrations", icon: Plug, path: "/dashboard/client/integrations" },
      { titleKey: "navigation.client.favourites", icon: Heart, path: "/dashboard/client/favourites" },
      // Hidden for now - uncomment to restore: { titleKey: "Debug", icon: Bug, path: "/debug" },
    ],
  },
];

const settingsItem: MenuItem = { titleKey: "navigation.client.settings", icon: Settings, path: "/dashboard/client/settings" };

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const ClientSidebar = ({ collapsed, onToggle, mobileOpen, setMobileOpen }: ClientSidebarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('client');
  const { unreadCount } = useUnreadMessages();
  const { badges: { newPlans, pendingConnections } } = useClientBadges();
  const { shouldHideMarketplace } = usePlatformRestrictions();
  const [isPending, startTransition] = useTransition();
  
  // State for web-only feature dialog
  const [showWebOnlyDialog, setShowWebOnlyDialog] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState("");

  // Optimized mobile navigation - close sheet first, then navigate
  const handleMobileNavigation = useCallback((path: string) => {
    // Close sheet immediately for responsive feel
    setMobileOpen(false);
    // Use startTransition to prevent UI blocking during chunk load
    startTransition(() => {
      navigate(path);
    });
  }, [navigate, setMobileOpen]);

  // Filter menu groups and items based on platform restrictions
  // Items with disabledOnIOS are kept but rendered as disabled with popup
  const menuGroups = useMemo(() => {
    if (!shouldHideMarketplace) return menuGroupsConfig;

    return menuGroupsConfig
      .filter(group => !group.hideOnIOS)
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.hideOnIOS),
      }));
  }, [shouldHideMarketplace]);

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

  // Remove auto-close on navigation for desktop - let optimized mobile handler manage it

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
    setOpenGroups((prev) => {
      const newState = { ...prev, [groupId]: !prev[groupId] };
      
      // If opening the group, scroll it into view after animation
      if (newState[groupId]) {
        setTimeout(() => {
          const element = document.getElementById(`nav-group-${groupId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      }
      
      return newState;
    });
  };

  const handleRestrictedItemClick = (item: MenuItem) => {
    setBlockedFeatureName(t(item.titleKey));
    setShowWebOnlyDialog(true);
  };

  const renderMenuItem = (item: MenuItem, indented = false, isCollapsed = false, isMobile = false) => {
    const isActive = location.pathname === item.path;
    const badgeCount = getBadgeCount(item.badgeKey);
    const title = t(item.titleKey);
    const isDisabledOnPlatform = shouldHideMarketplace && item.disabledOnIOS;

    // For mobile sidebar, use button with optimized navigation
    const handleClick = isMobile ? () => handleMobileNavigation(item.path) : undefined;
    const Component = isMobile ? 'button' : Link;
    const linkProps = isMobile ? { type: 'button' as const, onClick: handleClick } : { to: item.path };

    if (isCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            {isDisabledOnPlatform ? (
              <button
                onClick={() => handleRestrictedItemClick(item)}
                className="flex items-center justify-center p-2.5 rounded-lg opacity-50 cursor-pointer hover:bg-muted/50"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
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
            )}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {isDisabledOnPlatform ? `${title} (Web Only)` : title}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (isDisabledOnPlatform) {
      return (
        <button
          key={item.path}
          onClick={() => handleRestrictedItemClick(item)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg opacity-60 cursor-pointer hover:bg-muted/50 w-full text-left",
            indented && "ml-4"
          )}
        >
          <item.icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <span className="font-medium text-sm flex-1 text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Web</span>
        </button>
      );
    }

    // For mobile, use button with onClick for optimized navigation
    if (isMobile) {
      return (
        <button
          key={item.path}
          type="button"
          onClick={handleClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative w-full text-left",
            indented && "ml-4",
            isActive
              ? "bg-primary text-primary-foreground shadow-glow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium text-sm flex-1">{title}</span>
          {badgeCount > 0 && <SidebarBadge count={badgeCount} />}
        </button>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
          indented && "ml-4",
          isActive
            ? "bg-primary text-primary-foreground shadow-glow-sm"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{title}</span>
        {badgeCount > 0 && <SidebarBadge count={badgeCount} />}
      </Link>
    );
  };

  const renderGroup = (group: MenuGroup, isCollapsed = false, isMobile = false) => {
    if (!group.collapsible) {
      return (
        <div key={group.id} className="space-y-1">
          {group.items.map((item) => renderMenuItem(item, false, isCollapsed, isMobile))}
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
            {groupLabel}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible
        key={group.id}
        id={`nav-group-${group.id}`}
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
          {group.items.map((item) => renderMenuItem(item, true, false, isMobile))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <>
      {/* Logo with Collapse Toggle */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow-sm">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-display font-bold text-lg text-foreground">{t("app.name")}</span>
          )}
        </div>
        {/* Collapse Toggle - Desktop only */}
        {!mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-xl hover:bg-muted/50"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto" aria-label="Dashboard navigation">
        {menuGroups.map((group, index) => (
          <div key={group.id} role="group" aria-label={group.labelKey ? t(group.labelKey) : t("navigation.mainMenu")}>
            {index > 0 && <div className="my-2 border-t border-border/50" aria-hidden="true" />}
            {renderGroup(group, isCollapsed)}
          </div>
        ))}
      </nav>

      {/* Settings - Fixed at bottom */}
      <div className="p-2 border-t border-border space-y-1">
        {renderMenuItem(settingsItem, false, isCollapsed)}
      </div>
    </>
  );

  return (
    <TooltipProvider>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden xl:flex fixed left-0 top-0 h-full border-r border-border/50 transition-all duration-300 z-40 flex-col",
          "bg-sidebar/95 backdrop-blur-xl",
          collapsed ? "w-16" : "w-64"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col overflow-visible" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Logo */}
          <div className="p-4 border-b border-border safe-top-sidebar">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">{t("app.name")}</span>
            </div>
          </div>

          {/* View Switcher & Notifications - Mobile only */}
          <div className="p-2 border-b border-border flex items-center justify-between gap-2">
            <ViewSwitcher />
            <NotificationCenter />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-y-contain">
            {menuGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <div className="my-2 border-t border-border/50" />}
                {renderGroup(group, false, true)}
              </div>
            ))}
          </nav>

          {/* Settings */}
          <div className="p-2 border-t border-border space-y-1">
            {renderMenuItem(settingsItem, false, false, true)}
          </div>

          {/* Profile Section - Compact single row */}
          <div className="p-2 border-t border-border">
            <div className="flex items-center justify-end gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => {
                      navigate("/dashboard/profile");
                      setMobileOpen(false);
                    }}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("navigation.myProfile")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("navigation.signOut")}</TooltipContent>
              </Tooltip>
              <UserAvatar 
                src={avatarUrl} 
                avatarSlug={selectedAvatar?.slug}
                avatarRarity={selectedAvatar?.rarity as Rarity}
                name={displayName} 
                className="w-9 h-9 ml-1" 
                showRarityBorder
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Web Only Feature Dialog */}
      <WebOnlyFeatureDialog
        open={showWebOnlyDialog}
        onOpenChange={setShowWebOnlyDialog}
        featureName={blockedFeatureName}
      />
    </TooltipProvider>
  );
};

export default ClientSidebar;
