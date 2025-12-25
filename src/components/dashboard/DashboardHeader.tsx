import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { normalizeTier, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";

interface DashboardHeaderProps {
  subscriptionTier?: string | null;
  onMenuToggle: () => void;
}

const DashboardHeader = memo(({ subscriptionTier, onMenuToggle }: DashboardHeaderProps) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');

  const tierLabel = useMemo(() => {
    const normalizedTier = normalizeTier(subscriptionTier);
    return SUBSCRIPTION_TIERS[normalizedTier]?.name || "Free";
  }, [subscriptionTier]);

  const handleProfileClick = useCallback(() => navigate("/dashboard/profile"), [navigate]);
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <header 
      className="h-16 glass-premium border-b border-border/30 sticky top-0 z-30"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="h-full px-4 xl:px-6 flex items-center justify-between">
        {/* Left side - Hamburger + Search (search hidden on mobile) */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </Button>

          {/* Search - Hidden on mobile - Premium floating design */}
          <div className="hidden xl:flex flex-1 max-w-md" role="search">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('header.searchClients')}
                className="pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus:bg-secondary/80 transition-all"
                aria-label={t('header.searchDashboard')}
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher - for admins and coaches */}
          {(role === "admin" || role === "manager" || role === "staff" || role === "coach") && <ViewSwitcher />}
          
          {/* Subscription Tier - Premium pill design */}
          <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
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
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 px-2 py-1.5 h-auto rounded-xl hover:bg-secondary/80 transition-all"
                  aria-label={`Account menu for ${displayName || "Coach"}`}
                >
                  <UserAvatar
                    src={avatarUrl}
                    avatarSlug={selectedAvatar?.slug}
                    avatarRarity={selectedAvatar?.rarity as any}
                    name={displayName}
                    variant="squircle"
                    size="xs"
                  />
                  <span className="hidden md:block font-medium text-sm">{displayName || t('header.roleCoach')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-xl shadow-float-md" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName || t('header.roleCoach')}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {tierLabel} Plan
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="rounded-lg">
                  <User className="h-4 w-4 mr-2" />
                  {t('header.myProfile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('header.signOut')}
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
