import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Helper to extract view mode from URL path
const getViewModeFromPath = (pathname: string): ViewMode | null => {
  const match = pathname.match(/^\/dashboard\/(admin|coach|client)/);
  return match ? (match[1] as ViewMode) : null;
};

type ViewMode = "admin" | "client" | "coach";

interface AvailableProfiles {
  admin?: string;
  client?: string;
  coach?: string;
}

interface AdminContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  availableProfiles: AvailableProfiles;
  activeProfileType: ViewMode;
  activeProfileId: string | null;
  setActiveProfile: (type: ViewMode, profileId: string | null) => void;
  isLoadingProfiles: boolean;
  refreshProfiles: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = "admin_active_role";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfiles>({});
  const [activeProfileType, setActiveProfileType] = useState<ViewMode>("admin");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const canSwitchRoles = isAdminUser || role === "coach";

  // Fetch all profiles for the user
  const fetchProfiles = async () => {
    if (!user?.id) {
      setIsLoadingProfiles(false);
      return;
    }

    // For clients who can't switch roles, set their profile type correctly
    if (!canSwitchRoles) {
      if (role === "client") {
        setActiveProfileType("client");
        setViewMode("client");
        // Fetch their client profile ID for messaging
        const { data } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data?.id) {
          setActiveProfileId(data.id);
          setAvailableProfiles({ client: data.id });
        }
      }
      setIsLoadingProfiles(false);
      return;
    }

    setIsLoadingProfiles(true);

    try {
      const [adminResult, clientResult, coachResult] = await Promise.all([
        supabase
          .from("admin_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("coach_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const profiles: AvailableProfiles = {};

      if (adminResult.data?.id) {
        profiles.admin = adminResult.data.id;
      }
      if (clientResult.data?.id) {
        profiles.client = clientResult.data.id;
      }
      if (coachResult.data?.id) {
        profiles.coach = coachResult.data.id;
      }

      setAvailableProfiles(profiles);

      // Determine default role based on user type
      const defaultType: ViewMode = isAdminUser ? "admin" : "coach";
      const defaultProfileId = isAdminUser ? profiles.admin : profiles.coach;

      // Priority: URL path > localStorage > default
      const pathViewMode = getViewModeFromPath(location.pathname);
      const savedRole = localStorage.getItem(STORAGE_KEY);
      
      // Check if URL path specifies a valid view mode
      if (pathViewMode) {
        const hasAccessToPath = pathViewMode === "admin" 
          ? isAdminUser 
          : !!profiles[pathViewMode];
        
        if (hasAccessToPath) {
          const pathProfileId = profiles[pathViewMode] || null;
          setActiveProfileType(pathViewMode);
          setActiveProfileId(pathProfileId);
          setViewMode(pathViewMode);
          // Update localStorage to match URL
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: pathViewMode, profileId: pathProfileId }));
          return;
        }
      }
      
      // Fallback to localStorage if no valid URL path
      if (savedRole) {
        try {
          const { type, profileId } = JSON.parse(savedRole);
          // Validate saved role is available and appropriate for user type
          const isValidSavedRole = profiles[type as ViewMode] && 
            (isAdminUser || type !== "admin"); // Non-admins can't switch to admin
          
          if (isValidSavedRole) {
            setActiveProfileType(type);
            setActiveProfileId(profileId);
            setViewMode(type);
            return;
          }
        } catch {
          // Invalid saved role, fall through to default
        }
      }
      
      // Default based on user type
      setActiveProfileType(defaultType);
      setActiveProfileId(defaultProfileId || null);
      setViewMode(defaultType);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user?.id, canSwitchRoles]);

  // Sync context with URL when route changes (handles browser back/forward, direct URL navigation)
  useEffect(() => {
    if (isLoadingProfiles) return;
    
    const pathViewMode = getViewModeFromPath(location.pathname);
    
    // Only sync if we're on a dashboard route and it differs from current context
    if (pathViewMode && pathViewMode !== activeProfileType) {
      const hasAccess = pathViewMode === "admin" 
        ? isAdminUser 
        : !!availableProfiles[pathViewMode];
      
      if (hasAccess) {
        const profileId = availableProfiles[pathViewMode] || null;
        setActiveProfileType(pathViewMode);
        setActiveProfileId(profileId);
        setViewMode(pathViewMode);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ type: pathViewMode, profileId }));
      }
    }
  }, [location.pathname, availableProfiles, isLoadingProfiles, isAdminUser]);

  const setActiveProfile = (type: ViewMode, profileId: string | null) => {
    setActiveProfileType(type);
    setActiveProfileId(profileId);
    setViewMode(type);

    // Persist preference
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ type, profileId })
    );
  };

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  return (
    <AdminContext.Provider
      value={{
        viewMode,
        setViewMode,
        availableProfiles,
        activeProfileType,
        activeProfileId,
        setActiveProfile,
        isLoadingProfiles,
        refreshProfiles,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminView = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminView must be used within an AdminProvider");
  }
  return context;
};
