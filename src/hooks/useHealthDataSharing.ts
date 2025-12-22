import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type HealthDataType = 
  | "all" 
  | "steps" 
  | "heart_rate" 
  | "sleep" 
  | "calories" 
  | "distance" 
  | "active_minutes"
  | "weight";

export interface HealthDataSharingPreference {
  id: string;
  client_id: string;
  coach_id: string;
  data_type: HealthDataType;
  is_allowed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachWithPreferences {
  coach_id: string;
  coach_name: string;
  coach_avatar: string | null;
  preferences: HealthDataSharingPreference[];
}

const DATA_TYPES: HealthDataType[] = [
  "steps",
  "heart_rate", 
  "sleep",
  "calories",
  "distance",
  "active_minutes",
  "weight"
];

export const useHealthDataSharing = () => {
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

  // Fetch all connected coaches with their sharing preferences
  const { data: coachesWithPreferences, isLoading, refetch } = useQuery({
    queryKey: ["health-data-sharing", clientProfile?.id],
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

      // Get all sharing preferences for this client
      const { data: preferences, error: prefError } = await supabase
        .from("health_data_sharing_preferences")
        .select("*")
        .eq("client_id", clientProfile.id);

      if (prefError) throw prefError;

      // Map coaches with their preferences
      const result: CoachWithPreferences[] = coachClients.map((cc: any) => {
        const coachPrefs = (preferences || []).filter(
          (p: any) => p.coach_id === cc.coach_id
        );
        
        return {
          coach_id: cc.coach_id,
          coach_name: cc.coach_profiles?.display_name || "Coach",
          coach_avatar: cc.coach_profiles?.profile_image_url,
          preferences: coachPrefs as HealthDataSharingPreference[],
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
      dataType: HealthDataType;
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
      queryClient.invalidateQueries({ queryKey: ["health-data-sharing"] });
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

      // Upsert "all" preference
      const { error } = await supabase
        .from("health_data_sharing_preferences")
        .upsert(
          {
            client_id: clientProfile.id,
            coach_id: coachId,
            data_type: "all",
            is_allowed: isAllowed,
          },
          {
            onConflict: "client_id,coach_id,data_type",
          }
        );

      if (error) throw error;

      // Also update all individual preferences to match
      for (const dataType of DATA_TYPES) {
        await supabase
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
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-data-sharing"] });
      toast.success("Sharing preferences updated");
    },
    onError: (error) => {
      toast.error("Failed to update preferences: " + error.message);
    },
  });

  // Check if a specific data type is allowed for a coach
  const isDataTypeAllowed = (
    coachId: string,
    dataType: HealthDataType
  ): boolean => {
    const coach = coachesWithPreferences?.find((c) => c.coach_id === coachId);
    if (!coach) return true; // Default to allowed if no coach found

    // Check for explicit denial
    const allPref = coach.preferences.find((p) => p.data_type === "all");
    const specificPref = coach.preferences.find((p) => p.data_type === dataType);

    // If there's a specific preference for this data type, use it
    if (specificPref) return specificPref.is_allowed;
    
    // Otherwise check the "all" preference
    if (allPref) return allPref.is_allowed;

    // Default to allowed (backward compatibility)
    return true;
  };

  return {
    coachesWithPreferences: coachesWithPreferences || [],
    isLoading,
    refetch,
    updatePreference,
    setAllPreferences,
    isDataTypeAllowed,
    dataTypes: DATA_TYPES,
  };
};

