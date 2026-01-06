import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { STORAGE_KEYS, clearSessionStorage } from "@/lib/storage-keys";
import { getNativeCache, setNativeCache, clearUserNativeCache, CACHE_KEYS, CACHE_TTL } from "@/lib/native-cache";
import { recordBootStage, BOOT_STAGES } from "@/lib/boot-stages";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string) => {
    console.log('[Auth] Fetching roles from database for user:', userId);
    
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      if (error) {
        console.error('[Auth] Error fetching roles from DB:', error);
        return;
      }
      
      if (roles && roles.length > 0) {
        const roleOrder: AppRole[] = ['admin', 'manager', 'staff', 'coach', 'client'];
        const sortedRoles = roles
          .map(r => r.role)
          .sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
        
        const primaryRole = sortedRoles[0];
        console.log('[Auth] Roles fetched from DB:', sortedRoles);
        recordBootStage(BOOT_STAGES.ROLE_FROM_DB);
        setRole(primaryRole);
        setAllRoles(sortedRoles);
        
        // Cache for native cold start
        setNativeCache(CACHE_KEYS.USER_ROLE, primaryRole, CACHE_TTL.USER_ROLE, userId);
        setNativeCache(CACHE_KEYS.ALL_USER_ROLES, sortedRoles, CACHE_TTL.USER_ROLE, userId);
      } else {
        console.log('[Auth] No roles found in DB for user');
        // Don't clear roles if we already have them from metadata/cache
        // This prevents race conditions
      }
    } catch (err) {
      console.error('[Auth] Exception fetching roles from DB:', err);
      // Don't clear roles on error - keep whatever we have
    }
  }, []);

  useEffect(() => {
    recordBootStage(BOOT_STAGES.APP_MOUNT);
    
    // Handle visibility to manage auto refresh
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    supabase.auth.startAutoRefresh();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[Auth] State change:', event, !!session);
        recordBootStage(BOOT_STAGES.AUTH_STATE_RECEIVED);
        
        // Basic JWT validation - check for corrupted tokens
        // Clear state directly without calling signOut() to avoid state loops
        if (session?.access_token) {
          try {
            const payload = JSON.parse(atob(session.access_token.split('.')[1]));
            if (!payload.sub) {
              console.warn('[Auth] Invalid JWT - missing sub claim, clearing state');
              setSession(null);
              setUser(null);
              setRole(null);
              setAllRoles([]);
              setLoading(false);
              return;
            }
          } catch {
            console.warn('[Auth] Failed to decode JWT, clearing state');
            setSession(null);
            setUser(null);
            setRole(null);
            setAllRoles([]);
            setLoading(false);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          let roleResolved = false;
          
          // Priority 1: Try to restore role from native cache (fastest)
          const cachedRole = getNativeCache<AppRole>(CACHE_KEYS.USER_ROLE, session.user.id);
          const cachedAllRoles = getNativeCache<AppRole[]>(CACHE_KEYS.ALL_USER_ROLES, session.user.id);
          
          if (cachedRole && cachedAllRoles?.length) {
            console.log('[Auth] Restored roles from native cache:', cachedAllRoles);
            recordBootStage(BOOT_STAGES.ROLE_FROM_CACHE);
            setRole(cachedRole);
            setAllRoles(cachedAllRoles);
            roleResolved = true;
          }
          
          // Priority 2: Use user_metadata.role as immediate fallback (works even if DB query fails)
          if (!roleResolved && session.user.user_metadata?.role) {
            const metadataRole = session.user.user_metadata.role as AppRole;
            console.log('[Auth] Using role from user_metadata:', metadataRole);
            recordBootStage(BOOT_STAGES.ROLE_FROM_METADATA);
            setRole(metadataRole);
            setAllRoles([metadataRole]);
            roleResolved = true;
          }
          
          // Always fetch fresh role data from DB in background to ensure accuracy
          // Use setTimeout to not block the auth state update
          setTimeout(() => fetchUserRole(session.user.id), 0);
        } else {
          setRole(null);
          setAllRoles([]);
        }
        
        setLoading(false);
      }
    );

    recordBootStage(BOOT_STAGES.AUTH_LISTENER_ATTACHED);

    // Auth loading timeout - prevent indefinite loading on Android
    // If onAuthStateChange doesn't fire within 4 seconds, assume no user
    const authLoadingTimeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.warn('[Auth] Loading timeout reached - assuming no authenticated user');
          recordBootStage(BOOT_STAGES.AUTH_LOADING_TIMEOUT);
          return false;
        }
        return currentLoading;
      });
    }, 4000);

    // Background session validation
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error?.message?.toLowerCase().includes('jwt') || 
            error?.message?.toLowerCase().includes('claim')) {
          console.warn('[Auth] JWT error, signing out');
          await supabase.auth.signOut();
          return;
        }
        
        if (session) {
          const { error: userError } = await supabase.auth.getUser();
          if (userError) {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              setSession(null);
              setUser(null);
              setRole(null);
              setAllRoles([]);
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Session validation error:', err);
      }
    };
    
    const validationTimeout = setTimeout(validateSession, 100);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(validationTimeout);
      clearTimeout(authLoadingTimeout);
      supabase.auth.stopAutoRefresh();
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signUp = useCallback(async (email: string, password: string, selectedRole: AppRole, firstName: string, lastName?: string) => {
    // Clear stale caches before signup
    clearSessionStorage();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          role: selectedRole,
          first_name: firstName,
          last_name: lastName || null,
        },
      },
    });

    if (error) return { error };
    if (data.user) setRole(selectedRole);
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Clear stale caches before login
    clearSessionStorage();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: new Error('Invalid email or password') };

    // Track session on successful login
    if (data?.session) {
      supabase.functions.invoke('track-session', {
        body: { action: 'login' },
      }).catch(() => {});
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (user?.id) clearUserNativeCache(user.id);
    clearSessionStorage();
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    
    setSession(null);
    setUser(null);
    setRole(null);
    setAllRoles([]);
  }, [user?.id]);

  const refreshRole = useCallback(async () => {
    if (user?.id) await fetchUserRole(user.id);
  }, [user?.id, fetchUserRole]);

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

export const useAuthSafe = () => {
  return useContext(AuthContext);
};
