import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { 
  ClientDataType as CanonicalClientDataType, 
  ExtendedHealthDataType,
  UnifiedDataType 
} from "@/types/health";
import { 
  CLIENT_DATA_TYPES as CANONICAL_CLIENT_DATA_TYPES,
  EXTENDED_HEALTH_DATA_TYPES,
  ALL_UNIFIED_DATA_TYPES 
} from "@/types/health";

// Re-export types for backward compatibility
export type ClientDataType = CanonicalClientDataType;
export type HealthDataType = ExtendedHealthDataType;
export type DataType = UnifiedDataType;

export interface DataSharingPreference {
  id: string;
  client_id: string;
  coach_id: string;
  data_type: string;
  is_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachWithAllPreferences {
  coach_id: string;
  coach_name: string;
  coach_avatar: string | null;
  preferences: DataSharingPreference[];
}

// Use canonical type arrays
export const CLIENT_DATA_TYPES: ClientDataType[] = CANONICAL_CLIENT_DATA_TYPES;
export const HEALTH_DATA_TYPES: HealthDataType[] = EXTENDED_HEALTH_DATA_TYPES;
export const ALL_DATA_TYPES: DataType[] = ALL_UNIFIED_DATA_TYPES;

export const useUnifiedDataPrivacy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch client profile ID
  const { data: clientProfile } = useQuery({
    queryKey: ["client-profile-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch all connected coaches with ALL sharing preferences
  const { data: coachesWithPreferences, isLoading, refetch } = useQuery({
    queryKey: ["unified-data-privacy", clientProfile?.id],
    queryFn: async () => {
      if (!clientProfile) return [];

      // Get all active coach relationships
      const { data: coachClients, error: ccError } = await supabase
        .from("coach_clients")
        .select(`
          coach_id,
          coach_profiles!inner (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq("client_id", clientProfile.id)
        .eq("status", "active");

      if (ccError) throw ccError;
      if (!coachClients || coachClients.length === 0) return [];

      // Get ALL sharing preferences for this client (all data types)
      const { data: preferences, error: prefError } = await supabase
        .from("health_data_sharing_preferences")
        .select("*")
        .eq("client_id", clientProfile.id)
        .in("data_type", ALL_DATA_TYPES);

      if (prefError) throw prefError;

      // Map coaches with their preferences
      const result: CoachWithAllPreferences[] = coachClients.map((cc: any) => {
        const coachPrefs = (preferences || []).filter(
          (p: any) => p.coach_id === cc.coach_id
        );
        
        return {
          coach_id: cc.coach_id,
          coach_name: cc.coach_profiles?.display_name || "Coach",
          coach_avatar: cc.coach_profiles?.profile_image_url,
          preferences: coachPrefs as DataSharingPreference[],
        };
      });

      return result;
    },
    enabled: !!clientProfile?.id,
  });

  // Update a single preference
  const updatePreference = useMutation({
    mutationFn: async ({
      coachId,
      dataType,
      isAllowed,
    }: {
      coachId: string;
      dataType: DataType;
      isAllowed: boolean;
    }) => {
      if (!clientProfile) throw new Error("No client profile");

      const { error } = await supabase
        .from("health_data_sharing_preferences")
        .upsert(
          {
            client_id: clientProfile.id,
            coach_id: coachId,
            data_type: dataType,
            is_allowed: isAllowed,
          },
          {
            onConflict: "client_id,coach_id,data_type",
          }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-data-privacy"] });
    },
    onError: (error) => {
      toast.error("Failed to update preference: " + error.message);
    },
  });

  // Set all preferences for a coach at once
  const setAllPreferences = useMutation({
    mutationFn: async ({
      coachId,
      isAllowed,
    }: {
      coachId: string;
      isAllowed: boolean;
    }) => {
      if (!clientProfile) throw new Error("No client profile");

      // Update all data type preferences
      for (const dataType of ALL_DATA_TYPES) {
        const { error } = await supabase
          .from("health_data_sharing_preferences")
          .upsert(
            {
              client_id: clientProfile.id,
              coach_id: coachId,
              data_type: dataType,
              is_allowed: isAllowed,
            },
            {
              onConflict: "client_id,coach_id,data_type",
            }
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-data-privacy"] });
      toast.success("Privacy settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update preferences: " + error.message);
    },
  });

  // Check if a specific data type is allowed for a coach
  const isDataTypeAllowed = (
    coachId: string,
    dataType: DataType
  ): boolean => {
    const coach = coachesWithPreferences?.find((c) => c.coach_id === coachId);
    if (!coach) return true; // Default to allowed if no coach found

    const specificPref = coach.preferences.find((p) => p.data_type === dataType);

    // If there's a specific preference for this data type, use it
    if (specificPref) return specificPref.is_allowed;

    // Default to allowed (backward compatibility)
    return true;
  };

  // Get access status for a coach (full, none, or limited)
  const getAccessStatus = (coachId: string): "full" | "none" | "limited" => {
    const coach = coachesWithPreferences?.find((c) => c.coach_id === coachId);
    if (!coach) return "full";

    const allowedCount = ALL_DATA_TYPES.filter(dt => isDataTypeAllowed(coachId, dt)).length;
    
    if (allowedCount === ALL_DATA_TYPES.length) return "full";
    if (allowedCount === 0) return "none";
    return "limited";
  };

  return {
    coachesWithPreferences: coachesWithPreferences || [],
    isLoading,
    refetch,
    updatePreference,
    setAllPreferences,
    isDataTypeAllowed,
    getAccessStatus,
    clientDataTypes: CLIENT_DATA_TYPES,
    healthDataTypes: HEALTH_DATA_TYPES,
    allDataTypes: ALL_DATA_TYPES,
  };
};
