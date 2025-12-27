import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCookieConsentContext } from "@/contexts/CookieConsentContext";
import { CookiePreferencesModal } from "./CookiePreferencesModal";

export const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const { showBanner, acceptAll, rejectAll } = useCookieConsentContext();
  const [showPreferences, setShowPreferences] = useState(false);

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-4 duration-300">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {t('cookies.banner.title')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('cookies.banner.description')}{" "}
                  <Link to="/privacy" className="underline hover:text-primary">
                    {t('cookies.banner.privacyPolicy')}
                  </Link>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="gap-1.5"
                aria-label={t('cookies.banner.manage')}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden xs:inline">{t('cookies.banner.manage')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
              >
                {t('cookies.banner.rejectAll')}
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
              >
                {t('cookies.banner.acceptAll')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CookiePreferencesModal 
        open={showPreferences} 
        onOpenChange={setShowPreferences} 
      />
    </>
  );
};
