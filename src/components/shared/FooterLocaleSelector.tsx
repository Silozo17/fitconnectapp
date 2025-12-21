import { Globe, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOptionalLocaleRouting } from "@/contexts/LocaleRoutingContext";
import { useEnvironment } from "@/hooks/useEnvironment";
import {
  SUPPORTED_LOCATIONS,
  SUPPORTED_LANGUAGES,
  RouteLocationCode,
  RouteLanguageCode,
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

// Language display names
const LANGUAGE_NAMES: Record<RouteLanguageCode, { name: string; nativeName: string }> = {
  en: { name: "English", nativeName: "English" },
  pl: { name: "Polish", nativeName: "Polski" },
};

/**
 * Detailed locale selector for the footer.
 * Shows full language and location names.
 * Hidden on PWA/native/Despia apps.
 */
export const FooterLocaleSelector = () => {
  const localeRouting = useOptionalLocaleRouting();
  const { isPWA, isNativeApp, isDespia } = useEnvironment();

  // Hide on mobile apps
  if (isPWA || isNativeApp || isDespia) {
    return null;
  }

  // Graceful fallback if not in locale routing context
  // This shouldn't happen on website routes, but provides safety
  if (!localeRouting) {
    return null;
  }

  const { language, location, changeLanguage, changeLocation } = localeRouting;

  const currentLocation = LOCATION_NAMES[location];
  const currentLanguage = LANGUAGE_NAMES[language];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Language Select */}
      <div className="flex-1 max-w-[200px]">
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Globe className="w-4 h-4" />
          <span>Language</span>
        </div>
        <Select value={language} onValueChange={(val) => changeLanguage(val as RouteLanguageCode)}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue>
              {currentLanguage?.nativeName || language.toUpperCase()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const langInfo = LANGUAGE_NAMES[lang];
              return (
                <SelectItem key={lang} value={lang}>
                  {langInfo?.nativeName || lang.toUpperCase()}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Location Select */}
      <div className="flex-1 max-w-[280px]">
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Location</span>
        </div>
        <Select value={location} onValueChange={(val) => changeLocation(val as RouteLocationCode)}>
          <SelectTrigger className="w-full bg-background">
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
              const locInfo = LOCATION_NAMES[loc];
              const currency = LOCATION_TO_CURRENCY[loc];
              return (
                <SelectItem key={loc} value={loc}>
                  <div className="flex items-center gap-2">
                    <span>{locInfo?.flag}</span>
                    <span>{locInfo?.name}</span>
                    <span className="text-muted-foreground">({currency})</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
