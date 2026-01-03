import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { clearLastRoute } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";
import { getNativeCache, setNativeCache, clearUserNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  allRoles: AppRole[];
  loading: boolean;
  signUp: (email: string, password: string, role: AppRole, firstName: string, lastName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Debounce delay for focus handlers (prevents rapid re-validation in native)
// PERFORMANCE FIX: Increased from 500ms to 1000ms for native apps
const FOCUS_DEBOUNCE_MS = 1000;
// Minimum time between session validations
const SESSION_VALIDATION_COOLDOWN_MS = 30000;
// Guard to prevent both visibility and focus handlers from firing together
let isHandlingResume = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  // PERF FIX: Track if we've restored from cache to prevent flash
  const [hasRestoredFromCache, setHasRestoredFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Refs for debouncing and cooldown tracking
  const lastValidationRef = useRef<number>(0);
  const focusDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserRole = async (userId: string) => {
    // Fetch all roles for the user and prioritize by importance
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (roles && roles.length > 0) {
      // Priority: admin > manager > staff > coach > client
      const roleOrder: AppRole[] = ['admin', 'manager', 'staff', 'coach', 'client'];
      const sortedRoles = roles
        .map(r => r.role)
        .sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
      
      const primaryRole = sortedRoles[0];
      setRole(primaryRole);
      setAllRoles(sortedRoles);
      
      // Cache roles for native cold start optimization
      setNativeCache(CACHE_KEYS.USER_ROLE, primaryRole, CACHE_TTL.USER_ROLE, userId);
      setNativeCache(CACHE_KEYS.ALL_USER_ROLES, sortedRoles, CACHE_TTL.USER_ROLE, userId);
    } else {
      setAllRoles([]);
    }
  };

  useEffect(() => {
    // PERFORMANCE FIX: Unified handler for both visibility and focus events
    // Prevents double-firing on native app resume
    const handleAppResume = async (source: 'visibility' | 'focus') => {
      // Guard: prevent concurrent handling from both events
      if (isHandlingResume) {
        return;
      }
      
      // For focus events, only handle in Despia native
      if (source === 'focus' && !isDespia()) {
        return;
      }
      
      // Check cooldown
      const now = Date.now();
      if (now - lastValidationRef.current < SESSION_VALIDATION_COOLDOWN_MS) {
        return;
      }
      
      isHandlingResume = true;
      lastValidationRef.current = now;
      
      try {
        supabase.auth.startAutoRefresh();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshData.session) {
            setSession(null);
            setUser(null);
            setRole(null);
            setAllRoles([]);
            return;
          }
          
          setSession(refreshData.session);
          setUser(refreshData.session.user);
          if (refreshData.session.user) {
            setTimeout(() => fetchUserRole(refreshData.session.user.id), 0);
          }
        } else {
          setSession(session);
          setUser(session.user ?? null);
          if (session.user) {
            setTimeout(() => fetchUserRole(session.user.id), 0);
          }
        }
      } catch (err) {
        console.error('[Auth] Error handling app resume:', err);
      } finally {
        // Reset guard after a short delay to allow for event settling
        setTimeout(() => {
          isHandlingResume = false;
        }, 100);
      }
    };

    // Handle visibility change for PWA/browser background/foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleAppResume('visibility');
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    // Handle focus events for Despia native app (debounced)
    const handleFocus = () => {
      // Clear existing debounce timer
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
      
      // Debounce to prevent rapid successive calls
      focusDebounceRef.current = setTimeout(() => {
        handleAppResume('focus');
      }, FOCUS_DEBOUNCE_MS);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Start auto refresh on mount
    supabase.auth.startAutoRefresh();

    // Set up auth state listener FIRST - this handles auth state changes
    // and will fire immediately with the cached session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // PERF FIX: Try to restore role from cache BEFORE setting loading=false
          // This prevents the login screen flash for returning users
          const cachedRole = getNativeCache<AppRole>(CACHE_KEYS.USER_ROLE, session.user.id);
          const cachedAllRoles = getNativeCache<AppRole[]>(CACHE_KEYS.ALL_USER_ROLES, session.user.id);
          
          if (cachedRole) {
            setRole(cachedRole);
            setHasRestoredFromCache(true);
          }
          if (cachedAllRoles && cachedAllRoles.length > 0) {
            setAllRoles(cachedAllRoles);
          }
          
          // Defer Supabase calls with setTimeout to avoid deadlock
          // This will also update cache with fresh data
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setAllRoles([]);
          setHasRestoredFromCache(false);
        }
        
        // PERF FIX: Set loading=false immediately on auth state change
        // The onAuthStateChange fires with cached session first, so UI can render
        setLoading(false);
      }
    );

    // PERFORMANCE FIX: Background session validation (non-blocking)
    // onAuthStateChange already provides the cached session for immediate UI render
    // This validates the session in the background and refreshes if needed
    const validateSessionInBackground = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Handle potential JWT errors
        if (error) {
          if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('claim')) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setRole(null);
            setAllRoles([]);
            return;
          }
        }
        
        if (session) {
          // Validate the session by checking if the user can be fetched
          const { error: userError } = await supabase.auth.getUser();
          if (userError) {
            // Try to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshData.session) {
              setSession(null);
              setUser(null);
              setRole(null);
              setAllRoles([]);
            }
            // If refresh succeeded, onAuthStateChange will handle the update
          }
        }
      } catch (err) {
        console.error('[Auth] Session validation error:', err);
      }
    };
    
    // Run validation after a small delay to not block initial render
    const validationTimeout = setTimeout(validateSessionInBackground, 100);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
      clearTimeout(validationTimeout);
      supabase.auth.stopAutoRefresh();
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, selectedRole: AppRole, firstName: string, lastName?: string) => {
    // CRITICAL FIX: Clear stale onboarding cache before signup
    // This ensures new users don't inherit cache from a previous session
    try {
      localStorage.removeItem('fitconnect_coach_onboarded');
      localStorage.removeItem('fitconnect_client_onboarded');
    } catch {}
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: selectedRole,
          first_name: firstName,
          last_name: lastName || null,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Role and profile are now created automatically by the database trigger
    if (data.user) {
      setRole(selectedRole);
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // CRITICAL FIX: Clear stale onboarding cache before login
    // This ensures we don't inherit cache from a previous user
    try {
      localStorage.removeItem('fitconnect_coach_onboarded');
      localStorage.removeItem('fitconnect_client_onboarded');
    } catch {}
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Return generic error message to prevent user enumeration attacks
    if (error) {
      return { error: new Error('Invalid email or password') };
    }

    // Track session on successful login
    if (data?.session) {
      try {
        await supabase.functions.invoke('track-session', {
          body: {
            action: 'login',
          },
        });
      } catch (trackError) {
        // Don't fail login if session tracking fails
        console.error('[Auth] Session tracking failed:', trackError);
      }
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    // Clear native cache for this user before signing out
    if (user?.id) {
      clearUserNativeCache(user.id);
    }
    
    // CRITICAL FIX: Clear onboarding cache to prevent stale data for next user
    try {
      localStorage.removeItem('fitconnect_coach_onboarded');
      localStorage.removeItem('fitconnect_client_onboarded');
    } catch {}
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Session might already be invalid - that's okay, just clear local state
      console.error("Sign out error:", error);
    }
    // Always clear local state regardless of API response
    setSession(null);
    setUser(null);
    setRole(null);
    setAllRoles([]);
    // Clear saved route so next login starts fresh
    clearLastRoute();
  }, [user?.id]);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      await fetchUserRole(user.id);
    }
  }, [user?.id]);

  const value = useMemo(() => ({
    user,
    session,
    role,
    allRoles,
    loading,
    signUp,
    signIn,
    signOut,
    refreshRole,
  }), [user, session, role, allRoles, loading, signUp, signIn, signOut, refreshRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Safe version of useAuth that returns undefined instead of throwing
 * when used outside AuthProvider. Use for optional auth-dependent features.
 */
export const useAuthSafe = () => {
  return useContext(AuthContext);
};
