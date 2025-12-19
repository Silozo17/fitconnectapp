import { useState, useEffect } from "react";
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
import { Shield, MapPin, BarChart3, Megaphone } from "lucide-react";
import type { CookieSettings } from "@/hooks/useCookieConsent";

interface CookieSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: CookieSettings | null;
  onSave: (settings: { functional: boolean; analytics: boolean; marketing: boolean }) => void;
  onAcceptAll: () => void;
}

const CookieSettingsModal = ({
  open,
  onOpenChange,
  currentSettings,
  onSave,
  onAcceptAll,
}: CookieSettingsModalProps) => {
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setFunctional(currentSettings.functional);
      setAnalytics(currentSettings.analytics);
      setMarketing(currentSettings.marketing);
    }
  }, [currentSettings, open]);

  const handleSave = () => {
    onSave({ functional, analytics, marketing });
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    onAcceptAll();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage how we use cookies and similar technologies. Essential cookies are required
            for the site to function and cannot be disabled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Essential Cookies - Always enabled */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-primary" />
                <Label className="font-medium">Essential Cookies</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Required for the website to function properly. These cannot be disabled.
                Includes authentication, security features, and basic site functionality.
              </p>
            </div>
            <Switch checked disabled className="opacity-50" />
          </div>

          <Separator />

          {/* Functional Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-500" />
                <Label htmlFor="functional" className="font-medium">
                  Functional Cookies
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Enable enhanced features like location-based coach recommendations,
                remembering your preferences, and personalised content.
              </p>
            </div>
            <Switch
              id="functional"
              checked={functional}
              onCheckedChange={setFunctional}
            />
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <Label htmlFor="analytics" className="font-medium">
                  Analytics Cookies
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Help us understand how visitors interact with our website. This data helps
                us improve our services and user experience.
              </p>
            </div>
            <Switch
              id="analytics"
              checked={analytics}
              onCheckedChange={setAnalytics}
            />
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="h-4 w-4 text-orange-500" />
                <Label htmlFor="marketing" className="font-medium">
                  Marketing Cookies
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Used to display relevant advertisements and sponsored content based on
                your interests. May be set by third-party advertising partners.
              </p>
            </div>
            <Switch
              id="marketing"
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Save Preferences
          </Button>
          <Button onClick={handleAcceptAll}>Accept All</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookieSettingsModal;
