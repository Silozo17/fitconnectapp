import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

const languages = [
  { code: 'en', name: 'English', available: true },
  { code: 'es', name: 'Spanish', available: false },
  { code: 'pl', name: 'Polish', available: false },
  { code: 'de', name: 'German', available: false },
];

const LanguageSelector = () => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Platform Language
      </Label>
      <Select defaultValue="en" disabled>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              disabled={!lang.available}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{lang.name}</span>
                {!lang.available && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        More languages coming soon
      </p>
    </div>
  );
};

export { LanguageSelector };
