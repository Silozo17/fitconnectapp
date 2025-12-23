import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, Calendar, MessageSquare, User, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIOSRestrictions } from "@/hooks/useIOSRestrictions";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  route: string;
  hideOnIOS?: boolean;
  /** If true, show as disabled with tooltip instead of hiding */
  disabledOnIOS?: boolean;
}

const clientNavItemsConfig: NavItem[] = [
  { icon: Home, labelKey: "bottomNav.home", route: "/dashboard/client" },
  { icon: Search, labelKey: "bottomNav.discover", route: "/dashboard/client/find-coaches", disabledOnIOS: true },
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

interface MobileBottomNavProps {
  variant: "client" | "coach";
}

const MobileBottomNav = ({ variant }: MobileBottomNavProps) => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isIOSNative } = useIOSRestrictions();

  // Keep all items but mark iOS-disabled ones for rendering
  const navItems = useMemo(() => {
    if (variant === "coach") return coachNavItems;
    
    if (isIOSNative) {
      // Filter hideOnIOS but keep disabledOnIOS items
      return clientNavItemsConfig.filter(item => !item.hideOnIOS);
    }
    return clientNavItemsConfig;
  }, [variant, isIOSNative]);

  const isActive = (route: string) => {
    // Exact match for home routes
    if (route === "/dashboard/client" || route === "/dashboard/coach") {
      return location.pathname === route;
    }
    // Starts with for other routes
    return location.pathname.startsWith(route);
  };

  // Use CSS md:hidden for immediate visibility on mobile, with JS fallback
  // This ensures nav is visible before JS hydrates in PWA/Despia
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border",
        "md:hidden" // CSS-based hiding on desktop (≥768px)
      )}
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        // JS fallback for edge cases where CSS hasn't applied yet
        display: isMobile === false ? 'none' : undefined
      }}
      role="navigation"
      aria-label={t("bottomNav.mobileNavigation")}
    >
      <div className="flex items-center justify-around h-24 px-4">
        {navItems.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;
          const isDisabledOnIOS = isIOSNative && item.disabledOnIOS;

          if (isDisabledOnIOS) {
            return (
              <div
                key={item.route}
                className="flex flex-col items-center justify-center w-14 h-14 opacity-40 cursor-not-allowed"
                aria-label={`${t(item.labelKey)} (Web Only)`}
              >
                <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                <span className="text-[9px] text-muted-foreground mt-0.5">Web</span>
              </div>
            );
          }

          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={cn(
                "flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                "touch-manipulation",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={t(item.labelKey)}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
