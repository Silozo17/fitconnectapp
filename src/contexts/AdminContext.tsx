import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";
import { perfLogger } from "@/lib/performance-logger";
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
 * SYNCHRONOUS: Get initial view mode from localStorage on first render.
 * This runs BEFORE React renders anything, ensuring native apps start with correct view.
 */
const getInitialViewFromStorage = (): ViewMode => {
  try {
    const saved = localStorage.getItem("admin_active_role");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.type && ["admin", "coach", "client"].includes(parsed.type)) {
        console.log('[AdminContext] Synchronous init from storage:', parsed.type);
        return parsed.type as ViewMode;
      }
    }
  } catch (e) {
    console.error('[AdminContext] Failed to read initial view from storage:', e);
  }
  return "client"; // Safe default
};

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

  // CRITICAL FIX: Initialize from localStorage SYNCHRONOUSLY using lazy initializer
  // This ensures native apps start with the correct view immediately
  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialViewFromStorage);
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfiles>({});
  const [activeProfileType, setActiveProfileType] = useState<ViewMode>(getInitialViewFromStorage);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("admin_active_role");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profileId || null;
      }
    } catch {}
    return null;
  });
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [hasInitializedFromRole, setHasInitializedFromRole] = useState(false);
  
  // CRITICAL FIX: Initialize synchronously to prevent race condition
  // This ref is set IMMEDIATELY if there's a saved state, not in a useEffect
  const hasRestoredFromStorageRef = useRef(!!getSavedViewState());
  
  if (hasRestoredFromStorageRef.current) {
    console.log('[AdminContext] hasRestoredFromStorageRef initialized TRUE (saved state exists)');
  }
  
  // Reset state when user logs out
  useEffect(() => {
    if (!user) {
      setActiveProfileType("client");
      setActiveProfileId(null);
      setViewModeState("client");
      setAvailableProfiles({});
      setIsLoadingProfiles(false);
      setHasInitializedFromRole(false);
      hasRestoredFromStorageRef.current = false;
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
      console.log('[AdminContext] Role-validated view for native:', validatedView);
      setActiveProfileType(validatedView);
      setViewModeState(validatedView);
      // Save to ensure consistency
      saveViewState(validatedView);
    } else if (!isNativeApp) {
      // Non-native - use role default only if no saved preference
      const savedState = getSavedViewState();
      if (!savedState) {
        const defaultView = getDefaultViewModeForRole(role);
        setActiveProfileType(defaultView);
        setViewModeState(defaultView);
      }
    }
    
    setHasInitializedFromRole(true);
  }, [user, role, canSwitchRoles, hasInitializedFromRole]);

  // CRITICAL FIX: Add visibilitychange AND focus handlers for app resume (background → foreground)
  // Some native WebViews fire focus instead of visibilitychange
  useEffect(() => {
    const restoreViewOnResume = (source: string) => {
      if (!isDespia() || !user || !role) return;
      
      perfLogger.logEvent('admin_restoreViewOnResume', { source });
      
      console.log(`[AdminContext] ${source} - checking persisted view`);
      const savedState = getSavedViewState();
      
      if (savedState && savedState.type !== activeProfileType) {
        // Validate that user has access to the saved view
        const hasAccess = savedState.type === "admin" 
          ? isAdminUser 
          : savedState.type === "coach"
            ? (isAdminUser || role === "coach")
            : true; // Everyone can access client view
        
        if (hasAccess) {
          console.log(`[AdminContext] Restoring view on ${source}:`, savedState.type, '(was:', activeProfileType, ')');
          setActiveProfileType(savedState.type);
          setViewModeState(savedState.type);
          if (savedState.profileId) {
            setActiveProfileId(savedState.profileId);
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        perfLogger.logVisibilityChange('visible', 'AdminContext');
        restoreViewOnResume('visibilitychange');
      } else {
        perfLogger.logVisibilityChange('hidden', 'AdminContext');
      }
    };

    const handleFocus = () => {
      perfLogger.logFocusEvent('AdminContext');
      restoreViewOnResume('window.focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeProfileType, isAdminUser, role, user]);

  // Fetch all profiles for the user
  const fetchProfiles = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingProfiles(false);
      return;
    }

    perfLogger.logEvent('admin_fetchProfiles_start', { canSwitchRoles });

    // For clients who can't switch roles, set their profile type correctly
    if (!canSwitchRoles) {
      if (role === "client") {
        setActiveProfileType("client");
        setViewModeState("client");
        // Fetch their client profile ID for messaging
        const startTime = performance.now();
        const { data } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        perfLogger.logTimedEvent('admin_fetchClientProfile', performance.now() - startTime);
        if (data?.id) {
          setActiveProfileId(data.id);
          setAvailableProfiles({ client: data.id });
        }
      }
      setIsLoadingProfiles(false);
      perfLogger.logEvent('admin_fetchProfiles_end_client_only');
      return;
    }

    setIsLoadingProfiles(true);

    try {
      const parallelStart = performance.now();
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
      
      perfLogger.logTimedEvent('admin_fetchProfiles_parallel', performance.now() - parallelStart, {
        hasAdmin: !!adminResult.data?.id,
        hasClient: !!clientResult.data?.id,
        hasCoach: !!coachResult.data?.id
      });

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

      // CRITICAL FIX: If we already restored from storage, don't overwrite!
      // Only apply defaults if there's no valid persisted preference
      const savedState = getSavedViewState();
      
      if (hasRestoredFromStorageRef.current && savedState) {
        // Validate the saved state has a valid profile
        const hasValidProfile = savedState.type === "admin" 
          ? isAdminUser 
          : !!profiles[savedState.type];
        
        if (hasValidProfile) {
          console.log('[AdminContext] fetchProfiles: Preserving restored view:', savedState.type, '- NOT overwriting (hasRestoredFromStorageRef=true)');
          // Update profile ID if we now have it
          const profileId = profiles[savedState.type] || null;
          if (profileId && !activeProfileId) {
            setActiveProfileId(profileId);
          }
          setIsLoadingProfiles(false);
          return;
        }
      }

      // Determine default role based on user type
      const defaultType: ViewMode = isAdminUser ? "admin" : "coach";
      const defaultProfileId = isAdminUser ? profiles.admin : profiles.coach;

      // Priority: URL path > localStorage > default
      const pathViewMode = getViewModeFromPath(location.pathname);
      
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
      perfLogger.logEvent('admin_fetchProfiles_error');
    } finally {
      setIsLoadingProfiles(false);
      perfLogger.logEvent('admin_fetchProfiles_end');
    }
  }, [user?.id, canSwitchRoles, role, isAdminUser, location.pathname, activeProfileId]);

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
