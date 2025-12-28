import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";
import {
  ViewMode,
  getSavedViewState,
  saveViewState,
  clearViewState,
  getViewModeFromPath,
  validateRouteForRole,
} from "@/lib/view-restoration";

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

/**
 * Get the default view mode based on user role (used when no saved preference exists)
 */
const getDefaultViewModeForRole = (role: string | null): ViewMode => {
  if (role === "client") return "client";
  if (role === "coach") return "coach";
  return "admin"; // admins, managers, staff
};

/**
 * Get initial view mode - checks saved preference first, falls back to role default.
 * CRITICAL: This must run AFTER role is known to validate saved preference.
 */
const getValidatedViewMode = (role: string | null): ViewMode => {
  // Check saved preference
  const savedState = getSavedViewState();
  if (savedState) {
    const savedRoute = `/dashboard/${savedState.type}`;
    if (validateRouteForRole(savedRoute, role)) {
      return savedState.type;
    }
  }
  
  // Fall back to role default
  return getDefaultViewModeForRole(role);
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const canSwitchRoles = isAdminUser || role === "coach";

  // Initialize with client as safe default - will be updated once role is known
  const [viewMode, setViewModeState] = useState<ViewMode>("client");
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfiles>({});
  const [activeProfileType, setActiveProfileType] = useState<ViewMode>("client");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [hasInitializedFromRole, setHasInitializedFromRole] = useState(false);
  
  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setActiveProfileType("client");
      setActiveProfileId(null);
      setViewModeState("client");
      setAvailableProfiles({});
      setIsLoadingProfiles(false);
      setHasInitializedFromRole(false);
      clearViewState();
    }
  }, [user]);
  
  // CRITICAL: Initialize view mode AFTER role becomes available
  // This fixes the race condition where saved preference was read before role validation was possible
  useEffect(() => {
    if (!user || !role || hasInitializedFromRole) return;
    
    const isNativeApp = isDespia();
    
    // For native apps, check saved preference and validate against role
    if (isNativeApp && canSwitchRoles) {
      const validatedView = getValidatedViewMode(role);
      setActiveProfileType(validatedView);
      setViewModeState(validatedView);
      // Save to ensure consistency
      saveViewState(validatedView);
    } else {
      // Non-native or can't switch roles - use role default
      const defaultView = getDefaultViewModeForRole(role);
      setActiveProfileType(defaultView);
      setViewModeState(defaultView);
    }
    
    setHasInitializedFromRole(true);
  }, [user, role, canSwitchRoles, hasInitializedFromRole]);

  // Fetch all profiles for the user
  const fetchProfiles = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingProfiles(false);
      return;
    }

    // For clients who can't switch roles, set their profile type correctly
    if (!canSwitchRoles) {
      if (role === "client") {
        setActiveProfileType("client");
        setViewModeState("client");
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
      const savedState = getSavedViewState();
      
      // Check if URL path specifies a valid view mode
      if (pathViewMode) {
        const hasAccessToPath = pathViewMode === "admin" 
          ? isAdminUser 
          : !!profiles[pathViewMode];
        
        if (hasAccessToPath) {
          const pathProfileId = profiles[pathViewMode] || null;
          setActiveProfileType(pathViewMode);
          setActiveProfileId(pathProfileId);
          setViewModeState(pathViewMode);
          // Update localStorage to match URL
          saveViewState(pathViewMode, pathProfileId);
          return;
        }
      }
      
      // Fallback to localStorage if no valid URL path
      if (savedState) {
        const isValidSavedRole = profiles[savedState.type] && 
          (isAdminUser || savedState.type !== "admin"); // Non-admins can't switch to admin
        
        if (isValidSavedRole) {
          setActiveProfileType(savedState.type);
          setActiveProfileId(savedState.profileId);
          setViewModeState(savedState.type);
          return;
        }
      }
      
      // Default based on user type
      setActiveProfileType(defaultType);
      setActiveProfileId(defaultProfileId || null);
      setViewModeState(defaultType);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [user?.id, canSwitchRoles, role, isAdminUser, location.pathname]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Sync context with URL when route changes (handles browser back/forward, direct URL navigation, RouteRestorer)
  // This effect runs when profiles finish loading OR when the URL changes
  // URL always takes priority to ensure ViewSwitcher matches the current route
  useEffect(() => {
    if (isLoadingProfiles) return;
    
    const pathViewMode = getViewModeFromPath(location.pathname);
    
    // Sync with URL path - URL is the source of truth for view mode
    if (pathViewMode) {
      const hasAccess = pathViewMode === "admin" 
        ? isAdminUser 
        : !!availableProfiles[pathViewMode];
      
      if (hasAccess && pathViewMode !== activeProfileType) {
        const profileId = availableProfiles[pathViewMode] || null;
        setActiveProfileType(pathViewMode);
        setActiveProfileId(profileId);
        setViewModeState(pathViewMode);
        saveViewState(pathViewMode, profileId);
      }
    }
  }, [location.pathname, availableProfiles, isLoadingProfiles, isAdminUser, activeProfileType]);

  const setActiveProfile = useCallback((type: ViewMode, profileId: string | null) => {
    setActiveProfileType(type);
    setActiveProfileId(profileId);
    setViewModeState(type);

    // Persist preference IMMEDIATELY
    saveViewState(type, profileId);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    // Also save when view mode is set directly
    saveViewState(mode);
  }, []);

  const refreshProfiles = useCallback(async () => {
    await fetchProfiles();
  }, [fetchProfiles]);

  const value = useMemo(() => ({
    viewMode,
    setViewMode,
    availableProfiles,
    activeProfileType,
    activeProfileId,
    setActiveProfile,
    isLoadingProfiles,
    refreshProfiles,
  }), [viewMode, setViewMode, availableProfiles, activeProfileType, activeProfileId, setActiveProfile, isLoadingProfiles, refreshProfiles]);

  return (
    <AdminContext.Provider value={value}>
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
