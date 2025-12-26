import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, Calendar, MessageSquare, User, Users, BarChart3, Settings, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlatformRestrictions } from "@/hooks/usePlatformRestrictions";
import { WebOnlyFeatureDialog } from "@/components/shared/WebOnlyFeatureDialog";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  route: string;
  hideOnIOS?: boolean;
  /** If true, show as disabled with popup instead of hiding */
  disabledOnIOS?: boolean;
}

const clientNavItemsConfig: NavItem[] = [
  { icon: Home, labelKey: "bottomNav.home", route: "/dashboard/client" },
  { icon: Search, labelKey: "bottomNav.discover", route: "/dashboard/client/find-coaches" },
  { icon: Calendar, labelKey: "bottomNav.plans", route: "/dashboard/client/plans" },
  { icon: MessageSquare, labelKey: "bottomNav.messages", route: "/dashboard/client/messages" },
  { icon: User, labelKey: "bottomNav.profile", route: "/dashboard/client/settings" },
];

const coachNavItems: NavItem[] = [
  { icon: Home, labelKey: "bottomNav.home", route: "/dashboard/coach" },
  { icon: Users, labelKey: "bottomNav.clients", route: "/dashboard/coach/clients" },
  { icon: Calendar, labelKey: "bottomNav.schedule", route: "/dashboard/coach/schedule" },
  { icon: MessageSquare, labelKey: "bottomNav.messages", route: "/dashboard/coach/messages" },
  { icon: User, labelKey: "bottomNav.profile", route: "/dashboard/coach/settings" },
];

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, labelKey: "bottomNav.dashboard", route: "/dashboard/admin" },
  { icon: Users, labelKey: "bottomNav.users", route: "/dashboard/admin/users" },
  { icon: User, labelKey: "bottomNav.coaches", route: "/dashboard/admin/coaches" },
  { icon: BarChart3, labelKey: "bottomNav.analytics", route: "/dashboard/admin/analytics" },
  { icon: Settings, labelKey: "bottomNav.settings", route: "/dashboard/admin/settings" },
];

interface MobileBottomNavProps {
  variant: "client" | "coach" | "admin";
}

const MobileBottomNav = ({ variant }: MobileBottomNavProps) => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { shouldHideMarketplace } = usePlatformRestrictions();
  
  // State for web-only feature dialog
  const [showWebOnlyDialog, setShowWebOnlyDialog] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState("");

  // Keep all items but mark restricted ones for rendering
  const navItems = useMemo(() => {
    if (variant === "admin") return adminNavItems;
    if (variant === "coach") return coachNavItems;
    
    if (shouldHideMarketplace) {
      // Filter hideOnIOS but keep disabledOnIOS items
      return clientNavItemsConfig.filter(item => !item.hideOnIOS);
    }
    return clientNavItemsConfig;
  }, [variant, shouldHideMarketplace]);

  const isActive = (route: string) => {
    // Exact match for home routes
    if (route === "/dashboard/client" || route === "/dashboard/coach" || route === "/dashboard/admin") {
      return location.pathname === route;
    }
    // Starts with for other routes
    return location.pathname.startsWith(route);
  };

  const handleRestrictedItemClick = (item: NavItem) => {
    setBlockedFeatureName(t(item.labelKey));
    setShowWebOnlyDialog(true);
  };

  // Use CSS md:hidden for immediate visibility on mobile, with JS fallback
  // This ensures nav is visible before JS hydrates in PWA/Despia
  return (
    <>
      {/* Floating Bottom Navigation - Premium Glass Design */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "md:hidden", // CSS-based hiding on desktop (≥768px)
          "px-5"
        )}
        style={{ 
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
          // JS fallback for edge cases where CSS hasn't applied yet
          display: isMobile === false ? 'none' : undefined
        }}
        role="navigation"
        aria-label={t("bottomNav.mobileNavigation")}
      >
        {/* Enhanced floating pill container with stronger glass effect */}
        <div className="glass-nav mx-auto max-w-md rounded-3xl border border-border/40 px-3 py-4">
          {/* Subtle gradient border on top */}
          <div 
            className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" 
            aria-hidden="true"
          />
          
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.route);
              const Icon = item.icon;
              const isDisabledOnPlatform = shouldHideMarketplace && item.disabledOnIOS;

              if (isDisabledOnPlatform) {
                return (
                  <button
                    key={item.route}
                    onClick={() => handleRestrictedItemClick(item)}
                    className="flex items-center justify-center w-14 h-12 opacity-40 cursor-pointer hover:opacity-60 transition-all duration-200"
                    aria-label={`${t(item.labelKey)} (Web Only)`}
                  >
                    <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                );
              }

              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={cn(
                    "relative flex items-center justify-center w-14 h-12 rounded-2xl transition-all duration-300",
                    "touch-manipulation will-change-transform active:scale-95",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={t(item.labelKey)}
                >
                  {/* Active indicator - glowing pill background */}
                  {active && (
                    <span 
                      className="absolute inset-1 rounded-xl bg-primary/10" 
                      aria-hidden="true"
                    />
                  )}
                  
                  {/* Active indicator - glowing dot */}
                  {active && (
                    <span 
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-sm" 
                      aria-hidden="true"
                    />
                  )}
                  
                  <Icon
                    className={cn(
                      "relative z-10 h-6 w-6 transition-all duration-300",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Web Only Feature Dialog */}
      <WebOnlyFeatureDialog
        open={showWebOnlyDialog}
        onOpenChange={setShowWebOnlyDialog}
        featureName={blockedFeatureName}
      />
    </>
  );
};

export default MobileBottomNav;
