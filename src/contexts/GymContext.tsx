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
  stripe_onboarding_complete?: boolean;
  platform_fee_percentage: number;
  status: string;
  verified_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Onboarding fields
  business_types?: string[];
  owner_name?: string | null;
  owner_phone?: string | null;
  onboarding_completed?: boolean;
  onboarding_progress?: Record<string, unknown> | null;
}

export interface GymLocation {
  id: string;
  gym_id: string;
  name: string;
  address_line1: string | null;
  city: string | null;
  is_primary: boolean;
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
  assigned_location_ids: string[] | null;
  permissions: Record<string, boolean> | null;
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
  // Location context
  currentLocationId: string | null;
  setCurrentLocationId: (id: string | null) => void;
  availableLocations: GymLocation[];
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
  
  // Location state
  const [currentLocationId, setCurrentLocationIdState] = useState<string | null>(
    localStorage.getItem("selectedGymLocationId")
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
  
  const setCurrentLocationId = useCallback((id: string | null) => {
    setCurrentLocationIdState(id);
    if (id) {
      localStorage.setItem("selectedGymLocationId", id);
    } else {
      localStorage.removeItem("selectedGymLocationId");
    }
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

  // Fetch gym locations
  const { data: locations = [] } = useQuery({
    queryKey: ["gym-locations", gym?.id],
    queryFn: async () => {
      if (!gym?.id) return [];
      
      const { data, error } = await supabase
        .from("gym_locations")
        .select("id, gym_id, name, address_line_1, city, is_primary")
        .eq("gym_id", gym.id)
        .order("is_primary", { ascending: false });
      
      if (error) throw error;
      return (data || []).map(loc => ({
        id: loc.id,
        gym_id: loc.gym_id,
        name: loc.name,
        address_line1: loc.address_line_1,
        city: loc.city,
        is_primary: loc.is_primary,
      })) as GymLocation[];
    },
    enabled: !!gym?.id,
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

  // Filter available locations based on role and assignment
  const availableLocations = useMemo(() => {
    if (!locations.length) return [];
    
    // Owners see all locations
    if (isOwner) return locations;
    
    // Staff see only assigned locations (or all if none assigned)
    if (staffRecord?.assigned_location_ids?.length) {
      return locations.filter(loc => 
        staffRecord.assigned_location_ids?.includes(loc.id)
      );
    }
    
    return locations;
  }, [locations, isOwner, staffRecord]);

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
    currentLocationId,
    setCurrentLocationId,
    availableLocations,
  }), [gym, gymId, isLoadingGym, isLoadingStaff, gymError, isOwner, isStaff, isMember, userRole, staffRecord, refetch, setGymId, currentLocationId, setCurrentLocationId, availableLocations]);

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
