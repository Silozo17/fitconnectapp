import { useTranslation } from "react-i18next";
import { Search, LogOut, User, Menu } from "lucide-react";
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
  const { displayName, avatarUrl } = useUserProfile();
  const { data: selectedAvatar } = useSelectedAvatar('client');

  return (
    <header 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
      role="banner"
      aria-label="Dashboard header"
    >
      <div className="flex items-center justify-between h-16 px-4 xl:px-6">
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

          {/* Search - Hidden on mobile */}
          <div className="hidden xl:flex flex-1 max-w-md" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('header.search')}
                className="pl-10 bg-muted/50 border-transparent focus:border-primary"
                aria-label={t('header.searchDashboard')}
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Admin View Switcher */}
          {role === "admin" && <ViewSwitcher />}
          
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
                  className="flex items-center gap-2 p-1 pt-5 overflow-visible bg-transparent hover:bg-transparent"
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
                  <span className="hidden md:block font-medium">{displayName || t('header.roleClient')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{displayName || t('header.roleClient')}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {t('header.roleClient')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  {t('header.myProfile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientDashboardHeader;
