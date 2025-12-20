import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  SUPPORTED_LANGUAGES, 
  DEV_LANGUAGES,
  ALL_LANGUAGES,
  LANGUAGE_STORAGE_KEY, 
  DEFAULT_LANGUAGE, 
  type LanguageCode 
} from "@/i18n";

// Languages that will be available in future releases (not yet translated)
const comingSoonLanguages = [
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
];

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useTranslation();
  
  // Show dev languages only in development mode
  const availableLanguages = import.meta.env.DEV 
    ? ALL_LANGUAGES 
    : SUPPORTED_LANGUAGES;
  
  // Dev language codes for badge display
  const devLanguageCodes = DEV_LANGUAGES.map(l => l.code) as string[];

  const handleLanguageChange = (languageCode: string) => {
    // Validate against available languages (includes Polish in dev mode)
    const validCodes = availableLanguages.map(l => l.code) as string[];
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
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Platform Language
      </Label>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* Available languages (includes Polish in dev mode) */}
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                {devLanguageCodes.includes(lang.code) && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-amber-600 border-amber-400">
                    Dev
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
          {/* Coming soon languages (disabled) */}
          {comingSoonLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} disabled>
              <div className="flex items-center justify-between gap-3">
                <span>{lang.name}</span>
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {import.meta.env.DEV 
          ? "Dev mode: Polish available for testing" 
          : "More languages coming soon"}
      </p>
    </div>
  );
};

export { LanguageSelector };
