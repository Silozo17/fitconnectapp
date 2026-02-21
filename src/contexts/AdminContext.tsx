import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isDespia } from "@/lib/despia";
import { getNativeCache, setNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";
import { STORAGE_KEYS, getStorage, setStorage } from "@/lib/storage-keys";
import {
  ViewMode,
  getSavedViewState,
  saveRoute,
  clearViewState,
  getViewModeFromPath,
  validateRouteForRole,
} from "@/lib/view-restoration";
import { debugLogger } from "@/lib/debug-logger";

interface GymInfo {
  id: string;
  name: string;
}

interface AvailableProfiles {
  admin?: string;
  client?: string;
  coach?: string;
  gym?: GymInfo[];
}

/** Helper to get a string profile ID from available profiles for a given view mode */
function getProfileIdForMode(profiles: AvailableProfiles, mode: ViewMode): string | null {
  if (mode === 'gym') {
    return profiles.gym?.[0]?.id ?? null;
  }
  return (profiles[mode] as string | undefined) ?? null;
}

/** Helper to check if a profile exists for a view mode */
function hasProfileForMode(profiles: AvailableProfiles, mode: ViewMode): boolean {
  if (mode === 'gym') return !!profiles.gym?.length;
  return !!profiles[mode];
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

// Export the context so it can be used safely with useContext
export const AdminContext = createContext<AdminContextType | undefined>(undefined);

/**
 * SYNCHRONOUS: Get initial view mode from localStorage on first render.
 */
const getInitialViewFromStorage = (): ViewMode => {
  try {
    const saved = getSavedViewState();
    if (saved?.viewMode && ["admin", "coach", "client", "gym"].includes(saved.viewMode)) {
      return saved.viewMode;
    }
  } catch {}
  return "client";
};

/**
 * Get the default view mode based on user role
 */
const getDefaultViewModeForRole = (role: string | null): ViewMode => {
  if (role === "client") return "client";
  if (role === "coach") return "coach";
  return "admin";
};

/**
 * Get initial view mode - checks saved preference first, falls back to role default.
 */
const getValidatedViewMode = (role: string | null): ViewMode => {
  const savedState = getSavedViewState();
  if (savedState?.viewMode) {
    const savedRoute = `/dashboard/${savedState.viewMode}`;
    if (validateRouteForRole(savedRoute, role)) {
      return savedState.viewMode;
    }
  }
  return getDefaultViewModeForRole(role);
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  
  const isAdminUser = role === "admin" || role === "manager" || role === "staff";
  const canSwitchRoles = isAdminUser || role === "coach";

  const [viewMode, setViewModeState] = useState<ViewMode>(getInitialViewFromStorage);
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfiles>({});
  const [activeProfileType, setActiveProfileType] = useState<ViewMode>(getInitialViewFromStorage);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [hasInitializedFromRole, setHasInitializedFromRole] = useState(false);
  const hasRestoredFromStorageRef = useRef(!!getSavedViewState());
  
  // Timeout protection: ensure isLoadingProfiles always resolves
  useEffect(() => {
    if (!isLoadingProfiles) return;
    
    const timeout = setTimeout(() => {
      console.warn('[AdminContext] Profile loading timed out after 8s, forcing completion');
      setIsLoadingProfiles(false);
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfiles]);
  
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
  
  // Initialize view mode AFTER role becomes available
  useEffect(() => {
    if (!user || !role || hasInitializedFromRole) return;
    
    const isNativeApp = isDespia();
    
    if (isNativeApp && canSwitchRoles) {
      const validatedView = getValidatedViewMode(role);
      setActiveProfileType(validatedView);
      setViewModeState(validatedView);
      saveRoute(`/dashboard/${validatedView}`);
    } else if (!isNativeApp) {
      const savedState = getSavedViewState();
      if (!savedState) {
        const defaultView = getDefaultViewModeForRole(role);
        setActiveProfileType(defaultView);
        setViewModeState(defaultView);
      }
    }
    
    setHasInitializedFromRole(true);
  }, [user, role, canSwitchRoles, hasInitializedFromRole]);

  // Fetch all profiles for the user
  const fetchProfiles = useCallback(async (options?: { immediate?: boolean }) => {
    if (!user?.id) {
      setIsLoadingProfiles(false);
      return;
    }

    const isNativeApp = isDespia();
    const savedState = getSavedViewState();
    
    if (isNativeApp && savedState && hasRestoredFromStorageRef.current && !options?.immediate) {
      const cachedProfiles = getNativeCache<AvailableProfiles>(
        CACHE_KEYS.AVAILABLE_PROFILES, 
        user.id
      );
      
      if (cachedProfiles) {
        setAvailableProfiles(cachedProfiles);
        const profileId = getProfileIdForMode(cachedProfiles, savedState.viewMode);
        if (profileId) {
          setActiveProfileId(profileId);
        }
      }
      
      setIsLoadingProfiles(false);
      
      const scheduleBackgroundFetch = () => fetchProfiles({ immediate: true });
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(scheduleBackgroundFetch, { timeout: 2000 });
      } else {
        setTimeout(scheduleBackgroundFetch, 50);
      }
      return;
    }

    if (!canSwitchRoles) {
      if (role === "client") {
        setActiveProfileType(activeProfileType === "gym" ? "gym" : "client");
        setViewModeState(activeProfileType === "gym" ? "gym" : "client");
        
        // For client-role users, also check gym access
        const [clientResult, ownedGymsResult, staffGymsResult] = await Promise.all([
          supabase.from("client_profiles").select("id").eq("user_id", user.id).maybeSingle(),
          supabase.from("gym_profiles").select("id, name").eq("user_id", user.id).eq("status", "active"),
          supabase.from("gym_staff").select("gym_id, gym_profiles!inner(id, name)").eq("user_id", user.id).eq("status", "active"),
        ]);
        
        const newProfiles: AvailableProfiles = {};
        if (clientResult.data?.id) {
          newProfiles.client = clientResult.data.id;
        }
        
        // Build gym list
        const gymsMap = new Map<string, GymInfo>();
        ownedGymsResult.data?.forEach((g: any) => gymsMap.set(g.id, { id: g.id, name: g.name }));
        staffGymsResult.data?.forEach((r: any) => {
          const g = r.gym_profiles;
          if (g && !gymsMap.has(g.id)) gymsMap.set(g.id, { id: g.id, name: g.name });
        });
        if (gymsMap.size > 0) newProfiles.gym = Array.from(gymsMap.values());
        
        setAvailableProfiles(newProfiles);
        
        if (clientResult.data?.id) {
          setActiveProfileId(clientResult.data.id);
        } else if (newProfiles.gym?.length) {
          setActiveProfileId(newProfiles.gym[0].id);
          setActiveProfileType("gym");
          setViewModeState("gym");
        }
      }
      setIsLoadingProfiles(false);
      return;
    }

    setIsLoadingProfiles(true);

    try {
      const [adminResult, clientResult, coachResult, ownedGymsResult, staffGymsResult] = await Promise.all([
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
        supabase
          .from("gym_profiles")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("status", "active"),
        supabase
          .from("gym_staff")
          .select("gym_id, gym_profiles!inner(id, name)")
          .eq("user_id", user.id)
          .eq("status", "active"),
      ]);

      const profiles: AvailableProfiles = {};

      if (adminResult.data?.id) profiles.admin = adminResult.data.id;
      if (clientResult.data?.id) profiles.client = clientResult.data.id;
      if (coachResult.data?.id) profiles.coach = coachResult.data.id;

      // Build gym list from owned + staff gyms
      const gymsMap = new Map<string, GymInfo>();
      ownedGymsResult.data?.forEach((g: any) => gymsMap.set(g.id, { id: g.id, name: g.name }));
      staffGymsResult.data?.forEach((r: any) => {
        const g = r.gym_profiles;
        if (g && !gymsMap.has(g.id)) gymsMap.set(g.id, { id: g.id, name: g.name });
      });
      if (gymsMap.size > 0) profiles.gym = Array.from(gymsMap.values());

      setAvailableProfiles(profiles);
      
      if (user?.id) {
        setNativeCache(CACHE_KEYS.AVAILABLE_PROFILES, profiles, CACHE_TTL.AVAILABLE_PROFILES, user.id);
      }

      const currentSavedState = getSavedViewState();
      
      if (hasRestoredFromStorageRef.current && currentSavedState) {
        const hasValidProfile = currentSavedState.viewMode === "admin" 
          ? isAdminUser 
          : hasProfileForMode(profiles, currentSavedState.viewMode);
        
        if (hasValidProfile) {
          const profileId = getProfileIdForMode(profiles, currentSavedState.viewMode);
          if (profileId && !activeProfileId) {
            setActiveProfileId(profileId);
          }
          setIsLoadingProfiles(false);
          return;
        }
      }

      const defaultType: ViewMode = isAdminUser ? "admin" : "coach";
      const defaultProfileId = isAdminUser ? profiles.admin : profiles.coach;

      const pathViewMode = getViewModeFromPath(location.pathname);
      
      if (pathViewMode) {
        const hasAccessToPath = pathViewMode === "admin" 
          ? isAdminUser 
          : hasProfileForMode(profiles, pathViewMode);
        
        if (hasAccessToPath) {
          const pathProfileId = getProfileIdForMode(profiles, pathViewMode);
          setActiveProfileType(pathViewMode);
          setActiveProfileId(pathProfileId);
          setViewModeState(pathViewMode);
          saveRoute(pathViewMode === 'gym' ? location.pathname : `/dashboard/${pathViewMode}`);
          return;
        }
      }
      
      if (currentSavedState) {
        const isValidSavedRole = hasProfileForMode(profiles, currentSavedState.viewMode) && 
          (isAdminUser || currentSavedState.viewMode !== "admin");
        
        if (isValidSavedRole) {
          setActiveProfileType(currentSavedState.viewMode);
          setActiveProfileId(getProfileIdForMode(profiles, currentSavedState.viewMode));
          setViewModeState(currentSavedState.viewMode);
          return;
        }
      }
      
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

  // Sync context with URL when route changes
  useEffect(() => {
    if (isLoadingProfiles) return;
    
    const pathViewMode = getViewModeFromPath(location.pathname);
    
    if (pathViewMode) {
      const hasAccess = pathViewMode === "admin" 
        ? isAdminUser 
        : hasProfileForMode(availableProfiles, pathViewMode);
      
      if (hasAccess && pathViewMode !== activeProfileType) {
        const profileId = getProfileIdForMode(availableProfiles, pathViewMode);
        setActiveProfileType(pathViewMode);
        setActiveProfileId(profileId);
        setViewModeState(pathViewMode);
        saveRoute(pathViewMode === 'gym' ? location.pathname : `/dashboard/${pathViewMode}`);
      }
    }
  }, [location.pathname, availableProfiles, isLoadingProfiles, isAdminUser, activeProfileType]);

  const setActiveProfile = useCallback((type: ViewMode, profileId: string | null) => {
    const prevType = activeProfileType;
    setActiveProfileType(type);
    setActiveProfileId(profileId);
    setViewModeState(type);
    saveRoute(`/dashboard/${type}`);
    
    // Log view switch for debugging
    if (prevType !== type) {
      debugLogger.viewSwitch(prevType, type, { profileId });
    }
  }, [activeProfileType]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    saveRoute(`/dashboard/${mode}`);
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
