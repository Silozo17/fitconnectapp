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
  Target,
  TrendingUp,
  UserPlus,
  Cog,
  ChevronDown,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationSwitcher } from "./LocationSwitcher";
import { usePendingRefundRequestsCount } from "@/hooks/gym/useGymRefundRequests";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  allowedRoles?: GymRole[];
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface GymAdminSidebarProps {
  onClose?: () => void;
}

export function GymAdminSidebar({ onClose }: GymAdminSidebarProps) {
  const { gymId } = useParams<{ gymId: string }>();
  const location = useLocation();
  const { gym, userRole } = useGym();
  const isOwnerOrAreaManager = useIsOwnerOrAreaManager();
  const { data: pendingRefundsCount } = usePendingRefundRequestsCount();

  const basePath = `/gym-admin/${gymId}`;

  // Define all navigation sections
  const sections: NavSection[] = [
    {
      title: "Operations",
      icon: Calendar,
      defaultOpen: true,
      items: [
        { label: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
        { label: "Classes", href: `${basePath}/classes`, icon: Dumbbell },
        { label: "Check-ins", href: `${basePath}/check-ins`, icon: ScanLine },
        { 
          label: "POS", 
          href: `${basePath}/pos`, 
          icon: ShoppingCart,
          allowedRoles: ["owner", "area_manager", "manager", "staff"],
        },
      ],
    },
    {
      title: "Members",
      icon: Users,
      defaultOpen: true,
      items: [
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
      ],
    },
    {
      title: "Team",
      icon: UserCog,
      items: [
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
      ],
    },
    {
      title: "Business",
      icon: TrendingUp,
      items: [
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
      ],
    },
    {
      title: "Marketing",
      icon: Megaphone,
      items: [
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
      ],
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
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
      ],
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
    if (href.endsWith('/members') || href.endsWith('/memberships')) {
      return location.pathname === href || location.pathname.startsWith(href + '/');
    }
    return location.pathname.startsWith(href);
  };

  const hasActiveChild = (items: NavItem[]) => {
    return items.some(item => isActive(item.href));
  };

  const getRoleDisplayName = (role: GymRole | null) => {
    const roleNames: Record<GymRole, string> = {
      owner: "Owner",
      area_manager: "Area Manager",
      manager: "Manager",
      coach: "Coach",
      marketing: "Marketing",
      staff: "Staff",
    };
    return role ? roleNames[role] : "Staff";
  };

  return (
    <div className="gym-sidebar flex h-full w-64 flex-col">
      {/* Header */}
      <div className="gym-sidebar-header">
        <Avatar className="h-10 w-10">
          <AvatarImage src={gym?.logo_url || undefined} alt={gym?.name} />
          <AvatarFallback className="gym-sidebar-logo">
            <Building2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="gym-sidebar-title">{gym?.name || "Loading..."}</h2>
          <p className="gym-sidebar-subtitle">{getRoleDisplayName(userRole)}</p>
        </div>
        {/* Mobile close button */}
        <button 
          className="md:hidden p-1.5 rounded-lg hover:bg-[hsl(var(--gym-sidebar-hover-bg))] transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Location Switcher */}
      {isOwnerOrAreaManager && (
        <div className="px-3 py-2 border-b border-[hsl(var(--gym-sidebar-border))]">
          <LocationSwitcher />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="gym-sidebar-nav flex-1">
        <div className="space-y-1">
          {/* Dashboard - always at top */}
          <Link
            to={basePath}
            className={cn(
              "gym-sidebar-item",
              isActive(basePath) && location.pathname === basePath && "active"
            )}
            onClick={onClose}
          >
            <LayoutDashboard className="gym-sidebar-icon" />
            <span>Dashboard</span>
          </Link>

          {/* Navigation Sections */}
          {sections.map((section) => {
            const filteredItems = filterByRole(section.items);
            if (filteredItems.length === 0) return null;

            const sectionHasActive = hasActiveChild(filteredItems);

            return (
              <NavSection
                key={section.title}
                section={section}
                items={filteredItems}
                isActive={isActive}
                hasActiveChild={sectionHasActive}
                onItemClick={onClose}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[hsl(var(--gym-sidebar-border))]">
        <Link
          to="/coach/dashboard"
          className="gym-sidebar-item"
        >
          <ChevronLeft className="gym-sidebar-icon" />
          <span>Back to FitConnect</span>
        </Link>
      </div>
    </div>
  );
}

// Collapsible Nav Section Component
function NavSection({
  section,
  items,
  isActive,
  hasActiveChild,
  onItemClick,
}: {
  section: NavSection;
  items: NavItem[];
  isActive: (href: string) => boolean;
  hasActiveChild: boolean;
  onItemClick?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen || hasActiveChild);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="gym-sidebar-item justify-between group">
          <div className="flex items-center gap-3">
            <section.icon className="gym-sidebar-icon" />
            <span>{section.title}</span>
          </div>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 pl-3 border-l border-[hsl(var(--gym-sidebar-border))] space-y-0.5 mt-1">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "gym-sidebar-item py-2",
                isActive(item.href) && "active"
              )}
              onClick={onItemClick}
            >
              <item.icon className="gym-sidebar-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="gym-sidebar-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
