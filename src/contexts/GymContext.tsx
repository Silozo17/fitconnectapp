import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export type GymRole = "owner" | "manager" | "coach" | "marketing" | "staff";

export interface GymProfile {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  county: string | null;
  country: string;
  postcode: string | null;
  location_lat: number | null;
  location_lng: number | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  currency: string;
  timezone: string;
  stripe_account_id: string | null;
  stripe_account_status: string | null;
  stripe_onboarding_complete: boolean;
  platform_fee_percentage: number;
  status: string;
  verified_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GymStaff {
  id: string;
  gym_id: string;
  user_id: string;
  coach_profile_id: string | null;
  role: GymRole;
  display_name: string | null;
  job_title: string | null;
  status: string;
}

interface GymContextType {
  gym: GymProfile | null;
  gymId: string | null;
  isLoading: boolean;
  error: Error | null;
  isOwner: boolean;
  isStaff: boolean;
  isMember: boolean;
  userRole: GymRole | null;
  staffRecord: GymStaff | null;
  refetch: () => void;
  setGymId: (id: string | null) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

/**
 * Get gym ID from URL params or localStorage
 */
export const getStoredGymId = (): string | null => {
  return localStorage.getItem("selectedGymId");
};

export const setStoredGymId = (gymId: string | null) => {
  if (gymId) {
    localStorage.setItem("selectedGymId", gymId);
  } else {
    localStorage.removeItem("selectedGymId");
  }
};

interface GymProviderProps {
  children: React.ReactNode;
  initialGymId?: string | null;
}

export function GymProvider({ children, initialGymId }: GymProviderProps) {
  const { user } = useAuth();
  const params = useParams<{ gymId?: string }>();
  
  // Priority: URL param > initial prop > localStorage
  const [gymId, setGymIdState] = useState<string | null>(
    params.gymId ?? initialGymId ?? getStoredGymId()
  );

  // Sync gymId when URL params change
  useEffect(() => {
    if (params.gymId && params.gymId !== gymId) {
      setGymIdState(params.gymId);
      setStoredGymId(params.gymId);
    }
  }, [params.gymId]);

  const setGymId = useCallback((id: string | null) => {
    setGymIdState(id);
    setStoredGymId(id);
  }, []);

  // Fetch gym profile by ID
  const {
    data: gym,
    isLoading: isLoadingGym,
    error: gymError,
    refetch: refetchGym,
  } = useQuery({
    queryKey: ["gym-profile", gymId],
    queryFn: async () => {
      if (!gymId) return null;
      
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("*")
        .eq("id", gymId)
        .single();
      
      if (error) throw error;
      return data as GymProfile;
    },
    enabled: !!gymId,
  });

  // Fetch user's staff record at this gym
  const {
    data: staffRecord,
    isLoading: isLoadingStaff,
  } = useQuery({
    queryKey: ["gym-staff-record", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("gym_staff")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      return data as GymStaff | null;
    },
    enabled: !!gym?.id && !!user?.id,
  });

  // Check if user is a member at this gym
  const { data: memberRecord } = useQuery({
    queryKey: ["gym-member-record", gym?.id, user?.id],
    queryFn: async () => {
      if (!gym?.id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("gym_members")
        .select("id, status")
        .eq("gym_id", gym.id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id && !!user?.id,
  });

  const isOwner = useMemo(() => {
    return !!gym && !!user && gym.user_id === user.id;
  }, [gym, user]);

  const isStaff = useMemo(() => {
    return isOwner || !!staffRecord;
  }, [isOwner, staffRecord]);

  const isMember = useMemo(() => {
    return !!memberRecord;
  }, [memberRecord]);

  const userRole = useMemo((): GymRole | null => {
    if (isOwner) return "owner";
    return staffRecord?.role ?? null;
  }, [isOwner, staffRecord]);

  const refetch = useCallback(() => {
    refetchGym();
  }, [refetchGym]);

  const value = useMemo<GymContextType>(() => ({
    gym,
    gymId,
    isLoading: isLoadingGym || isLoadingStaff,
    error: gymError as Error | null,
    isOwner,
    isStaff,
    isMember,
    userRole,
    staffRecord,
    refetch,
    setGymId,
  }), [gym, gymId, isLoadingGym, isLoadingStaff, gymError, isOwner, isStaff, isMember, userRole, staffRecord, refetch, setGymId]);

  return (
    <GymContext.Provider value={value}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
}

// Permission check hooks
export function useGymPermission(requiredRoles: GymRole[]) {
  const { userRole, isOwner } = useGym();
  
  if (isOwner) return true;
  if (!userRole) return false;
  
  return requiredRoles.includes(userRole);
}

export function useCanManageGym() {
  return useGymPermission(["owner", "manager"]);
}

export function useCanManageClasses() {
  return useGymPermission(["owner", "manager", "coach"]);
}

export function useCanManageMembers() {
  return useGymPermission(["owner", "manager", "coach", "staff"]);
}

export function useCanViewFinancials() {
  return useGymPermission(["owner", "manager"]);
}
