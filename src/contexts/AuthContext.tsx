import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { clearLastRoute } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";
import { perfLogger } from "@/lib/performance-logger";

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
const FOCUS_DEBOUNCE_MS = 500;
// Minimum time between session validations
const SESSION_VALIDATION_COOLDOWN_MS = 30000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for debouncing and cooldown tracking
  const lastValidationRef = useRef<number>(0);
  const focusDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUserRole = async (userId: string) => {
    perfLogger.logEvent('auth_fetchUserRole_start');
    const startTime = performance.now();
    
    // Fetch all roles for the user and prioritize by importance
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const duration = performance.now() - startTime;
    perfLogger.logTimedEvent('auth_fetchUserRole_end', duration, { rolesCount: roles?.length || 0 });
    
    if (roles && roles.length > 0) {
      // Priority: admin > manager > staff > coach > client
      const roleOrder: AppRole[] = ['admin', 'manager', 'staff', 'coach', 'client'];
      const sortedRoles = roles
        .map(r => r.role)
        .sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
      setRole(sortedRoles[0]);
      setAllRoles(sortedRoles);
    } else {
      setAllRoles([]);
    }
  };

  useEffect(() => {
    perfLogger.logEvent('auth_context_init_start');
    
    // Handle visibility change for PWA/browser background/foreground
    const handleVisibilityChange = async () => {
      const state = document.visibilityState;
      perfLogger.logVisibilityChange(state as 'visible' | 'hidden', 'AuthContext');
      
      if (state === 'visible') {
        // App is now visible - start auto refresh and revalidate session
        supabase.auth.startAutoRefresh();
        
        perfLogger.logEvent('auth_visibility_getSession_start');
        const sessionStart = performance.now();
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          perfLogger.logTimedEvent('auth_visibility_getSession_end', performance.now() - sessionStart);
          
          // If session is invalid or expired, try to refresh it
          if (error || !session) {
            perfLogger.logEvent('auth_visibility_refreshSession_start');
            const refreshStart = performance.now();
            
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            perfLogger.logTimedEvent('auth_visibility_refreshSession_end', performance.now() - refreshStart, {
              success: !refreshError && !!refreshData.session
            });
            
            if (refreshError || !refreshData.session) {
              // Session cannot be recovered - clear state
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
          console.error('[Auth] Error handling visibility change:', err);
        }
      } else {
        // App is in background - stop auto refresh to save resources
        supabase.auth.stopAutoRefresh();
      }
    };

    // Handle focus events for Despia native app (debounced + cooldown)
    const handleFocus = () => {
      if (!isDespia()) return;
      
      perfLogger.logFocusEvent('AuthContext_despia');
      
      // Clear existing debounce timer
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
      
      // Debounce to prevent rapid successive calls
      focusDebounceRef.current = setTimeout(async () => {
        const now = Date.now();
        
        // Skip if we validated recently (cooldown)
        if (now - lastValidationRef.current < SESSION_VALIDATION_COOLDOWN_MS) {
          perfLogger.logEvent('auth_focus_skipped_cooldown');
          return;
        }
        
        lastValidationRef.current = now;
        supabase.auth.startAutoRefresh();
        
        perfLogger.logEvent('auth_focus_getSession_start');
        const focusSessionStart = performance.now();
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          perfLogger.logTimedEvent('auth_focus_getSession_end', performance.now() - focusSessionStart);
          // Check for invalid JWT (common in native apps after background)
          if (error) {
            // If it's a JWT error, try to refresh
            if (error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('claim')) {
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
              return;
            }
          }
          
          if (!session) {
            // Try to refresh the session
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
            // Validate the session token before using it
            try {
              // Test the token by making a simple request
              const { error: testError } = await supabase.auth.getUser();
              if (testError) {
                // Token is invalid, try to refresh
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
                return;
              }
            } catch (validationErr) {
              console.error('[Auth] Token validation error:', validationErr);
            }
            
            setSession(session);
            setUser(session.user ?? null);
            if (session.user) {
              setTimeout(() => fetchUserRole(session.user.id), 0);
            }
          }
        } catch (err) {
          console.error('[Auth] Error handling focus:', err);
        }
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
        perfLogger.logEvent('auth_onAuthStateChange', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setAllRoles([]);
        }
        
        // PERFORMANCE FIX: Set loading=false immediately on auth state change
        // The onAuthStateChange fires with cached session first, so UI can render
        setLoading(false);
        perfLogger.logEvent('auth_loading_complete');
      }
    );

    // PERFORMANCE FIX: Background session validation (non-blocking)
    // onAuthStateChange already provides the cached session for immediate UI render
    // This validates the session in the background and refreshes if needed
    const validateSessionInBackground = async () => {
      perfLogger.logEvent('auth_background_validate_start');
      const bgValidateStart = performance.now();
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Handle potential JWT errors
        if (error) {
          perfLogger.logEvent('auth_background_jwt_error', { message: error.message?.substring(0, 50) });
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
        
        perfLogger.logTimedEvent('auth_background_validate_end', performance.now() - bgValidateStart);
      } catch (err) {
        console.error('[Auth] Session validation error:', err);
        perfLogger.logEvent('auth_background_validate_error');
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
  }, []);

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
