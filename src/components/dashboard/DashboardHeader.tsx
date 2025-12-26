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
      className="fixed top-0 left-0 right-0 z-30 glass-premium border-b border-border/30 pt-safe-status xl:static xl:pt-0"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="h-16 px-4 xl:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3 flex-1">
          <div className="xl:hidden">
            <FeedbackModal />
          </div>
          <div className="hidden xl:flex flex-1 max-w-md" role="search">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('header.searchClients')}
                className="pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {(role === "admin" || role === "manager" || role === "staff" || role === "coach") && (
            <div className="hidden xl:block">
              <ViewSwitcher />
            </div>
          )}
          <span className="hidden xl:inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
            {tierLabel}
          </span>
          <div className="hidden xl:block">
            <FeedbackModal />
          </div>
          <div className="hidden xl:block">
            <NotificationCenter />
          </div>
          <div className="hidden xl:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5 h-auto rounded-xl">
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
              <DropdownMenuContent className="w-56 rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName || t('header.roleCoach')}</p>
                    <p className="text-xs text-muted-foreground">{tierLabel} Plan</p>
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
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
