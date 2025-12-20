import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, Calendar, MessageSquare, User, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEnvironment } from "@/hooks/useEnvironment";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  route: string;
}

const clientNavItems: NavItem[] = [
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

interface MobileBottomNavProps {
  variant: "client" | "coach";
}

const MobileBottomNav = ({ variant }: MobileBottomNavProps) => {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isPWA, isNativeApp } = useEnvironment();

  // Only show on mobile AND in PWA/native app context
  const showBottomNav = isMobile && (isPWA || isNativeApp);

  if (!showBottomNav) {
    return null;
  }

  const navItems = variant === "client" ? clientNavItems : coachNavItems;

  const isActive = (route: string) => {
    // Exact match for home routes
    if (route === "/dashboard/client" || route === "/dashboard/coach") {
      return location.pathname === route;
    }
    // Starts with for other routes
    return location.pathname.startsWith(route);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom"
      role="navigation"
      aria-label={t("bottomNav.mobileNavigation")}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;

          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                "min-w-[64px] touch-manipulation",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={active ? "page" : undefined}
              aria-label={t(item.labelKey)}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={cn(
                "text-[10px] font-medium truncate max-w-full",
                active && "font-semibold"
              )}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
