import { useState, useEffect, useCallback } from "react";

export type CookieCategory = "essential" | "functional" | "analytics" | "marketing";

export interface CookieSettings {
  essential: boolean; // Always true, cannot be disabled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: string;
}

const COOKIE_CONSENT_KEY = "fitconnect_cookie_consent";
const CONSENT_VERSION = "1.0";
const CONSENT_EXPIRY_DAYS = 365;

const defaultSettings: CookieSettings = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

export const useCookieConsent = () => {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const parsed: CookieSettings = JSON.parse(stored);
        const expiryTime = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        
        // Check if consent is still valid and version matches
        if (
          Date.now() - parsed.timestamp < expiryTime &&
          parsed.version === CONSENT_VERSION
        ) {
          setSettings(parsed);
        } else {
          // Expired or outdated - remove and show banner again
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setSettings(null);
        }
      } catch {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setSettings(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Check if consent has been given (any decision made)
  const hasConsent = settings !== null;

  // Check if a specific category is allowed
  const hasCategory = useCallback(
    (category: CookieCategory): boolean => {
      if (!settings) return category === "essential";
      return settings[category] ?? false;
    },
    [settings]
  );

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const newSettings: CookieSettings = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  }, []);

  // Accept only essential cookies
  const acceptEssential = useCallback(() => {
    const newSettings: CookieSettings = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  }, []);

  // Save custom preferences
  const savePreferences = useCallback((preferences: Partial<Omit<CookieSettings, "essential" | "timestamp" | "version">>) => {
    const newSettings: CookieSettings = {
      essential: true, // Always true
      functional: preferences.functional ?? false,
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  }, []);

  // Reset consent (for managing preferences)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setSettings(null);
  }, []);

  return {
    settings,
    isLoading,
    hasConsent,
    hasCategory,
    acceptAll,
    acceptEssential,
    savePreferences,
    resetConsent,
  };
};
