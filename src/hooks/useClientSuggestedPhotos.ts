import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SuggestedPhotos {
  beforePhoto: string | null;
  beforeDate: Date | null;
  afterPhoto: string | null;
  afterDate: Date | null;
  totalPhotos: number;
}

export function useClientSuggestedPhotos(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-suggested-photos", clientId],
    queryFn: async (): Promise<SuggestedPhotos | null> => {
      if (!clientId) return null;

      // Fetch all progress entries with photos
      const { data, error } = await supabase
        .from("client_progress")
        .select("recorded_at, photo_urls")
        .eq("client_id", clientId)
        .not("photo_urls", "is", null)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      // Filter out entries with empty photo arrays
      const entriesWithPhotos = data.filter(
        (entry) => entry.photo_urls && (entry.photo_urls as string[]).length > 0
      );

      if (entriesWithPhotos.length === 0) return null;

      const firstEntry = entriesWithPhotos[0];
      const lastEntry = entriesWithPhotos[entriesWithPhotos.length - 1];
      const firstPhotos = firstEntry.photo_urls as string[];
      const lastPhotos = lastEntry.photo_urls as string[];

      return {
        beforePhoto: firstPhotos[0] || null,
        beforeDate: new Date(firstEntry.recorded_at),
        afterPhoto: lastPhotos[lastPhotos.length - 1] || null,
        afterDate: new Date(lastEntry.recorded_at),
        totalPhotos: entriesWithPhotos.reduce(
          (sum, entry) => sum + ((entry.photo_urls as string[])?.length || 0),
          0
        ),
      };
    },
    enabled: !!clientId,
  });
}
