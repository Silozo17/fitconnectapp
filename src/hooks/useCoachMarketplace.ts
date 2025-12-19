import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Type for public coach profile data (GDPR-safe columns only)
export type MarketplaceCoach = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  coach_types: string[] | null;
  certifications: unknown | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  location: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
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
  // New fields
  who_i_work_with: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  threads_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  // Joined avatar data
  avatars?: {
    slug: string;
    rarity: string;
    image_url: string | null;
  } | null;
  // Computed/added fields
  rating?: number | null;
  reviews_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  // Location matching score (for sorting)
  location_score?: number;
};

export interface LocationFilter {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  county?: string | null;
}

interface UseCoachMarketplaceOptions {
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  limit?: number;
  featured?: boolean;
  location?: string; // Legacy text-based location search
  locationFilter?: LocationFilter; // New structured location filter
  showSponsoredFirst?: boolean;
  enableLocationMatching?: boolean; // Auto-sort by location proximity
}

// Calculate a match score based on location proximity
const calculateLocationScore = (
  coach: MarketplaceCoach,
  userLocation: LocationFilter
): number => {
  // Exact city match = 100 points
  if (
    userLocation.city &&
    coach.location_city &&
    coach.location_city.toLowerCase() === userLocation.city.toLowerCase()
  ) {
    return 100;
  }

  // Same region/county match = 80 points
  if (
    userLocation.region &&
    coach.location_region &&
    coach.location_region.toLowerCase() === userLocation.region.toLowerCase()
  ) {
    return 80;
  }

  // Check if coach location text contains user city/region (fallback for legacy data)
  if (coach.location) {
    const locationLower = coach.location.toLowerCase();
    if (userLocation.city && locationLower.includes(userLocation.city.toLowerCase())) {
      return 90;
    }
    if (userLocation.region && locationLower.includes(userLocation.region.toLowerCase())) {
      return 70;
    }
    if (userLocation.county && locationLower.includes(userLocation.county.toLowerCase())) {
      return 70;
    }
  }

  // Same country match = 60 points
  if (
    userLocation.country &&
    coach.location_country &&
    coach.location_country.toLowerCase() === userLocation.country.toLowerCase()
  ) {
    return 60;
  }

  // Online available = 40 points (always relevant)
  if (coach.online_available) {
    return 40;
  }

  // No match = 0 points
  return 0;
};

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}) => {
  const showSponsoredFirst = options.showSponsoredFirst !== false; // Default true
  const enableLocationMatching = options.enableLocationMatching !== false; // Default true

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
      // Join avatars table to get avatar data for display
      let query = supabase
        .from("public_coach_profiles")
        .select("*, avatars(slug, rarity, image_url)");

      // Apply filters
      if (options.search) {
        query = query.or(
          `display_name.ilike.%${options.search}%,bio.ilike.%${options.search}%,location.ilike.%${options.search}%`
        );
      }

      // Legacy text-based location search (when user explicitly searches)
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
      let coaches = rawData.map(coach => ({
        ...coach,
        is_sponsored: boostedCoachIds.includes(coach.id),
      }));

      // Apply location-based scoring if locationFilter is provided
      if (options.locationFilter && enableLocationMatching) {
        coaches = coaches.map(coach => ({
          ...coach,
          location_score: calculateLocationScore(coach, options.locationFilter!),
        }));

        // Sort by location score (highest first), then by hourly_rate
        coaches.sort((a, b) => {
          // Sponsored coaches always first (but sorted by location within sponsored)
          if (showSponsoredFirst && a.is_sponsored !== b.is_sponsored) {
            return a.is_sponsored ? -1 : 1;
          }
          
          const scoreA = a.location_score ?? 0;
          const scoreB = b.location_score ?? 0;
          
          if (scoreA !== scoreB) {
            return scoreB - scoreA; // Higher score first
          }
          
          // Fallback to hourly_rate
          return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
        });

        // Randomize coaches within the same score tier for fairness
        const tiers = new Map<number, MarketplaceCoach[]>();
        coaches.forEach(coach => {
          const score = coach.location_score ?? 0;
          if (!tiers.has(score)) {
            tiers.set(score, []);
          }
          tiers.get(score)!.push(coach);
        });

        // Shuffle within each tier
        const shuffledCoaches: MarketplaceCoach[] = [];
        const sortedScores = Array.from(tiers.keys()).sort((a, b) => b - a);
        
        for (const score of sortedScores) {
          const tierCoaches = tiers.get(score)!;
          // Fisher-Yates shuffle
          for (let i = tierCoaches.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tierCoaches[i], tierCoaches[j]] = [tierCoaches[j], tierCoaches[i]];
          }
          shuffledCoaches.push(...tierCoaches);
        }

        return shuffledCoaches;
      }

      // Original sponsored-first logic if no location filter
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

export const useCoachById = (identifier: string) => {
  // Check if identifier is a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  return useQuery({
    queryKey: ["coach", identifier],
    queryFn: async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      const filterColumn = isUUID ? "id" : "username";
      
      if (session) {
        // Authenticated users: query base table (RLS handles access control)
        const { data, error } = await supabase
          .from("coach_profiles")
          .select(`
            id, username, display_name, bio, coach_types, certifications,
            experience_years, hourly_rate, currency, location,
            online_available, in_person_available, profile_image_url,
            card_image_url, booking_mode, is_verified, verified_at,
            gym_affiliation, marketplace_visible, selected_avatar_id,
            created_at, onboarding_completed, who_i_work_with,
            facebook_url, instagram_url, tiktok_url, x_url,
            threads_url, linkedin_url, youtube_url,
            avatars(slug, rarity, image_url)
          `)
          .eq(filterColumn, identifier)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      } else {
        // Anonymous users: use GDPR-safe public view (marketplace-visible only)
        const { data, error } = await supabase
          .from("public_coach_profiles")
          .select("*, avatars(slug, rarity, image_url)")
          .eq(filterColumn as "id", identifier)
          .maybeSingle();

        if (error) throw error;
        return (data as unknown as MarketplaceCoach) || null;
      }
    },
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5,
  });
};
