import { memo, useCallback, useMemo } from "react";
import { Search, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { useNavigate } from "react-router-dom";
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
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

interface DashboardHeaderProps {
  subscriptionTier?: string | null;
  onMenuToggle: () => void;
}

const DashboardHeader = memo(({ subscriptionTier, onMenuToggle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');

  const tierLabel = useMemo(() => 
    subscriptionTier === "elite" ? "Elite" : subscriptionTier === "pro" ? "Pro" : "Free",
    [subscriptionTier]
  );

  const handleProfileClick = useCallback(() => navigate("/dashboard/profile"), [navigate]);
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="h-full px-4 xl:px-6 flex items-center justify-between">
        {/* Left side - Hamburger + Search (search hidden on mobile) */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search - Hidden on mobile */}
          <div className="hidden xl:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, sessions..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Switcher - for admins and coaches */}
          {(role === "admin" || role === "manager" || role === "staff" || role === "coach") && <ViewSwitcher />}
          
          {/* Subscription Tier */}
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
            {tierLabel}
          </span>

          {/* Feedback */}
          <FeedbackModal />

          {/* Notifications */}
          <NotificationCenter />

          {/* Profile Dropdown - Hidden on mobile */}
          <div className="hidden xl:block">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto p-0 pt-4 overflow-visible bg-transparent hover:bg-transparent">
                <UserAvatar
                  src={avatarUrl}
                  avatarSlug={selectedAvatar?.slug}
                  avatarRarity={selectedAvatar?.rarity as any}
                  name={displayName}
                  variant="squircle"
                  size="xs"
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
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
