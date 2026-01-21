import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useAdminView } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { requestCloseMobileNav } from "@/lib/mobile-nav";
import { debugLogger } from "@/lib/debug-logger";

// Routes that exist in multiple views - maps route segment to which views support it
const ROUTE_EQUIVALENTS: Record<string, Record<string, boolean>> = {
  settings: { admin: true, coach: true, client: true },
  messages: { admin: false, coach: true, client: true },
  integrations: { admin: true, coach: true, client: true },
  notifications: { admin: true, coach: true, client: true },
  reviews: { admin: true, coach: true, client: false },
  achievements: { admin: false, coach: true, client: true },
  verification: { admin: true, coach: true, client: false },
  challenges: { admin: true, coach: false, client: true },
  plans: { admin: false, coach: true, client: true },
  connections: { admin: false, coach: true, client: true },
  progress: { admin: false, coach: false, client: true },
  habits: { admin: false, coach: false, client: true },
  profile: { admin: true, coach: true, client: true },
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User, Briefcase, Check, Plus, Loader2 } from "lucide-react";
import BecomeClientModal from "@/components/shared/BecomeClientModal";
import BecomeCoachModal from "@/components/shared/BecomeCoachModal";
import { FirstTimeTooltip } from "@/components/shared/FirstTimeTooltip";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const ViewSwitcher = () => {
  const { t } = useTranslation("admin");
  const { role } = useAuth();
  const {
    activeProfileType,
    availableProfiles,
    setActiveProfile,
    isLoadingProfiles,
  } = useAdminView();
  const navigate = useNavigate();
  const location = useLocation();
  const [becomeClientModalOpen, setBecomeClientModalOpen] = useState(false);
  const [becomeCoachModalOpen, setBecomeCoachModalOpen] = useState(false);

  // Extract current page from path: /dashboard/admin/settings → "settings"
  const getCurrentPage = (pathname: string): string | null => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 3 && segments[0] === 'dashboard') {
      return segments[2] || null;
    }
    return null;
  };

  // Determine if user is admin (can see admin view option)
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";

  // Check if user has multiple profiles (show tooltip only for them)
  const profileCount = 
    (availableProfiles.client ? 1 : 0) + 
    (availableProfiles.coach ? 1 : 0) + 
    (availableProfiles.admin ? 1 : 0);
  const hasMultipleProfiles = profileCount > 1;

  const [, startTransition] = useTransition();

  const handleViewChange = (value: string) => {
    // Check if trying to create a new profile - DON'T close nav for modal actions
    if (value === "create-client") {
      debugLogger.modal('BecomeClientModal', 'open', { trigger: 'ViewSwitcher' });
      setBecomeClientModalOpen(true);
      return;
    }
    if (value === "create-coach") {
      debugLogger.modal('BecomeCoachModal', 'open', { trigger: 'ViewSwitcher' });
      setBecomeCoachModalOpen(true);
      return;
    }

    // Only close mobile nav when actually navigating (not when opening modals)
    requestCloseMobileNav();

    const viewMode = value as "admin" | "client" | "coach";
    const profileId = availableProfiles[viewMode] || null;

    setActiveProfile(viewMode, profileId);

    // Get current page and check if it exists in target view
    const currentPage = getCurrentPage(location.pathname);
    
    const targetPath = currentPage && ROUTE_EQUIVALENTS[currentPage]?.[viewMode]
      ? `/dashboard/${viewMode}/${currentPage}`
      : `/dashboard/${viewMode}`;

    // Use startTransition so navigation doesn't block the UI (allows drawer to close first)
    startTransition(() => {
      navigate(targetPath);
    });
  };

  if (isLoadingProfiles) {
    return (
      <div className="w-[180px] h-10 flex items-center justify-center bg-card border border-border rounded-md">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectContent = (
    <Select value={activeProfileType} onValueChange={handleViewChange}>
      <SelectTrigger className="w-[180px] bg-card border-border">
        <SelectValue placeholder={t('viewSwitcher.selectView')} />
      </SelectTrigger>
      <SelectContent>
        {/* Admin View - Only for admin users */}
        {isAdminUser && (
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>{t('viewSwitcher.adminView')}</span>
              {availableProfiles.admin && (
                <Check className="w-3 h-3 text-green-500 ml-auto" />
              )}
            </div>
          </SelectItem>
        )}

        {/* Coach View */}
        {availableProfiles.coach ? (
          <SelectItem value="coach">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500" />
              <span>{t('viewSwitcher.coachView')}</span>
              <Check className="w-3 h-3 text-green-500 ml-auto" />
            </div>
          </SelectItem>
        ) : (
          <SelectItem value="create-coach">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange-500/50" />
              <span className="text-muted-foreground">{t('viewSwitcher.coachView')}</span>
              <Plus className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </SelectItem>
        )}

        {/* Client View */}
        {availableProfiles.client ? (
          <SelectItem value="client">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span>{t('viewSwitcher.clientView')}</span>
              <Check className="w-3 h-3 text-green-500 ml-auto" />
            </div>
          </SelectItem>
        ) : (
          <SelectItem value="create-client">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500/50" />
              <span className="text-muted-foreground">{t('viewSwitcher.clientView')}</span>
              <Plus className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );

  return (
    <>
      {hasMultipleProfiles ? (
        <FirstTimeTooltip
          storageKey={STORAGE_KEYS.VIEW_SWITCHER_TOOLTIP_SEEN}
          message="Switch between profiles! ⚡"
          position="bottom"
          showDelay={8500}
        >
          {selectContent}
        </FirstTimeTooltip>
      ) : (
        selectContent
      )}

      <BecomeClientModal
        open={becomeClientModalOpen}
        onOpenChange={setBecomeClientModalOpen}
      />

      <BecomeCoachModal
        open={becomeCoachModalOpen}
        onOpenChange={setBecomeCoachModalOpen}
      />
    </>
  );
};

export default ViewSwitcher;
