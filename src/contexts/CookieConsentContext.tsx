import React, { createContext, useContext, ReactNode } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { CookieConsent } from "@/types/consent";

interface CookieConsentContextValue {
  consent: CookieConsent | null;
  hasConsented: boolean;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updateConsent: (partial: Partial<Omit<CookieConsent, "essential" | "timestamp">>) => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const consentState = useCookieConsent();

  return (
    <CookieConsentContext.Provider value={consentState}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsentContext = (): CookieConsentContextValue => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsentContext must be used within a CookieConsentProvider");
  }
  return context;
};
