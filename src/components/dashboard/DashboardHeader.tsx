import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, User, LogOut, Menu } from "lucide-react";
import UpgradeIconButton from "./UpgradeIconButton";
import { UpgradeDrawer } from "@/components/subscription/UpgradeDrawer";
import { UpgradeSuggestionTooltip } from "@/components/subscription/UpgradeSuggestionTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/components/shared/UserAvatar";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { SupportChatButton } from "@/components/support/SupportChatButton";
import { normalizeTier, SUBSCRIPTION_TIERS } from "@/lib/stripe-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface DashboardHeaderProps {
  subscriptionTier?: string | null;
  coachId?: string;
  onMenuToggle: () => void;
}

const DashboardHeader = memo(({ subscriptionTier, coachId, onMenuToggle }: DashboardHeaderProps) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { availableProfiles } = useAdminView();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('coach');
  const [upgradeDrawerOpen, setUpgradeDrawerOpen] = useState(false);

  const tierLabel = useMemo(() => {
    const normalizedTier = normalizeTier(subscriptionTier);
    return SUBSCRIPTION_TIERS[normalizedTier]?.name || "Free";
  }, [subscriptionTier]);

  const handleProfileClick = useCallback(() => navigate("/dashboard/my-profile"), [navigate]);
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-30 glass-premium border-b border-border/30 xl:static pt-safe-status xl:pt-0"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="min-h-16 h-auto xl:h-16 px-4 xl:px-6 flex items-center justify-between">
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
          {(role === "admin" || role === "manager" || role === "staff" || role === "coach" || availableProfiles.gym?.length) && (
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
            <SupportChatButton />
          </div>
          <TooltipProvider>
            <div className="hidden xl:flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl"
                    onClick={handleProfileClick}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('header.myProfile')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('header.signOut')}</TooltipContent>
              </Tooltip>
              <UserAvatar
                src={avatarUrl}
                avatarSlug={selectedAvatar?.slug}
                avatarRarity={selectedAvatar?.rarity as any}
                name={displayName}
                variant="squircle"
                size="xs"
                className="ml-1"
              />
            </div>
          </TooltipProvider>
          <UpgradeSuggestionTooltip>
            <UpgradeIconButton onClick={() => setUpgradeDrawerOpen(true)} />
          </UpgradeSuggestionTooltip>
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Upgrade Drawer */}
      <UpgradeDrawer 
        open={upgradeDrawerOpen} 
        onOpenChange={setUpgradeDrawerOpen}
        coachId={coachId}
      />
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";

export default DashboardHeader;
