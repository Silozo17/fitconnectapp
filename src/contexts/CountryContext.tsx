import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RouteLocationCode, SUPPORTED_LOCATIONS, isValidLocation, COUNTRY_TO_LOCATION } from "@/lib/locale-routing";

// Storage key for country preference
const COUNTRY_STORAGE_KEY = "fitconnect_country";
const LOCATION_CACHE_KEY = "fitconnect_user_location";
const COUNTRY_EXPIRY_DAYS = 30;

interface StoredCountryPreference {
  countryCode: RouteLocationCode;
  source: 'geo' | 'manual';
  timestamp: number;
}

interface CountryContextType {
  /** Current active country code */
  countryCode: RouteLocationCode;
  /** Country detected from geo-location (null if not yet detected) */
  detectedCountry: RouteLocationCode | null;
  /** Whether user manually selected the country */
  isManualOverride: boolean;
  /** Loading state for initial detection */
  isLoading: boolean;
  /** Set country manually (creates override) */
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

interface CountryProviderProps {
  children: ReactNode;
}

export function CountryProvider({ children }: CountryProviderProps) {
  const [countryCode, setCountryCode] = useState<RouteLocationCode>(DEFAULT_COUNTRY);
  const [detectedCountry, setDetectedCountry] = useState<RouteLocationCode | null>(null);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: check storage and/or detect
  useEffect(() => {
    const initializeCountry = async () => {
      // First check stored preference
      const storedPref = getStoredCountryPreference();
      
      if (storedPref) {
        setCountryCode(storedPref.countryCode);
        setIsManualOverride(storedPref.source === 'manual');
        
        // If manual override, we're done
        if (storedPref.source === 'manual') {
          setDetectedCountry(storedPref.countryCode); // Assume detected was same
          setIsLoading(false);
          return;
        }
        
        // If geo source, use stored value but still set detected
        setDetectedCountry(storedPref.countryCode);
        setIsLoading(false);
        return;
      }
      
      // No stored preference - detect country
      try {
        // Check if we have cached location data first
        const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cachedLocation) {
          try {
            const parsed = JSON.parse(cachedLocation);
            if (parsed.country) {
              const locationCode = mapToLocationCode(parsed.country);
              setDetectedCountry(locationCode);
              setCountryCode(locationCode);
              setStoredCountryPreference(locationCode, 'geo');
              setIsLoading(false);
              return;
            }
          } catch {
            // Continue to API detection
          }
        }
        
        // Call edge function for detection
        const { data, error } = await supabase.functions.invoke('get-user-location');
        
        if (error) {
          console.error('Country detection error:', error);
          setDetectedCountry(DEFAULT_COUNTRY);
          setCountryCode(DEFAULT_COUNTRY);
          setStoredCountryPreference(DEFAULT_COUNTRY, 'geo');
        } else {
          const locationCode = mapToLocationCode(data?.country || data?.countryCode);
          setDetectedCountry(locationCode);
          setCountryCode(locationCode);
          setStoredCountryPreference(locationCode, 'geo');
        }
      } catch (err) {
        console.error('Country detection failed:', err);
        setDetectedCountry(DEFAULT_COUNTRY);
        setCountryCode(DEFAULT_COUNTRY);
        setStoredCountryPreference(DEFAULT_COUNTRY, 'geo');
      }
      
      setIsLoading(false);
    };

    initializeCountry();
  }, []);

  // Set country manually
  const setCountry = useCallback((code: RouteLocationCode) => {
    if (!isValidLocation(code)) {
      console.warn('Invalid country code:', code);
      return;
    }
    
    setCountryCode(code);
    setIsManualOverride(true);
    setStoredCountryPreference(code, 'manual');
  }, []);

  // Reset to geo-detected country
  const resetToDetected = useCallback(() => {
    const country = detectedCountry || DEFAULT_COUNTRY;
    setCountryCode(country);
    setIsManualOverride(false);
    setStoredCountryPreference(country, 'geo');
  }, [detectedCountry]);

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
