import { useState, useEffect, useCallback } from "react";
import {
  CookieConsent,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  FULL_CONSENT,
} from "@/types/consent";

interface UseCookieConsentReturn {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (partial: Partial<Omit<CookieConsent, "essential" | "timestamp">>) => void;
  resetConsent: () => void;
}

export const useCookieConsent = (): UseCookieConsentReturn => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CookieConsent;
        setConsent(parsed);
      }
    } catch {
      // Invalid stored consent, will show banner
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    }
    setHasChecked(true);
  }, []);

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent(FULL_CONSENT);
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent(DEFAULT_CONSENT);
  }, [saveConsent]);

  const updateConsent = useCallback(
    (partial: Partial<Omit<CookieConsent, "essential" | "timestamp">>) => {
      const current = consent || DEFAULT_CONSENT;
      saveConsent({
        ...current,
        ...partial,
        essential: true, // Always true
        timestamp: Date.now(),
      });
    },
    [consent, saveConsent]
  );

  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(null);
  }, []);

  return {
    consent,
    hasConsented: consent !== null,
    showBanner: hasChecked && consent === null,
    acceptAll,
    rejectAll,
    updateConsent,
    resetConsent,
  };
};
