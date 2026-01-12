import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { useOptionalLocaleRouting } from "@/contexts/LocaleRoutingContext";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { useAuth } from "@/contexts/AuthContext";
import {
  SUPPORTED_LOCATIONS,
  RouteLocationCode,
  LOCATION_TO_CURRENCY,
} from "@/lib/locale-routing";

// Location display names with flags
const LOCATION_NAMES: Record<RouteLocationCode, { name: string; flag: string }> = {
  gb: { name: "United Kingdom", flag: "🇬🇧" },
  us: { name: "United States", flag: "🇺🇸" },
  ie: { name: "Ireland", flag: "🇮🇪" },
  pl: { name: "Poland", flag: "🇵🇱" },
  au: { name: "Australia", flag: "🇦🇺" },
  ca: { name: "Canada", flag: "🇨🇦" },
  nz: { name: "New Zealand", flag: "🇳🇿" },
  ae: { name: "United Arab Emirates", flag: "🇦🇪" },
};

export const LocationSelector = () => {
  const { t } = useTranslation("settings");
  const localeRouting = useOptionalLocaleRouting();
  const { isPWA, isNativeApp } = useEnvironment();
  const { user } = useAuth();
  const userLocale = useUserLocalePreference();

  // Hide on PWA/native app
  if (isPWA || isNativeApp) {
    return null;
  }

  // Determine which mode we're in:
  // - Website mode: use LocaleRoutingContext (URL-based)
  // - Dashboard mode: use DB-backed preferences
  const isWebsiteMode = !!localeRouting;

  // Get current location based on mode
  const currentLocation = isWebsiteMode 
    ? localeRouting.location 
    : userLocale.countryPreference;

  const handleLocationChange = (newLocation: string) => {
    if (!SUPPORTED_LOCATIONS.includes(newLocation as RouteLocationCode)) {
      return;
    }

    if (isWebsiteMode) {
      // Website mode: update URL
      localeRouting.changeLocation(newLocation as RouteLocationCode);
    } else {
      // Dashboard mode: update DB preference
      userLocale.updateCountry(newLocation as RouteLocationCode);
    }
  };

  const locationInfo = LOCATION_NAMES[currentLocation];

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {t("preferences.location")}
      </Label>
      <Select value={currentLocation} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue>
            {locationInfo && (
              <span className="flex items-center gap-2">
                <span>{locationInfo.flag}</span>
                <span>{locationInfo.name}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LOCATIONS.map((loc) => {
            const { name, flag } = LOCATION_NAMES[loc];
            const currency = LOCATION_TO_CURRENCY[loc];
            return (
              <SelectItem key={loc} value={loc}>
                <div className="flex items-center gap-2">
                  <span>{flag}</span>
                  <span>{name}</span>
                  <span className="text-muted-foreground">({currency})</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t("preferences.locationDescription")}
      </p>
    </div>
  );
};
