import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import CookieSettingsModal from "./CookieSettingsModal";

const CookieBanner = () => {
  const {
    settings,
    isLoading,
    hasConsent,
    acceptAll,
    acceptEssential,
    savePreferences,
  } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);

  // Don't show anything while loading or if consent already given
  if (isLoading || hasConsent) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon and Text */}
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">We value your privacy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies to enhance your browsing experience, show you coaches near you,
                  and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.
                  Read our{" "}
                  <Link to="/privacy#cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex-1 md:flex-none"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssential}
                className="flex-1 md:flex-none"
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="flex-1 md:flex-none"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <CookieSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        currentSettings={settings}
        onSave={savePreferences}
        onAcceptAll={acceptAll}
      />
    </>
  );
};

export default CookieBanner;
