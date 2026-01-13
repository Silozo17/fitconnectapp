import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGym, useCanManageGym, useCanViewFinancials } from "@/contexts/GymContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Dumbbell,
  CreditCard,
  Settings,
  BarChart3,
  Megaphone,
  Award,
  MapPin,
  UserCog,
  ChevronLeft,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  requiredPermission?: "manage" | "financials";
}

export function GymAdminSidebar() {
  const { gymId } = useParams<{ gymId: string }>();
  const location = useLocation();
  const { gym, userRole } = useGym();
  const canManage = useCanManageGym();
  const canViewFinancials = useCanViewFinancials();

  const basePath = `/gym-admin/${gymId}`;

  const mainNavItems: NavItem[] = [
    { label: "Dashboard", href: basePath, icon: LayoutDashboard },
    { label: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
    { label: "Classes", href: `${basePath}/classes`, icon: Dumbbell },
    { label: "Members", href: `${basePath}/members`, icon: Users },
  ];

  const managementNavItems: NavItem[] = [
    { label: "Memberships", href: `${basePath}/memberships`, icon: CreditCard, requiredPermission: "manage" },
    { label: "Grading", href: `${basePath}/grading`, icon: Award },
    { label: "Staff", href: `${basePath}/staff`, icon: UserCog, requiredPermission: "manage" },
    { label: "Locations", href: `${basePath}/locations`, icon: MapPin, requiredPermission: "manage" },
  ];

  const businessNavItems: NavItem[] = [
    { label: "Reports", href: `${basePath}/reports`, icon: BarChart3, requiredPermission: "financials" },
    { label: "Billing", href: `${basePath}/billing`, icon: CreditCard, requiredPermission: "financials" },
    { label: "Marketing", href: `${basePath}/marketing`, icon: Megaphone, requiredPermission: "manage" },
    { label: "Settings", href: `${basePath}/settings`, icon: Settings, requiredPermission: "manage" },
  ];

  const filterByPermission = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.requiredPermission) return true;
      if (item.requiredPermission === "manage") return canManage;
      if (item.requiredPermission === "financials") return canViewFinancials;
      return true;
    });
  };

  const isActive = (href: string) => {
    if (href === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(href);
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Gym Header */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={gym?.logo_url || undefined} alt={gym?.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <h2 className="truncate font-semibold">{gym?.name || "Loading..."}</h2>
          <p className="truncate text-xs text-muted-foreground capitalize">{userRole || "Staff"}</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Management Section */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Management
            </p>
            <div className="space-y-1">
              {filterByPermission(managementNavItems).map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* Business Section */}
          {filterByPermission(businessNavItems).length > 0 && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business
              </p>
              <div className="space-y-1">
                {filterByPermission(businessNavItems).map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/coach/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to FitConnect
          </Link>
        </Button>
      </div>
    </div>
  );
}
