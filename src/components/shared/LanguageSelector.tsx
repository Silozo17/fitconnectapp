import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { useAuth } from "@/contexts/AuthContext";
import { 
  SUPPORTED_LANGUAGES,
  LANGUAGE_STORAGE_KEY, 
  DEFAULT_LANGUAGE, 
  type LanguageCode 
} from "@/i18n";
import { RouteLanguageCode } from "@/lib/locale-routing";

// Languages that will be available in future releases (not yet translated)
const comingSoonLanguages = [
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
];

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const { user } = useAuth();
  const userLocale = useUserLocalePreference();

  const handleLanguageChange = (languageCode: string) => {
    // Validate against supported languages
    const validCodes = SUPPORTED_LANGUAGES.map(l => l.code) as string[];
    if (!validCodes.includes(languageCode)) {
      console.warn(`Unsupported language: ${languageCode}, falling back to English`);
      languageCode = DEFAULT_LANGUAGE;
    }
    
    // Persist to localStorage
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    } catch {
      // Ignore storage errors (private browsing, etc.)
    }
    
    // Change i18n language
    changeLanguage(languageCode as LanguageCode);

    // If user is authenticated, also update DB preference
    if (user) {
      // Map i18n language code to RouteLanguageCode
      const routeLanguage = languageCode as RouteLanguageCode;
      if (routeLanguage === 'en' || routeLanguage === 'pl') {
        userLocale.updateLanguage(routeLanguage);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        {t('preferences.language')}
      </Label>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* Supported languages */}
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span>{lang.nativeName}</span>
            </SelectItem>
          ))}
          {/* Coming soon languages (disabled) */}
          {comingSoonLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} disabled>
              <div className="flex items-center justify-between gap-3">
                <span>{lang.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {tCommon('common.comingSoon')}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {t('preferences.languageHint')}
      </p>
    </div>
  );
};

export { LanguageSelector };
