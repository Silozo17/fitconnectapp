import { Link, useLocation, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGym, useIsOwnerOrAreaManager, GymRole } from "@/contexts/GymContext";
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
  Package,
  FileBarChart,
  Receipt,
  ShoppingCart,
  Bot,
  ClipboardList,
  RefreshCcw,
  Briefcase,
  Target,
  TrendingUp,
  UserPlus,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationSwitcher } from "./LocationSwitcher";
import { CollapsibleNavSection } from "./CollapsibleNavSection";
import { usePendingRefundRequestsCount } from "@/hooks/gym/useGymRefundRequests";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  allowedRoles?: GymRole[];
}

export function GymAdminSidebar() {
  const { gymId } = useParams<{ gymId: string }>();
  const location = useLocation();
  const { gym, userRole } = useGym();
  const isOwnerOrAreaManager = useIsOwnerOrAreaManager();
  const { data: pendingRefundsCount } = usePendingRefundRequestsCount();

  const basePath = `/gym-admin/${gymId}`;

  // Operations section
  const operationsItems: NavItem[] = [
    { label: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
    { label: "Classes", href: `${basePath}/classes`, icon: Dumbbell },
    { label: "Check-ins", href: `${basePath}/check-ins`, icon: ScanLine },
    { 
      label: "POS", 
      href: `${basePath}/pos`, 
      icon: ShoppingCart,
      allowedRoles: ["owner", "area_manager", "manager", "staff"],
    },
  ];

  // Members section
  const membersItems: NavItem[] = [
    { label: "All Members", href: `${basePath}/members`, icon: Users },
    { 
      label: "Membership Plans", 
      href: `${basePath}/memberships`, 
      icon: CreditCard, 
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Credits", 
      href: `${basePath}/credits`, 
      icon: Wallet,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Grading", 
      href: `${basePath}/grading`, 
      icon: Award,
      allowedRoles: ["owner", "area_manager", "manager", "coach"],
    },
  ];

  // Team section
  const teamItems: NavItem[] = [
    { 
      label: "Staff", 
      href: `${basePath}/staff`, 
      icon: UserCog,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Announcements", 
      href: `${basePath}/announcements`, 
      icon: Newspaper,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Activity Log", 
      href: `${basePath}/activity-log`, 
      icon: ClipboardList,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
  ];

  // Business section (owner/area_manager only)
  const businessItems: NavItem[] = [
    { 
      label: "Analytics", 
      href: `${basePath}/analytics`, 
      icon: BarChart3,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Reports", 
      href: `${basePath}/reports`, 
      icon: FileBarChart,
      allowedRoles: ["owner", "area_manager", "manager"],
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
      label: "Refund Requests",
      href: `${basePath}/refund-requests`,
      icon: RefreshCcw,
      allowedRoles: ["owner", "area_manager", "manager"],
      badge: isOwnerOrAreaManager ? pendingRefundsCount || undefined : undefined,
    },
  ];

  // Marketing section
  const marketingItems: NavItem[] = [
    { 
      label: "Campaigns", 
      href: `${basePath}/marketing`, 
      icon: Megaphone,
      allowedRoles: ["owner", "area_manager", "marketing"],
    },
    { 
      label: "Leads", 
      href: `${basePath}/leads`, 
      icon: UserPlus,
      allowedRoles: ["owner", "area_manager", "marketing"],
    },
    { 
      label: "Referrals", 
      href: `${basePath}/referrals`, 
      icon: Target,
      allowedRoles: ["owner", "area_manager", "marketing"],
    },
  ];

  // Settings section (owner/area_manager only)
  const settingsItems: NavItem[] = [
    { 
      label: "Locations", 
      href: `${basePath}/locations`, 
      icon: MapPin,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Contracts", 
      href: `${basePath}/contracts`, 
      icon: FileText,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "Products", 
      href: `${basePath}/products`, 
      icon: Package,
      allowedRoles: ["owner", "area_manager", "manager"],
    },
    { 
      label: "Automations", 
      href: `${basePath}/automations`, 
      icon: Bot,
      allowedRoles: ["owner", "area_manager"],
    },
    { 
      label: "General", 
      href: `${basePath}/settings`, 
      icon: Cog,
      allowedRoles: ["owner", "area_manager"],
    },
  ];

  const filterByRole = (items: NavItem[]) => {
    if (!userRole) return [];
    
    return items.filter((item) => {
      if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
      return item.allowedRoles.includes(userRole);
    });
  };

  const isActive = (href: string) => {
    if (href === basePath) {
      return location.pathname === basePath;
    }
    // Use exact match for conflicting routes
    if (href.endsWith('/members') || href.endsWith('/memberships')) {
      return location.pathname === href || location.pathname.startsWith(href + '/');
    }
    return location.pathname.startsWith(href);
  };

  const hasActiveChild = (items: NavItem[]) => {
    return items.some(item => isActive(item.href));
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

  const filteredOperations = filterByRole(operationsItems);
  const filteredMembers = filterByRole(membersItems);
  const filteredTeam = filterByRole(teamItems);
  const filteredBusiness = filterByRole(businessItems);
  const filteredMarketing = filterByRole(marketingItems);
  const filteredSettings = filterByRole(settingsItems);

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
        <div className="space-y-2">
          {/* Dashboard - always visible at top */}
          <Link
            to={basePath}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(basePath) && location.pathname === basePath
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          {/* Operations Section */}
          {filteredOperations.length > 0 && (
            <CollapsibleNavSection
              title="Operations"
              icon={Briefcase}
              storageKey="operations"
              hasActiveChild={hasActiveChild(filteredOperations)}
              defaultOpen
            >
              {filteredOperations.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
          )}

          {/* Members Section */}
          {filteredMembers.length > 0 && (
            <CollapsibleNavSection
              title="Members"
              icon={Users}
              storageKey="members"
              hasActiveChild={hasActiveChild(filteredMembers)}
              defaultOpen
            >
              {filteredMembers.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
          )}

          {/* Team Section */}
          {filteredTeam.length > 0 && (
            <CollapsibleNavSection
              title="Team"
              icon={UserCog}
              storageKey="team"
              hasActiveChild={hasActiveChild(filteredTeam)}
            >
              {filteredTeam.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
          )}

          {/* Business Section */}
          {filteredBusiness.length > 0 && (
            <CollapsibleNavSection
              title="Business"
              icon={TrendingUp}
              storageKey="business"
              hasActiveChild={hasActiveChild(filteredBusiness)}
            >
              {filteredBusiness.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
          )}

          {/* Marketing Section */}
          {filteredMarketing.length > 0 && (
            <CollapsibleNavSection
              title="Marketing"
              icon={Megaphone}
              storageKey="marketing"
              hasActiveChild={hasActiveChild(filteredMarketing)}
            >
              {filteredMarketing.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
          )}

          {/* Settings Section */}
          {filteredSettings.length > 0 && (
            <CollapsibleNavSection
              title="Settings"
              icon={Settings}
              storageKey="settings"
              hasActiveChild={hasActiveChild(filteredSettings)}
            >
              {filteredSettings.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </CollapsibleNavSection>
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
