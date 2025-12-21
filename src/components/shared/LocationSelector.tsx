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
};

export const LocationSelector = () => {
  const localeRouting = useOptionalLocaleRouting();
  const { isPWA, isNativeApp } = useEnvironment();

  // Hide on PWA/native app
  if (isPWA || isNativeApp) {
    return null;
  }

  // Graceful fallback if not in locale routing context
  if (!localeRouting) {
    return null;
  }

  const { location, changeLocation } = localeRouting;

  const handleLocationChange = (newLocation: string) => {
    if (SUPPORTED_LOCATIONS.includes(newLocation as RouteLocationCode)) {
      changeLocation(newLocation as RouteLocationCode);
    }
  };

  const currentLocation = LOCATION_NAMES[location];

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Location
      </Label>
      <Select value={location} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue>
            {currentLocation && (
              <span className="flex items-center gap-2">
                <span>{currentLocation.flag}</span>
                <span>{currentLocation.name}</span>
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
        Affects pricing currency and regional availability
      </p>
    </div>
  );
};
