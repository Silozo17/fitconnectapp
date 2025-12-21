import { Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
  gb: { name: "UK", flag: "🇬🇧" },
  us: { name: "US", flag: "🇺🇸" },
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
 * Compact locale selector for the header.
 * Shows language and location dropdowns.
 * Hidden on PWA/native/Despia apps.
 */
export const HeaderLocaleSelector = () => {
  const localeRouting = useOptionalLocaleRouting();
  const { isPWA, isNativeApp, isDespia } = useEnvironment();

  // Hide on mobile apps
  if (isPWA || isNativeApp || isDespia) {
    return null;
  }

  // Graceful fallback if not in locale routing context
  if (!localeRouting) {
    return null;
  }

  const { language, location, changeLanguage, changeLocation } = localeRouting;

  const currentLocation = LOCATION_NAMES[location];
  const currentLanguage = LANGUAGE_NAMES[language];

  return (
    <div className="flex items-center gap-1">
      {/* Language Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="uppercase">{language}</span>
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuLabel className="text-xs">Language</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_LANGUAGES.map((lang) => {
            const langInfo = LANGUAGE_NAMES[lang];
            const isActive = lang === language;
            return (
              <DropdownMenuItem
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={isActive ? "bg-primary/10 text-primary" : ""}
              >
                {langInfo?.nativeName || lang.toUpperCase()}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Location Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors">
          <span>{currentLocation?.flag}</span>
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuLabel className="text-xs">Location</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SUPPORTED_LOCATIONS.map((loc) => {
            const locInfo = LOCATION_NAMES[loc];
            const currency = LOCATION_TO_CURRENCY[loc];
            const isActive = loc === location;
            return (
              <DropdownMenuItem
                key={loc}
                onClick={() => changeLocation(loc)}
                className={isActive ? "bg-primary/10 text-primary" : ""}
              >
                <span className="mr-2">{locInfo?.flag}</span>
                <span className="flex-1">{locInfo?.name}</span>
                <span className="text-xs text-muted-foreground">{currency}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
