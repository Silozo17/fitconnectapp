import { ChevronDown } from "lucide-react";
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
  SUPPORTED_LANGUAGES,
  RouteLanguageCode,
} from "@/lib/locale-routing";

// Language display names with flags
const LANGUAGE_NAMES: Record<RouteLanguageCode, { name: string; nativeName: string; flag: string }> = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  pl: { name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
};

/**
 * Compact language selector for the header.
 * Location selector is in footer only.
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

  const { language, changeLanguage } = localeRouting;

  const currentLanguage = LANGUAGE_NAMES[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition-colors">
        <span>{currentLanguage?.flag}</span>
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
              <span className="mr-2">{langInfo?.flag}</span>
              {langInfo?.nativeName || lang.toUpperCase()}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};