import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";
import { getNativeCache, setNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";
import { useRegisterResumeHandler } from "@/contexts/ResumeManagerContext";
import { BACKGROUND_DELAYS } from "@/hooks/useAppResumeManager";
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

  /**
   * View restoration logic - called on resume via ResumeManager
   * Moved from local visibility handlers to centralized manager
   */
  const restoreViewOnResume = useCallback(() => {
    if (!isDespia() || !user || !role) return;
    
    const savedState = getSavedViewState();
    
    if (savedState && savedState.type !== activeProfileType) {
      // Validate that user has access to the saved view
      const hasAccess = savedState.type === "admin" 
        ? isAdminUser 
        : savedState.type === "coach"
          ? (isAdminUser || role === "coach")
          : true; // Everyone can access client view
      
      if (hasAccess) {
        setActiveProfileType(savedState.type);
        setViewModeState(savedState.type);
        if (savedState.profileId) {
          setActiveProfileId(savedState.profileId);
        }
      }
    }
  }, [activeProfileType, isAdminUser, role, user]);

  // Register with the unified ResumeManager for view restoration on app resume
  useRegisterResumeHandler(
    useMemo(() => ({
      id: 'viewRestore',
      priority: 'fast' as const,
      delay: BACKGROUND_DELAYS.viewRestore,
      handler: restoreViewOnResume,
      nativeOnly: true, // Only needed for Despia native
    }), [restoreViewOnResume])
  );

  // Fetch all profiles for the user
  // PERFORMANCE: For native cold start, defer fetch if we have valid localStorage state
  const fetchProfiles = useCallback(async (options?: { immediate?: boolean }) => {
    if (!user?.id) {
      setIsLoadingProfiles(false);
      return;
    }

    // PERFORMANCE FIX: For native cold start, skip immediate fetch if we have saved state
    // This prevents 3 DB queries from blocking initial render
    const isNativeApp = isDespia();
    const savedState = getSavedViewState();
    
    if (isNativeApp && savedState && hasRestoredFromStorageRef.current && !options?.immediate) {
      // Trust localStorage on cold start, fetch in background
      console.log('[AdminContext] Native cold start: trusting localStorage, deferring profile fetch');
      
      // CRITICAL FIX: Restore cached profiles BEFORE setting loading=false
      // This ensures ViewSwitcher shows existing profiles, not "create +" options
      const cachedProfiles = getNativeCache<AvailableProfiles>(
        CACHE_KEYS.AVAILABLE_PROFILES, 
        user.id
      );
      
      if (cachedProfiles) {
        console.log('[AdminContext] Restored cached profiles:', cachedProfiles);
        setAvailableProfiles(cachedProfiles);
        // Also set the profile ID if we have it
        const profileId = cachedProfiles[savedState.type] || null;
        if (profileId) {
          setActiveProfileId(profileId);
        }
      }
      
      setIsLoadingProfiles(false);
      
      // Schedule background fetch after render (guarded for Android WebView compatibility)
      const scheduleBackgroundFetch = () => fetchProfiles({ immediate: true });
      
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(scheduleBackgroundFetch, { timeout: 2000 });
      } else {
        setTimeout(scheduleBackgroundFetch, 50);
      }
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
      
      // Cache profiles for native cold start
      if (user?.id) {
        setNativeCache(CACHE_KEYS.AVAILABLE_PROFILES, profiles, CACHE_TTL.AVAILABLE_PROFILES, user.id);
      }

      // CRITICAL FIX: If we already restored from storage, don't overwrite!
      // Only apply defaults if there's no valid persisted preference
      const currentSavedState = getSavedViewState();
      
      if (hasRestoredFromStorageRef.current && currentSavedState) {
        // Validate the saved state has a valid profile
        const hasValidProfile = currentSavedState.type === "admin" 
          ? isAdminUser 
          : !!profiles[currentSavedState.type];
        
        if (hasValidProfile) {
          console.log('[AdminContext] fetchProfiles: Preserving restored view:', currentSavedState.type, '- NOT overwriting (hasRestoredFromStorageRef=true)');
          // Update profile ID if we now have it
          const profileId = profiles[currentSavedState.type] || null;
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
      if (currentSavedState) {
        const isValidSavedRole = profiles[currentSavedState.type] && 
          (isAdminUser || currentSavedState.type !== "admin"); // Non-admins can't switch to admin
        
        if (isValidSavedRole) {
          setActiveProfileType(currentSavedState.type);
          setActiveProfileId(currentSavedState.profileId);
          setViewModeState(currentSavedState.type);
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
