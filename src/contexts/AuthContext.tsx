import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { STORAGE_KEYS, clearSessionStorage } from "@/lib/storage-keys";
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [allRoles, setAllRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (roles && roles.length > 0) {
      const roleOrder: AppRole[] = ['admin', 'manager', 'staff', 'coach', 'client'];
      const sortedRoles = roles
        .map(r => r.role)
        .sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b));
      
      const primaryRole = sortedRoles[0];
      setRole(primaryRole);
      setAllRoles(sortedRoles);
      
      // Cache for native cold start
      setNativeCache(CACHE_KEYS.USER_ROLE, primaryRole, CACHE_TTL.USER_ROLE, userId);
      setNativeCache(CACHE_KEYS.ALL_USER_ROLES, sortedRoles, CACHE_TTL.USER_ROLE, userId);
    } else {
      setAllRoles([]);
    }
  }, []);

  useEffect(() => {
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
        // Basic JWT validation - check for corrupted tokens
        if (session?.access_token) {
          try {
            const payload = JSON.parse(atob(session.access_token.split('.')[1]));
            if (!payload.sub) {
              console.warn('[Auth] Invalid JWT - missing sub claim');
              supabase.auth.signOut().catch(() => {});
              setSession(null);
              setUser(null);
              setRole(null);
              setAllRoles([]);
              setLoading(false);
              return;
            }
          } catch {
            console.warn('[Auth] Failed to decode JWT');
            supabase.auth.signOut().catch(() => {});
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
          // Try to restore role from cache first for instant render
          const cachedRole = getNativeCache<AppRole>(CACHE_KEYS.USER_ROLE, session.user.id);
          const cachedAllRoles = getNativeCache<AppRole[]>(CACHE_KEYS.ALL_USER_ROLES, session.user.id);
          
          if (cachedRole) setRole(cachedRole);
          if (cachedAllRoles?.length) setAllRoles(cachedAllRoles);
          
          // Fetch fresh role data in background
          setTimeout(() => fetchUserRole(session.user.id), 0);
        } else {
          setRole(null);
          setAllRoles([]);
        }
        
        setLoading(false);
      }
    );

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
