import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [viewMode, setViewMode] = useState<ViewMode>("admin");
  const [availableProfiles, setAvailableProfiles] = useState<AvailableProfiles>({});
  const [activeProfileType, setActiveProfileType] = useState<ViewMode>("admin");
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  const isAdminUser = role === "admin" || role === "manager" || role === "staff";

  // Fetch all profiles for the user
  const fetchProfiles = async () => {
    if (!user?.id || !isAdminUser) {
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

      // Restore saved preference or default to admin
      const savedRole = localStorage.getItem(STORAGE_KEY);
      if (savedRole) {
        try {
          const { type, profileId } = JSON.parse(savedRole);
          if (profiles[type as ViewMode]) {
            setActiveProfileType(type);
            setActiveProfileId(profileId);
            setViewMode(type);
          } else {
            // Saved role no longer valid, default to admin
            setActiveProfileType("admin");
            setActiveProfileId(profiles.admin || null);
            setViewMode("admin");
          }
        } catch {
          setActiveProfileType("admin");
          setActiveProfileId(profiles.admin || null);
        }
      } else {
        setActiveProfileType("admin");
        setActiveProfileId(profiles.admin || null);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user?.id, isAdminUser]);

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
