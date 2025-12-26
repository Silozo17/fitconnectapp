import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSelectedAvatar } from "@/hooks/useAvatars";
import { useAdminView } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { LogOut, Search, User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ViewSwitcher from "./ViewSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

const AdminHeader = ({ onMenuToggle }: AdminHeaderProps) => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { activeProfileType } = useAdminView();
  const avatarProfileType = activeProfileType === 'admin' ? 'client' : activeProfileType as 'client' | 'coach';
  const { data: selectedAvatar } = useSelectedAvatar(avatarProfileType);

  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b border-border bg-card pt-safe-status xl:static xl:pt-0">
      <div className="h-16 px-4 xl:px-6 flex items-center justify-between">
      {/* Left side - Feedback on mobile, Search on desktop */}
      <div className="flex items-center gap-3 flex-1">
        {/* Feedback - Left on mobile */}
        <div className="xl:hidden">
          <FeedbackModal />
        </div>

        {/* Search - Hidden on mobile */}
        <div className="hidden xl:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('users.search')}
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* View Switcher - Desktop only */}
        <div className="hidden xl:block">
          <ViewSwitcher />
        </div>
        
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
                  <p className="text-sm font-medium leading-none">{displayName || "Admin"}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <User className="h-4 w-4 mr-2" />
                {t('sidebar.myProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('sidebar.signOut')}
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
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      </div>
    </header>
  );
};

export default AdminHeader;