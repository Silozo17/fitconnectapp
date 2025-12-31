import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RouteLocationCode, SUPPORTED_LOCATIONS, isValidLocation, COUNTRY_TO_LOCATION } from "@/lib/locale-routing";
import { User } from "@supabase/supabase-js";

// Storage key for country preference (localStorage fallback for unauthenticated users)
const COUNTRY_STORAGE_KEY = "fitconnect_country";
const LOCATION_CACHE_KEY = "fitconnect_user_location";
const COUNTRY_EXPIRY_DAYS = 30;

interface StoredCountryPreference {
  countryCode: RouteLocationCode;
  source: 'geo' | 'manual';
  timestamp: number;
}

interface CountryContextType {
  /** Current active country code (resolved using priority order) */
  countryCode: RouteLocationCode;
  /** Country detected from geo-location (null if not yet detected) */
  detectedCountry: RouteLocationCode | null;
  /** Whether user manually selected the country in this session */
  isManualOverride: boolean;
  /** Loading state for initial detection */
  isLoading: boolean;
  /** Set country manually (highest priority - creates override) */
  setCountry: (code: RouteLocationCode) => void;
  /** Reset to geo-detected country */
  resetToDetected: () => void;
  /** Clear all stored country preferences */
  clearCountry: () => void;
}

const CountryContext = createContext<CountryContextType | null>(null);

// Default fallback is UK
const DEFAULT_COUNTRY: RouteLocationCode = 'gb';

/**
 * Map full country name or code to RouteLocationCode
 * IMPORTANT: Do NOT infer currency from language - only use country data
 */
function mapToLocationCode(countryNameOrCode: string | null): RouteLocationCode {
  if (!countryNameOrCode) return DEFAULT_COUNTRY;
  
  const normalized = countryNameOrCode.toLowerCase().trim();
  
  // Check if it's already a valid location code
  if (isValidLocation(normalized)) {
    return normalized;
  }
  
  // Check the country-to-location mapping
  const mapped = COUNTRY_TO_LOCATION[normalized];
  if (mapped) {
    return mapped;
  }
  
  // Try common variations - only map to supported locations
  const variations: Record<string, RouteLocationCode> = {
    'united kingdom': 'gb',
    'great britain': 'gb',
    'england': 'gb',
    'scotland': 'gb',
    'wales': 'gb',
    'northern ireland': 'gb',
    'united states': 'us',
    'united states of america': 'us',
    'usa': 'us',
    'poland': 'pl',
    'polska': 'pl',
    'australia': 'au',
    'canada': 'ca',
    'ireland': 'ie',
  };
  
  return variations[normalized] || DEFAULT_COUNTRY;
}

/**
 * Get stored country preference from localStorage
 */
function getStoredCountryPreference(): StoredCountryPreference | null {
  try {
    const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as StoredCountryPreference;
    const expiryTime = COUNTRY_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    // Check if expired
    if (Date.now() - parsed.timestamp > expiryTime) {
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
      return null;
    }
    
    // Validate the stored country code
    if (!isValidLocation(parsed.countryCode)) {
      localStorage.removeItem(COUNTRY_STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch {
    localStorage.removeItem(COUNTRY_STORAGE_KEY);
    return null;
  }
}

/**
 * Store country preference in localStorage
 */
function setStoredCountryPreference(countryCode: RouteLocationCode, source: 'geo' | 'manual'): void {
  try {
    const preference: StoredCountryPreference = {
      countryCode,
      source,
      timestamp: Date.now(),
    };
    localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(preference));
  } catch (error) {
    console.error('Failed to store country preference:', error);
  }
}

/**
 * Fetch user's country preference from database
 */
async function fetchUserCountryPreference(userId: string): Promise<RouteLocationCode | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("country_preference")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user country preference:", error);
      return null;
    }

    const pref = data?.country_preference;
    if (pref && isValidLocation(pref)) {
      return pref as RouteLocationCode;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch user country preference:", err);
    return null;
  }
}

/**
 * Save user's country preference to database
 */
async function saveUserCountryPreference(userId: string, countryCode: RouteLocationCode): Promise<void> {
  try {
    const { error } = await supabase
      .from("user_profiles")
      .update({ 
        country_preference: countryCode,
        locale_initialized_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error saving user country preference:", error);
    }
  } catch (err) {
    console.error("Failed to save user country preference:", err);
  }
}

/**
 * Detect country from IP/device geolocation
 */
async function detectCountryFromGeo(): Promise<RouteLocationCode> {
  try {
    // Check if we have cached location data first
    const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        if (parsed.country) {
          return mapToLocationCode(parsed.country);
        }
      } catch {
        // Continue to API detection
      }
    }
    
    // Call edge function for detection
    const { data, error } = await supabase.functions.invoke('get-user-location');
    
    if (error) {
      console.error('Country detection error:', error);
      return DEFAULT_COUNTRY;
    }
    
    return mapToLocationCode(data?.country || data?.countryCode);
  } catch (err) {
    console.error('Country detection failed:', err);
    return DEFAULT_COUNTRY;
  }
}

interface CountryProviderProps {
  children: ReactNode;
}

/**
 * CountryProvider resolves active country using this priority order:
 * 
 * 1. User-selected location (manual override in current session)
 * 2. Saved user country preference (from DB if logged in, localStorage otherwise)
 * 3. Device/IP geolocation fallback
 * 
 * IMPORTANT: Currency is NEVER inferred from language - only from country.
 */
export function CountryProvider({ children }: CountryProviderProps) {
  // Use direct Supabase auth instead of useAuth to avoid circular dependency
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [countryCode, setCountryCode] = useState<RouteLocationCode>(DEFAULT_COUNTRY);
  const [detectedCountry, setDetectedCountry] = useState<RouteLocationCode | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes directly from Supabase
  // OPTIMIZED: Only subscribe to onAuthStateChange, no initial getSession call
  // This prevents duplicate auth API calls since AuthContext already does initial fetch
  useEffect(() => {
    // Listen for auth changes - this will fire with initial state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Resolve country using priority order
  // OPTIMIZED: Wait for auth to be ready before resolving to prevent race conditions
  useEffect(() => {
    // Don't resolve until auth state is known
    if (!authReady) return;
    
    const resolveCountry = async () => {
      setIsLoading(true);

      // Priority 1: Check for manual override in localStorage
      const storedPref = getStoredCountryPreference();
      if (storedPref?.source === 'manual') {
        // Manual override takes highest priority
        setCountryCode(storedPref.countryCode);
        setIsManualOverride(true);
        setDetectedCountry(storedPref.countryCode);
        setIsLoading(false);
        return;
      }

      // Priority 2: Check saved user preference (DB for logged-in users)
      if (user?.id) {
        const dbCountry = await fetchUserCountryPreference(user.id);
        if (dbCountry) {
          setCountryCode(dbCountry);
          setIsManualOverride(false);
          setDetectedCountry(dbCountry);
          // Also update localStorage for consistency
          setStoredCountryPreference(dbCountry, 'geo');
          setIsLoading(false);
          return;
        }
      }

      // Priority 2b: For unauthenticated users, check localStorage geo preference
      if (!user?.id && storedPref?.source === 'geo') {
        setCountryCode(storedPref.countryCode);
        setIsManualOverride(false);
        setDetectedCountry(storedPref.countryCode);
        setIsLoading(false);
        return;
      }

      // Priority 3: Geo-detection fallback
      const geoCountry = await detectCountryFromGeo();
      setDetectedCountry(geoCountry);
      setCountryCode(geoCountry);
      setIsManualOverride(false);
      setStoredCountryPreference(geoCountry, 'geo');
      
      // For logged-in users, also save to DB
      if (user?.id) {
        await saveUserCountryPreference(user.id, geoCountry);
      }

      setIsLoading(false);
    };

    resolveCountry();
  }, [user?.id, authReady]);

  // Set country manually (highest priority)
  const setCountry = useCallback((code: RouteLocationCode) => {
    if (!isValidLocation(code)) {
      console.warn('Invalid country code:', code);
      return;
    }
    
    setCountryCode(code);
    setIsManualOverride(true);
    setStoredCountryPreference(code, 'manual');
    
    // For logged-in users, also save to DB
    if (user?.id) {
      saveUserCountryPreference(user.id, code);
    }
  }, [user?.id]);

  // Reset to geo-detected country
  const resetToDetected = useCallback(async () => {
    const country = detectedCountry || await detectCountryFromGeo();
    setCountryCode(country);
    setDetectedCountry(country);
    setIsManualOverride(false);
    setStoredCountryPreference(country, 'geo');
    
    // For logged-in users, also update DB
    if (user?.id) {
      saveUserCountryPreference(user.id, country);
    }
  }, [detectedCountry, user?.id]);

  // Clear all stored preferences
  const clearCountry = useCallback(() => {
    localStorage.removeItem(COUNTRY_STORAGE_KEY);
    setCountryCode(DEFAULT_COUNTRY);
    setDetectedCountry(null);
    setIsManualOverride(false);
  }, []);

  const value: CountryContextType = {
    countryCode,
    detectedCountry,
    isManualOverride,
    isLoading,
    setCountry,
    resetToDetected,
    clearCountry,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

/**
 * Hook to access country context
 */
export function useCountryContext(): CountryContextType {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountryContext must be used within a CountryProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not within provider
 */
export function useOptionalCountryContext(): CountryContextType | null {
  return useContext(CountryContext);
}
