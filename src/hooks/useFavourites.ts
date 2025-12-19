import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useClientProfileId } from "@/hooks/useClientProfileId";
import type { MarketplaceCoach } from "@/hooks/useCoachMarketplace";

export interface Favourite {
  id: string;
  client_id: string;
  coach_id: string;
  created_at: string;
}

// Fetch all favourites for the current client
export const useFavourites = () => {
  const { user } = useAuth();
  const { data: clientProfileId } = useClientProfileId();

  return useQuery({
    queryKey: ["favourites", clientProfileId],
    queryFn: async () => {
      if (!clientProfileId) return [];

      const { data, error } = await supabase
        .from("favourites")
        .select("*")
        .eq("client_id", clientProfileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Favourite[];
    },
    enabled: !!user && !!clientProfileId,
  });
};

// Fetch favourite coaches with full profile data
export const useFavouriteCoaches = () => {
  const { user } = useAuth();
  const { data: clientProfileId } = useClientProfileId();

  return useQuery({
    queryKey: ["favourite-coaches", clientProfileId],
    queryFn: async () => {
      if (!clientProfileId) return [];

      const { data: favourites, error: favError } = await supabase
        .from("favourites")
        .select("coach_id")
        .eq("client_id", clientProfileId);

      if (favError) throw favError;
      if (!favourites || favourites.length === 0) return [];

      const coachIds = favourites.map((f) => f.coach_id);

      const { data: coaches, error: coachError } = await supabase
        .from("coach_profiles")
        .select("*")
        .in("id", coachIds);

      if (coachError) throw coachError;
      return coaches as MarketplaceCoach[];
    },
    enabled: !!user && !!clientProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Check if a coach is favourited
export const useIsFavourite = (coachId: string | undefined) => {
  const { data: favourites = [] } = useFavourites();
  
  return favourites.some((fav) => fav.coach_id === coachId);
};

// Toggle favourite status
export const useToggleFavourite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ coachId, isFavourite }: { coachId: string; isFavourite: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) throw new Error("Client profile not found");

      if (isFavourite) {
        // Remove from favourites
        const { error } = await supabase
          .from("favourites")
          .delete()
          .eq("client_id", profile.id)
          .eq("coach_id", coachId);

        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add to favourites
        const { error } = await supabase
          .from("favourites")
          .insert({
            client_id: profile.id,
            coach_id: coachId,
          });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
      queryClient.invalidateQueries({ queryKey: ["favourite-coaches"] });
    },
  });
};
