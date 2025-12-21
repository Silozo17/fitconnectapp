import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, Calendar, MessageSquare, User, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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

  // Show on all mobile screens (browser, PWA, native)
  if (!isMobile) {
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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label={t("bottomNav.mobileNavigation")}
    >
      <div className="flex items-center justify-around h-24 px-4">
        {navItems.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;

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
