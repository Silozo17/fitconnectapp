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
  const navigate = useNavigate();
  const { signOut, role } = useAuth();
  const { displayName, avatarUrl } = useUserProfile();
  const { activeProfileType } = useAdminView();
  const avatarProfileType = activeProfileType === 'admin' ? 'client' : activeProfileType as 'client' | 'coach';
  const { data: selectedAvatar } = useSelectedAvatar(avatarProfileType);

  return (
    <header className="h-16 border-b border-border bg-card px-4 xl:px-6 flex items-center justify-between sticky top-0 z-10">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, coaches..."
              className="pl-10 bg-background"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ViewSwitcher />
        
        <FeedbackModal />
        
        <NotificationCenter />

        {/* Profile Dropdown - Hidden on mobile */}
        <div className="hidden xl:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <UserAvatar
                  src={avatarUrl}
                  avatarSlug={selectedAvatar?.slug}
                  avatarRarity={selectedAvatar?.rarity as any}
                  name={displayName}
                  className="h-10 w-10"
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
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
