import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const { consent, updateConsent, acceptAll, rejectAll } = useCookieConsentContext();
  
  const [localPrefs, setLocalPrefs] = useState({
    location: consent?.location ?? false,
    preferences: consent?.preferences ?? false,
    analytics: consent?.analytics ?? false,
  });

  // Sync local prefs when consent changes or modal opens
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
      label: "Essential Cookies",
      description: "Required for login, security, and core app functionality. Cannot be disabled.",
      icon: Shield,
      enabled: true,
      disabled: true,
    },
    {
      id: "location" as const,
      label: "Location Services",
      description: "Used to show coaches and leaderboards near you based on your approximate location.",
      icon: MapPin,
      enabled: localPrefs.location,
      disabled: false,
    },
    {
      id: "preferences" as const,
      label: "Preferences",
      description: "Remembers your settings like theme preference and dismissed banners between visits.",
      icon: Settings,
      enabled: localPrefs.preferences,
      disabled: false,
    },
    {
      id: "analytics" as const,
      label: "Analytics",
      description: "Helps us understand how you use the platform so we can improve it.",
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
            <DialogTitle>Cookie Preferences</DialogTitle>
          </div>
          <DialogDescription>
            Choose which cookies you'd like to allow. Your choices will be saved for future visits.{" "}
            <Link to="/privacy" className="underline hover:text-primary">
              Learn more
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
            Reject All
          </Button>
          <Button variant="outline" size="sm" onClick={handleAcceptAll}>
            Accept All
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
