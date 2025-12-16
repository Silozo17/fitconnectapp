import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/UserAvatar";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface DashboardHeaderProps {
  displayName?: string | null;
  subscriptionTier?: string | null;
  profileImageUrl?: string | null;
}

const DashboardHeader = ({ displayName, subscriptionTier, profileImageUrl }: DashboardHeaderProps) => {
  const { signOut, role } = useAuth();

  const tierLabel = subscriptionTier === "elite" ? "Elite" : subscriptionTier === "pro" ? "Pro" : "Free";

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, sessions..."
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Role Switcher - for admins and coaches */}
          {(role === "admin" || role === "manager" || role === "staff" || role === "coach") && <ViewSwitcher />}
          
          {/* Subscription Tier */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
            {tierLabel}
          </span>

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <UserAvatar
                  src={profileImageUrl}
                  name={displayName}
                  className="h-10 w-10"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName || "Coach"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {tierLabel} Plan
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
