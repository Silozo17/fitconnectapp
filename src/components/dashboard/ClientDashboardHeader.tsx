import { useTranslation } from "react-i18next";
import { Search, LogOut, User, Menu, MessageSquarePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminView } from "@/contexts/AdminContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

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

  // Show ViewSwitcher when user has multiple profiles (coach + client, admin + any, etc.)
  const hasMultipleProfiles = 
    (availableProfiles.client ? 1 : 0) + 
    (availableProfiles.coach ? 1 : 0) + 
    (availableProfiles.admin ? 1 : 0) > 1;

  return (
    <header 
      className="sticky top-0 z-40 glass-premium border-b border-border/30"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="flex items-center justify-between h-16 px-4 xl:px-6">
        {/* Left side - Feedback on mobile, Search on desktop */}
        <div className="flex items-center gap-3 flex-1">
          {/* Feedback - Left on mobile, hidden on mobile (shown on right on desktop) */}
          <div className="xl:hidden">
            <FeedbackModal />
          </div>

          {/* Search - Hidden on mobile - Premium floating design */}
          <div className="hidden xl:flex flex-1 max-w-md" role="search">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('header.search')}
                className="pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl focus:border-primary focus:bg-secondary/80 transition-all"
                aria-label={t('header.searchDashboard')}
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Switcher - Desktop only */}
          {(role === "admin" || hasMultipleProfiles) && (
            <div className="hidden xl:block">
              <ViewSwitcher />
            </div>
          )}
          
          {/* Feedback - Desktop only */}
          <div className="hidden xl:block">
            <FeedbackModal />
          </div>
          
          {/* Notifications - Desktop only */}
          <div className="hidden xl:block">
            <NotificationCenter />
          </div>

          {/* Profile Dropdown - Hidden on mobile */}
          <div className="hidden xl:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-3 px-2 py-1.5 h-auto rounded-xl hover:bg-secondary/80 transition-all"
                  aria-label={`Account menu for ${displayName || t('header.roleClient')}`}
                >
                  <UserAvatar
                    src={avatarUrl}
                    avatarSlug={selectedAvatar?.slug}
                    avatarRarity={selectedAvatar?.rarity as any}
                    name={displayName}
                    variant="squircle"
                    size="xs"
                  />
                  <span className="hidden md:block font-medium text-sm">{displayName || t('header.roleClient')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-float-md">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{displayName || t('header.roleClient')}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {t('header.roleClient')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  {t('header.myProfile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive rounded-lg">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger - Right side */}
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
        </div>
      </div>
    </header>
  );
};

export default ClientDashboardHeader;