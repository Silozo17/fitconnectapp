import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Type for public coach profile data (GDPR-safe columns only)
export type MarketplaceCoach = {
  id: string;
  display_name: string | null;
  bio: string | null;
  coach_types: string[] | null;
  certifications: unknown | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  location: string | null;
  online_available: boolean | null;
  in_person_available: boolean | null;
  profile_image_url: string | null;
  card_image_url: string | null;
  booking_mode: string | null;
  is_verified: boolean | null;
  verified_at: string | null;
  gym_affiliation: string | null;
  marketplace_visible: boolean | null;
  selected_avatar_id: string | null;
  created_at: string;
  onboarding_completed: boolean;
  // Computed/added fields
  rating?: number | null;
  reviews_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
};

interface UseCoachMarketplaceOptions {
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  limit?: number;
  featured?: boolean;
  location?: string;
  showSponsoredFirst?: boolean;
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}) => {
  const showSponsoredFirst = options.showSponsoredFirst !== false; // Default true

  return useQuery({
    queryKey: ["marketplace-coaches", options],
    queryFn: async () => {
      // First, get boosted coach IDs if showing sponsored first
      let boostedCoachIds: string[] = [];
      if (showSponsoredFirst) {
        const { data: boosts } = await supabase
          .from("coach_boosts")
          .select("coach_id")
          .eq("is_active", true);
        
        boostedCoachIds = (boosts || []).map(b => b.coach_id);
      }

      // Query the GDPR-safe public view instead of the base table
      // This view only exposes safe columns and filters for active/visible coaches
      let query = supabase
        .from("public_coach_profiles")
        .select("*");

      // Apply filters
      if (options.search) {
        query = query.or(
          `display_name.ilike.%${options.search}%,bio.ilike.%${options.search}%,location.ilike.%${options.search}%`
        );
      }

      if (options.location) {
        query = query.ilike("location", `%${options.location}%`);
      }

      if (options.coachTypes && options.coachTypes.length > 0) {
        query = query.overlaps("coach_types", options.coachTypes);
      }

      if (options.priceRange) {
        query = query
          .gte("hourly_rate", options.priceRange.min)
          .lte("hourly_rate", options.priceRange.max);
      }

      if (options.onlineOnly) {
        query = query.eq("online_available", true);
      }

      if (options.inPersonOnly) {
        query = query.eq("in_person_available", true);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      // Default ordering by hourly_rate descending (as proxy for popularity)
      query = query.order("hourly_rate", { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;

      // Cast and mark sponsored coaches
      const rawData = (data || []) as unknown as MarketplaceCoach[];
      const coaches = rawData.map(coach => ({
        ...coach,
        is_sponsored: boostedCoachIds.includes(coach.id),
      }));

      // Sort: sponsored first (randomized among themselves), then non-sponsored
      if (showSponsoredFirst && boostedCoachIds.length > 0) {
        const sponsored = coaches.filter(c => c.is_sponsored);
        const nonSponsored = coaches.filter(c => !c.is_sponsored);
        
        // Randomize sponsored coaches for fair exposure
        for (let i = sponsored.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sponsored[i], sponsored[j]] = [sponsored[j], sponsored[i]];
        }
        
        return [...sponsored, ...nonSponsored];
      }

      return coaches;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - marketplace data refreshes frequently
  });
};

export const useCoachById = (coachId: string) => {
  return useQuery({
    queryKey: ["coach", coachId],
    queryFn: async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Authenticated users: query base table (RLS handles access control)
        // This allows clients to see coaches they've messaged/connected with
        // even if those coaches have marketplace_visible = false
        const { data, error } = await supabase
          .from("coach_profiles")
          .select(`
            id, display_name, bio, coach_types, certifications,
            experience_years, hourly_rate, currency, location,
            online_available, in_person_available, profile_image_url,
            card_image_url, booking_mode, is_verified, verified_at,
            gym_affiliation, marketplace_visible, selected_avatar_id,
            created_at, onboarding_completed,
            avatars(slug, rarity, image_url)
          `)
          .eq("id", coachId)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      } else {
        // Anonymous users: use GDPR-safe public view (marketplace-visible only)
        const { data, error } = await supabase
          .from("public_coach_profiles")
          .select("*")
          .eq("id", coachId)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      }
    },
    enabled: !!coachId,
    staleTime: 1000 * 60 * 5,
  });
};
