import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie, MapPin, Settings, BarChart3, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCookieConsentContext } from "@/contexts/CookieConsentContext";

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CookiePreferencesModal = ({
  open,
  onOpenChange,
}: CookiePreferencesModalProps) => {
  const { t } = useTranslation();
  const { consent, updateConsent, acceptAll, rejectAll } = useCookieConsentContext();
  
  const [localPrefs, setLocalPrefs] = useState({
    location: consent?.location ?? false,
    preferences: consent?.preferences ?? false,
    analytics: consent?.analytics ?? false,
  });

  useEffect(() => {
    if (open) {
      setLocalPrefs({
        location: consent?.location ?? false,
        preferences: consent?.preferences ?? false,
        analytics: consent?.analytics ?? false,
      });
    }
  }, [open, consent]);

  const handleSave = () => {
    updateConsent(localPrefs);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    onOpenChange(false);
  };

  const categories = [
    {
      id: "essential" as const,
      label: t('cookies.preferences.essential.label'),
      description: t('cookies.preferences.essential.description'),
      icon: Shield,
      enabled: true,
      disabled: true,
    },
    {
      id: "location" as const,
      label: t('cookies.preferences.location.label'),
      description: t('cookies.preferences.location.description'),
      icon: MapPin,
      enabled: localPrefs.location,
      disabled: false,
    },
    {
      id: "preferences" as const,
      label: t('cookies.preferences.preferences.label'),
      description: t('cookies.preferences.preferences.description'),
      icon: Settings,
      enabled: localPrefs.preferences,
      disabled: false,
    },
    {
      id: "analytics" as const,
      label: t('cookies.preferences.analytics.label'),
      description: t('cookies.preferences.analytics.description'),
      icon: BarChart3,
      enabled: localPrefs.analytics,
      disabled: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </div>
            <DialogTitle>{t('cookies.preferences.title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('cookies.preferences.description')}{" "}
            <Link to="/privacy" className="underline hover:text-primary">
              {t('cookies.preferences.learnMore')}
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {categories.map((category, index) => (
            <div key={category.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                    <category.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {category.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={category.id}
                  checked={category.enabled}
                  disabled={category.disabled}
                  onCheckedChange={(checked) => {
                    if (category.id !== "essential") {
                      setLocalPrefs((prev) => ({
                        ...prev,
                        [category.id]: checked,
                      }));
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleRejectAll}>
            {t('cookies.preferences.rejectAll')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAcceptAll}>
            {t('cookies.preferences.acceptAll')}
          </Button>
          <Button size="sm" onClick={handleSave}>
            {t('cookies.preferences.savePreferences')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
