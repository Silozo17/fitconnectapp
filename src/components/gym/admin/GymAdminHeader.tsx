import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { BreadcrumbNav } from "../ui/BreadcrumbNav";

interface GymAdminHeaderProps {
  onMenuToggle?: () => void;
}

export function GymAdminHeader({ onMenuToggle }: GymAdminHeaderProps) {
  const { gym, userRole } = useGym();
  const { user, signOut } = useAuth();
  const { gymId } = useParams<{ gymId: string }>();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const stripeStatus = gym?.stripe_account_status;
  const needsStripeSetup = !gym?.stripe_account_id || stripeStatus === "pending";

  // Generate breadcrumbs from path
  const generateBreadcrumbs = () => {
    const basePath = `/gym-admin/${gymId}`;
    const pathAfterBase = location.pathname.replace(basePath, "");
    const segments = pathAfterBase.split("/").filter(Boolean);

    const breadcrumbs = [{ label: gym?.name || "Gym", href: basePath }];

    const labelMap: Record<string, string> = {
      members: "Members",
      memberships: "Membership Plans",
      schedule: "Schedule",
      classes: "Classes",
      "check-ins": "Check-ins",
      staff: "Staff",
      settings: "Settings",
      analytics: "Analytics",
      payments: "Payments",
      invoices: "Invoices",
      marketing: "Marketing",
      leads: "Leads",
      referrals: "Referrals",
      locations: "Locations",
      products: "Products",
      pos: "Point of Sale",
      credits: "Credits",
      grading: "Grading",
      announcements: "Announcements",
      "activity-log": "Activity Log",
      contracts: "Contracts",
      automations: "Automations",
      reports: "Reports",
      "refund-requests": "Refund Requests",
    };

    let currentPath = basePath;
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isLast = index === segments.length - 1;
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  return (
    <header className="gym-content-header">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Breadcrumbs */}
        <BreadcrumbNav items={generateBreadcrumbs()} className="hidden sm:flex" />
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--gym-card-muted))]" />
          <Input
            type="search"
            placeholder="Search members, classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 h-9 bg-[hsl(var(--gym-content-bg))] border-[hsl(var(--gym-card-border))]"
          />
        </div>

        {/* Stripe Status */}
        {needsStripeSetup && (
          <Badge 
            variant="outline" 
            className="hidden sm:flex border-[hsl(var(--gym-warning))] text-[hsl(var(--gym-warning))] bg-[hsl(var(--gym-warning)/0.1)]"
          >
            <ExternalLink className="mr-1 h-3 w-3" />
            Complete Stripe setup
          </Badge>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-[hsl(var(--gym-card-muted))]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--gym-danger))]" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={undefined} alt={user?.email || "User"} />
                <AvatarFallback className="text-sm bg-[hsl(var(--gym-primary)/0.1)] text-[hsl(var(--gym-primary))]">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {userRole || "Staff"} at {gym?.name}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/coach/settings">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/gym-admin/${gym?.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Gym Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
