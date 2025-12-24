import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { clearLastRoute } from "@/hooks/useRouteRestoration";
import { isDespia } from "@/lib/despia";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  allRoles: AppRole[];
  loading: boolean;
  signUp: (email: string, password: string, role: AppRole) => Promise<{ error: Error | null }>;
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
      setRole(sortedRoles[0]);
      setAllRoles(sortedRoles);
    } else {
      setAllRoles([]);
    }
  };

  useEffect(() => {
    // Handle visibility change for PWA/browser background/foreground
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // App is now visible - start auto refresh and revalidate session
        supabase.auth.startAutoRefresh();
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          // If session is invalid or expired, try to refresh it
          if (error || !session) {
            console.log('Auth: Session invalid or expired, attempting refresh...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              // Session cannot be recovered - clear state
              console.log('Auth: Unable to refresh session, clearing state');
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
          console.error('Auth: Error handling visibility change:', err);
        }
      } else {
        // App is in background - stop auto refresh to save resources
        supabase.auth.stopAutoRefresh();
      }
    };

    // Handle focus events for Despia native app
    const handleFocus = async () => {
      if (isDespia()) {
        supabase.auth.startAutoRefresh();
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
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
            setSession(session);
            setUser(session.user ?? null);
            if (session.user) {
              setTimeout(() => fetchUserRole(session.user.id), 0);
            }
          }
        } catch (err) {
          console.error('Auth: Error handling focus:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Start auto refresh on mount
    supabase.auth.startAutoRefresh();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Auth: Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('Auth: User signed out');
        }

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
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      supabase.auth.stopAutoRefresh();
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, selectedRole: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: selectedRole, // Pass role in metadata - trigger handles the rest
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Return generic error message to prevent user enumeration attacks
    if (error) {
      return { error: new Error('Invalid email or password') };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Session might already be invalid - that's okay, just clear local state
      console.warn("Sign out warning:", error);
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
