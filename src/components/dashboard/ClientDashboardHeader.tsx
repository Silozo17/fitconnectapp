import { useTranslation } from "react-i18next";
import { Search, LogOut, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface ClientDashboardHeaderProps {
  onMenuToggle: () => void;
}

const ClientDashboardHeader = ({ onMenuToggle }: ClientDashboardHeaderProps) => {
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { availableProfiles } = useAdminView();
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('client');

  const hasMultipleProfiles = 
    (availableProfiles.client ? 1 : 0) + 
    (availableProfiles.coach ? 1 : 0) + 
    (availableProfiles.admin ? 1 : 0) > 1;

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 glass-premium border-b border-border/30 xl:static pt-safe-status xl:pt-0"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="flex items-center justify-between min-h-16 h-auto xl:h-16 px-4 xl:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3 flex-1">
          <div className="xl:hidden">
            <FeedbackModal />
          </div>
          <div className="hidden xl:flex flex-1 max-w-md" role="search">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('header.search')}
                className="pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {(role === "admin" || hasMultipleProfiles) && (
            <div className="hidden xl:block">
              <ViewSwitcher />
            </div>
          )}
          <div className="hidden xl:block">
            <FeedbackModal />
          </div>
          <div className="hidden xl:block">
            <NotificationCenter />
          </div>
          <TooltipProvider>
            <div className="hidden xl:flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl"
                    onClick={() => navigate("/dashboard/profile")}
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
                    onClick={signOut}
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
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ClientDashboardHeader;
