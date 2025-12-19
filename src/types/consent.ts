export interface CookieConsent {
  essential: true; // Always true - required for app functionality
  location: boolean; // IP-based location detection
  preferences: boolean; // Theme, language, dismissed banners
  analytics: boolean; // Future: usage tracking
  timestamp: number; // When consent was given/updated
}

export const CONSENT_STORAGE_KEY = "fitconnect_cookie_consent";

export const DEFAULT_CONSENT: CookieConsent = {
  essential: true,
  location: false,
  preferences: false,
  analytics: false,
  timestamp: Date.now(),
};

export const FULL_CONSENT: CookieConsent = {
  essential: true,
  location: true,
  preferences: true,
  analytics: true,
  timestamp: Date.now(),
};
