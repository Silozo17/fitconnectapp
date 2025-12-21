/**
 * Hook for fetching coaches for the marketplace (/coaches and /dashboard/client/find-coaches)
 * 
 * VALIDATION ASSERTIONS:
 * ✅ Uses sortCoachesByUnifiedRanking from unified-coach-ranking.ts (not duplicated)
 * ✅ filterByLocationWithExpansion() runs BEFORE sortCoachesByUnifiedRanking()
 * ✅ No hardcoded coach IDs
 * ✅ Fake coaches filtered via isRealCoach() when realCoachesOnly=true
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCoachEngagement, createEmptyEngagementMap } from "./useCoachEngagement";
import { calculateLocationScore, filterByLocationWithExpansion } from "@/lib/coach-ranking";
import { sortCoachesByUnifiedRanking, extractRankingFactors } from "@/lib/unified-coach-ranking";
import { matchesCountryFilterStrict } from "@/lib/location-utils";
import { isRealCoach } from "@/lib/coach-validation";
import type { LocationData, CoachLocationData, CoachProfileData, RankingScore } from "@/types/ranking";
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
  location_country_code: string | null;
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
  // Social links
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
  // Profile completeness (from database computed column)
  is_complete_profile?: boolean | null;
  // Computed/added fields
  rating?: number | null;
  reviews_count?: number | null;
  is_sponsored?: boolean | null;
  tags?: string[] | null;
  // Ranking data (added after ranking)
  ranking?: RankingScore;
};

export interface UseCoachMarketplaceOptions {
  search?: string;
  coachTypes?: string[];
  priceRange?: { min: number; max: number };
  onlineOnly?: boolean;
  inPersonOnly?: boolean;
  limit?: number;
  featured?: boolean;
  location?: string;
  showSponsoredFirst?: boolean;
  /** User's detected location for proximity ranking */
  userLocation?: LocationData | null;
  /** Enable location-based ranking (default: true) */
  enableLocationRanking?: boolean;
  /** Minimum results before expanding location radius (default: 5) */
  minResultsBeforeExpansion?: number;
  /** Filter coaches by country code (e.g., 'gb', 'pl') - case insensitive */
  countryCode?: string;
  /** Only show coaches with complete profiles (real coaches, not test/placeholder) */
  realCoachesOnly?: boolean;
}

export interface UseCoachMarketplaceResult {
  data: MarketplaceCoach[] | undefined;
  isLoading: boolean;
  error: Error | null;
  /** Whether location radius was expanded to get more results */
  locationExpanded?: boolean;
  /** The effective match level used after any expansion */
  effectiveMatchLevel?: string;
}

/**
 * Extracts location and profile data from a coach for ranking
 */
function extractCoachRankingData(coach: MarketplaceCoach, boostedCoachIds: string[]): {
  location: CoachLocationData;
  profile: CoachProfileData;
  isSponsored: boolean;
} {
  return {
    location: {
      location_city: coach.location_city,
      location_region: coach.location_region,
      location_country: coach.location_country,
      online_available: coach.online_available,
      in_person_available: coach.in_person_available,
    },
    profile: {
      bio: coach.bio,
      profile_image_url: coach.profile_image_url,
      card_image_url: coach.card_image_url,
      coach_types: coach.coach_types,
      hourly_rate: coach.hourly_rate,
      location: coach.location,
      certifications: coach.certifications,
      is_verified: coach.is_verified,
    },
    isSponsored: boostedCoachIds.includes(coach.id),
  };
}

export const useCoachMarketplace = (options: UseCoachMarketplaceOptions = {}): UseCoachMarketplaceResult => {
  const showSponsoredFirst = options.showSponsoredFirst !== false; // Default true
  const enableLocationRanking = options.enableLocationRanking !== false; // Default true
  const minResultsBeforeExpansion = options.minResultsBeforeExpansion ?? 5;

  // Main query to fetch coaches
  const coachesQuery = useQuery({
    queryKey: ["marketplace-coaches", options],
    queryFn: async () => {
      // First, get boosted coach IDs if showing sponsored first
      // Only include coaches with active, non-expired boosts
      // Accepts both 'succeeded' (paid) and 'migrated_free' (legacy migration) as valid statuses
      let boostedCoachIds: string[] = [];
      if (showSponsoredFirst) {
        const now = new Date().toISOString();
        const { data: boosts } = await supabase
          .from("coach_boosts")
          .select("coach_id, boost_end_date, payment_status")
          .eq("is_active", true)
          .in("payment_status", ["succeeded", "migrated_free"])
          .gt("boost_end_date", now);
        
        // Filter out any null end dates (shouldn't happen, but be safe)
        boostedCoachIds = (boosts || [])
          .filter(b => b.boost_end_date !== null)
          .map(b => b.coach_id);
      }

      // Query the GDPR-safe public view with location columns
      let query = supabase
        .from("public_coach_profiles")
        .select(`
          *,
          avatars(slug, rarity, image_url)
        `);

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

      // Apply country filter at DB level - fetch matching codes + NULL for legacy parsing
      if (options.countryCode) {
        query = query.or(
          `location_country_code.ilike.${options.countryCode},location_country_code.is.null`
        );
      }

      // Don't limit at DB level if we're doing ranking (we'll limit after)
      const dbLimit = enableLocationRanking ? undefined : options.limit;
      if (dbLimit) {
        query = query.limit(dbLimit);
      }

      // Default ordering by hourly_rate descending (will be overridden by ranking)
      query = query.order("hourly_rate", { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;

      let coaches = (data || []) as unknown as MarketplaceCoach[];

      // STRICT COUNTRY FILTERING: Post-query filter to handle legacy coaches
      // Only include coaches that definitively match the country filter
      if (options.countryCode) {
        coaches = coaches.filter(coach => matchesCountryFilterStrict(coach, options.countryCode));
      }

      // REAL COACH FILTERING: Only show complete profiles (excludes test/placeholder)
      if (options.realCoachesOnly) {
        coaches = coaches.filter(coach => isRealCoach(coach));
      }

      // Return filtered data with boosted IDs for ranking step
      return {
        coaches,
        boostedCoachIds,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get coach IDs for engagement query
  const coachIds = coachesQuery.data?.coaches.map(c => c.id) ?? [];
  const boostedCoachIds = coachesQuery.data?.boostedCoachIds ?? [];

  // Fetch engagement data for ranking
  const engagementQuery = useCoachEngagement({
    coachIds,
    enabled: coachIds.length > 0 && enableLocationRanking,
  });

  // Apply unified ranking algorithm
  const rankedData = (() => {
    if (!coachesQuery.data?.coaches) {
      return undefined;
    }

    const coaches = coachesQuery.data.coaches;

    // If ranking is disabled, just mark sponsored and return
    if (!enableLocationRanking) {
      return {
        coaches: coaches.map(coach => ({
          ...coach,
          is_sponsored: boostedCoachIds.includes(coach.id),
        })),
        locationExpanded: false,
        effectiveMatchLevel: undefined,
      };
    }

    // Get engagement map (use empty map if still loading)
    const engagementMap = engagementQuery.data ?? createEmptyEngagementMap(coachIds);

    // Calculate location scores for each coach
    const coachesWithLocation = coaches.map(coach => {
      const { score: locationScore, matchLevel } = calculateLocationScore(
        options.userLocation ?? null,
        {
          location_city: coach.location_city,
          location_region: coach.location_region,
          location_country: coach.location_country,
          online_available: coach.online_available,
          in_person_available: coach.in_person_available,
          location: coach.location,
        }
      );
      return { coach, locationScore, matchLevel };
    });

    // Build ranked array for location filtering (uses legacy format)
    const rankedForFilter = coachesWithLocation.map(({ coach, locationScore, matchLevel }) => ({
      coach,
      ranking: {
        locationScore,
        engagementScore: 0,
        profileScore: 0,
        totalScore: locationScore,
        matchLevel,
        isSponsored: boostedCoachIds.includes(coach.id),
      },
    }));

    // Apply location expansion if needed
    const hasExplicitCountryFilter = !!options.countryCode;
    const { coaches: filteredByLocation, effectiveMatchLevel, expanded } = 
      filterByLocationWithExpansion(rankedForFilter, minResultsBeforeExpansion, !hasExplicitCountryFilter);

    // Apply unified ranking to location-filtered coaches
    const sorted = sortCoachesByUnifiedRanking(
      filteredByLocation.map(r => r.coach),
      (coach) => {
        const locationData = coachesWithLocation.find(c => c.coach.id === coach.id);
        return extractRankingFactors(
          coach.id,
          locationData?.locationScore ?? 0,
          locationData?.matchLevel ?? 'no_match',
          coach.is_verified === true,
          boostedCoachIds.includes(coach.id),
          engagementMap
        );
      }
    );

    // Map back to MarketplaceCoach with ranking data
    let result = sorted.map(({ coach, factors }) => {
      const locationData = coachesWithLocation.find(c => c.coach.id === coach.id);
      return {
        ...coach,
        is_sponsored: factors.isBoosted,
        ranking: {
          locationScore: factors.locationScore,
          engagementScore: 0,
          profileScore: 0,
          totalScore: factors.locationScore,
          matchLevel: locationData?.matchLevel ?? 'no_match',
          isSponsored: factors.isBoosted,
        },
      };
    });

    // Apply limit if specified
    if (options.limit && result.length > options.limit) {
      result = result.slice(0, options.limit);
    }

    return {
      coaches: result,
      locationExpanded: expanded,
      effectiveMatchLevel,
    };
  })();

  return {
    data: rankedData?.coaches,
    isLoading: coachesQuery.isLoading || (enableLocationRanking && engagementQuery.isLoading),
    error: coachesQuery.error ?? engagementQuery.error ?? null,
    locationExpanded: rankedData?.locationExpanded,
    effectiveMatchLevel: rankedData?.effectiveMatchLevel,
  };
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
            location_city, location_region, location_country,
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
