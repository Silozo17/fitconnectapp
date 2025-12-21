import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
import { AnimationSettingsProvider } from "@/contexts/AnimationSettingsContext";
import { CelebrationListeners } from "@/components/gamification/CelebrationListeners";
import { CountryProvider } from "@/contexts/CountryContext";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import ScrollToTop from "./components/shared/ScrollToTop";
import ScrollRestoration from "./components/shared/ScrollRestoration";
import { ReloadPrompt } from "./components/pwa/ReloadPrompt";
import { InstallBanner } from "./components/pwa/InstallBanner";
import { CookieConsentBanner } from "./components/shared/CookieConsentBanner";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

// Routers - explicit separation between website and app
import { WebsiteRouter } from "./components/routing/WebsiteRouter";
import { AppRouter } from "./components/routing/AppRouter";

// Language persistence component (must be inside i18n context)
function LanguagePersistence() {
  useLanguagePersistence();
  return null;
}

// Despia native initialization (Android status bar config)
function DespiaInitializer() {
  useAppInitialization();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache
      refetchOnWindowFocus: false, // Prevent refetches when switching tabs
      retry: 1, // Single retry for failed requests
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ReloadPrompt />
          <DespiaInitializer />
          <BrowserRouter>
            <InstallBanner />
            <ScrollRestoration />
            <CookieConsentProvider>
              <CookieConsentBanner />
              <CountryProvider>
                <AuthProvider>
                  <AnimationSettingsProvider>
                    <CelebrationProvider>
                      <CelebrationListeners />
                      <AdminProvider>
                        <LocaleProvider>
                          <LanguagePersistence />
                          <Routes>
                            {/* App routes - NO locale URL logic (uses stored preferences only) */}
                            <Route path="/dashboard/*" element={<AppRouter />} />
                            <Route path="/onboarding/*" element={<AppRouter />} />
                            <Route path="/docs/*" element={<AppRouter />} />
                            <Route path="/auth" element={<AppRouter />} />
                            <Route path="/subscribe/*" element={<AppRouter />} />
                            
                            {/* Website routes - WITH locale URL logic */}
                            <Route path="/*" element={<WebsiteRouter />} />
                          </Routes>
                          <ScrollToTop />
                        </LocaleProvider>
                      </AdminProvider>
                    </CelebrationProvider>
                  </AnimationSettingsProvider>
                </AuthProvider>
              </CountryProvider>
            </CookieConsentProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
