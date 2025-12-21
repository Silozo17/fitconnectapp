import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  RouteLanguageCode, 
  RouteLocationCode, 
  SUPPORTED_LOCATIONS,
  SUPPORTED_LANGUAGES,
  DEFAULT_ROUTE_LOCALE,
  getStoredLocalePreference,
  setStoredLocalePreference,
} from "@/lib/locale-routing";

interface UserLocalePreference {
  country_preference: RouteLocationCode | null;
  language_preference: RouteLanguageCode | null;
  locale_initialized_at: string | null;
}

interface UseUserLocalePreferenceResult {
  countryPreference: RouteLocationCode;
  languagePreference: RouteLanguageCode;
  isLoading: boolean;
  isInitialized: boolean;
  updateCountry: (country: RouteLocationCode) => void;
  updateLanguage: (language: RouteLanguageCode) => void;
  initializeFromGeo: (country: RouteLocationCode, language: RouteLanguageCode) => void;
  isUpdating: boolean;
}

/**
 * Hook to manage user locale preferences from DB.
 * Priority: DB preference > localStorage > geo-detection (only for initial setup)
 * 
 * For authenticated users:
 * - Reads/writes to user_profiles table
 * - Once locale_initialized_at is set, geo-detection is never used again
 * 
 * For unauthenticated users:
 * - Falls back to localStorage only
 */
export function useUserLocalePreference(): UseUserLocalePreferenceResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch from DB for authenticated users
  const { data: dbPreference, isLoading } = useQuery({
    queryKey: ["user-locale-preference", user?.id],
    queryFn: async (): Promise<UserLocalePreference | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("country_preference, language_preference, locale_initialized_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching locale preference:", error);
        return null;
      }

      return data as UserLocalePreference | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to update country preference
  const updateCountryMutation = useMutation({
    mutationFn: async (country: RouteLocationCode) => {
      const stored = getStoredLocalePreference();
      const currentLanguage = stored?.language ?? DEFAULT_ROUTE_LOCALE.language;
      
      // Always update localStorage with 'manual' source
      setStoredLocalePreference(currentLanguage, country, 'manual');

      if (!user?.id) {
        return; // For unauthenticated users, localStorage is enough
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          country_preference: country,
          locale_initialized_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locale-preference", user?.id] });
    },
  });

  // Mutation to update language preference
  const updateLanguageMutation = useMutation({
    mutationFn: async (language: RouteLanguageCode) => {
      const stored = getStoredLocalePreference();
      const currentCountry = stored?.location ?? DEFAULT_ROUTE_LOCALE.location;
      
      // Always update localStorage with 'manual' source
      setStoredLocalePreference(language, currentCountry, 'manual');

      if (!user?.id) {
        return; // For unauthenticated users, localStorage is enough
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          language_preference: language,
          locale_initialized_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locale-preference", user?.id] });
    },
  });

  // Mutation to initialize from geo-detection (only used once)
  const initializeFromGeoMutation = useMutation({
    mutationFn: async ({ country, language }: { country: RouteLocationCode; language: RouteLanguageCode }) => {
      // For unauthenticated users, just update localStorage with 'geo' source
      if (!user?.id) {
        setStoredLocalePreference(language, country, 'geo');
        return;
      }

      // Only initialize if not already initialized
      if (dbPreference?.locale_initialized_at) {
        return; // Already initialized, don't override
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ 
          country_preference: country,
          language_preference: language,
          locale_initialized_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Also update localStorage with 'geo' source
      setStoredLocalePreference(language, country, 'geo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-locale-preference", user?.id] });
    },
  });

  // Determine effective preferences
  const storedPreference = getStoredLocalePreference();

  // Priority: DB > localStorage > defaults
  const countryPreference: RouteLocationCode = 
    (dbPreference?.country_preference as RouteLocationCode | null) ??
    storedPreference?.location ??
    DEFAULT_ROUTE_LOCALE.location;

  const languagePreference: RouteLanguageCode =
    (dbPreference?.language_preference as RouteLanguageCode | null) ??
    storedPreference?.language ??
    DEFAULT_ROUTE_LOCALE.language;

  // Validate the values
  const validCountry = SUPPORTED_LOCATIONS.includes(countryPreference) 
    ? countryPreference 
    : DEFAULT_ROUTE_LOCALE.location;
    
  const validLanguage = SUPPORTED_LANGUAGES.includes(languagePreference)
    ? languagePreference
    : DEFAULT_ROUTE_LOCALE.language;

  return {
    countryPreference: validCountry,
    languagePreference: validLanguage,
    isLoading: !!user?.id && isLoading,
    isInitialized: !!dbPreference?.locale_initialized_at,
    updateCountry: (country: RouteLocationCode) => updateCountryMutation.mutate(country),
    updateLanguage: (language: RouteLanguageCode) => updateLanguageMutation.mutate(language),
    initializeFromGeo: (country: RouteLocationCode, language: RouteLanguageCode) => 
      initializeFromGeoMutation.mutate({ country, language }),
    isUpdating: updateCountryMutation.isPending || updateLanguageMutation.isPending || initializeFromGeoMutation.isPending,
  };
}
