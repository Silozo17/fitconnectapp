import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGym, useCanManageGym, useCanViewFinancials, useIsOwnerOrAreaManager, GymRole } from "@/contexts/GymContext";
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
  ScanLine,
  Wallet,
  Newspaper,
  FileText,
  Zap,
  Package,
  FileBarChart,
  Receipt,
  ShoppingCart,
  Bot,
  ClipboardList,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationSwitcher } from "./LocationSwitcher";
import { usePendingRefundRequestsCount } from "@/hooks/gym/useGymRefundRequests";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  // Roles that can see this item. Empty = all roles
  allowedRoles?: GymRole[];
  // Hide from specific roles
  hiddenFromRoles?: GymRole[];
}

export function GymAdminSidebar() {
  const { gymId } = useParams<{ gymId: string }>();
  const location = useLocation();
  const { gym, userRole } = useGym();
  const canManage = useCanManageGym();
  const canViewFinancials = useCanViewFinancials();
  const isOwnerOrAreaManager = useIsOwnerOrAreaManager();
  const { data: pendingRefundsCount } = usePendingRefundRequestsCount();

  const basePath = `/gym-admin/${gymId}`;

  // Main navigation - visible to all staff
  const mainNavItems: NavItem[] = [
    { label: "Dashboard", href: basePath, icon: LayoutDashboard },
    { label: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
    { label: "Classes", href: `${basePath}/classes`, icon: Dumbbell },
    { label: "Members", href: `${basePath}/members`, icon: Users },
    { label: "Check-ins", href: `${basePath}/check-ins`, icon: ScanLine },
  ];

  // Management section - role-specific access
  const managementNavItems: NavItem[] = [
    { 
      label: "Memberships", 
      href: `${basePath}/memberships`, 
      icon: CreditCard, 
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Credits", 
      href: `${basePath}/credits`, 
      icon: CreditCard,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Contracts", 
      href: `${basePath}/contracts`, 
      icon: FileText,
      allowedRoles: ["owner", "area_manager"], // Hidden from managers
    },
    { 
      label: "Grading", 
      href: `${basePath}/grading`, 
      icon: Award,
      allowedRoles: ["owner", "area_manager", "manager", "coach"],
    },
    { 
      label: "Staff", 
      href: `${basePath}/staff`, 
      icon: UserCog,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Locations", 
      href: `${basePath}/locations`, 
      icon: MapPin,
      allowedRoles: ["owner", "area_manager"], // Hidden from managers
    },
    { 
      label: "Products", 
      href: `${basePath}/products`, 
      icon: Package,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
  ];

  // Business section - mostly owner/area_manager only
  const businessNavItems: NavItem[] = [
    { 
      label: "Analytics", 
      href: `${basePath}/analytics`, 
      icon: BarChart3,
      allowedRoles: ["owner", "area_manager"], // Hidden from managers
    },
    { 
      label: "Reports", 
      href: `${basePath}/reports`, 
      icon: FileBarChart,
      allowedRoles: ["owner", "area_manager", "manager"], // Managers get limited reports
    },
    { 
      label: "Payments", 
      href: `${basePath}/payments`, 
      icon: Wallet,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Invoices", 
      href: `${basePath}/invoices`, 
      icon: Receipt,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "POS", 
      href: `${basePath}/pos`, 
      icon: ShoppingCart,
      allowedRoles: ["owner", "area_manager", "manager", "staff"],
    },
    {
      label: "Refund Requests",
      href: `${basePath}/refund-requests`,
      icon: RefreshCcw,
      allowedRoles: ["owner", "area_manager", "manager"],
      badge: isOwnerOrAreaManager ? pendingRefundsCount || undefined : undefined,
    },
    { 
      label: "Activity Log", 
      href: `${basePath}/activity-log`, 
      icon: ClipboardList,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Announcements", 
      href: `${basePath}/announcements`, 
      icon: Newspaper,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Marketing", 
      href: `${basePath}/marketing`, 
      icon: Megaphone,
      allowedRoles: ["owner", "area_manager", "marketing"],
    },
    { 
      label: "Automation", 
      href: `${basePath}/automation`, 
      icon: Zap,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Automations", 
      href: `${basePath}/automations`, 
      icon: Bot,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Settings", 
      href: `${basePath}/settings`, 
      icon: Settings,
      allowedRoles: ["owner", "area_manager"], // Hidden from managers
    },
  ];

  const filterByRole = (items: NavItem[]) => {
    if (!userRole) return [];
    
    return items.filter((item) => {
      // If no role restrictions, show to all
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      
      // Check if user's role is in the allowed list
      return item.allowedRoles.includes(userRole);
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

  const getRoleDisplayName = (role: GymRole | null) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "area_manager":
        return "Area Manager";
      case "manager":
        return "Manager";
      case "coach":
        return "Coach";
      case "marketing":
        return "Marketing";
      case "staff":
        return "Staff";
      default:
        return "Staff";
    }
  };

  const filteredManagementItems = filterByRole(managementNavItems);
  const filteredBusinessItems = filterByRole(businessNavItems);

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
          <p className="truncate text-xs text-muted-foreground">
            {getRoleDisplayName(userRole)}
          </p>
        </div>
      </div>
      
      {/* Location Switcher - Only for owner/area_manager */}
      {isOwnerOrAreaManager && (
        <div className="border-b px-3 py-2">
          <LocationSwitcher />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation - visible to all */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Management Section */}
          {filteredManagementItems.length > 0 && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Management
              </p>
              <div className="space-y-1">
                {filteredManagementItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Business Section */}
          {filteredBusinessItems.length > 0 && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business
              </p>
              <div className="space-y-1">
                {filteredBusinessItems.map((item) => (
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
