import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useClientAllergens } from "@/hooks/useClientAllergens";

const ALLERGEN_EMOJIS: Record<string, string> = {
  gluten: '🌾',
  dairy: '🥛',
  eggs: '🥚',
  nuts: '🌰',
  peanuts: '🥜',
  soy: '🫘',
  shellfish: '🦐',
  fish: '🐟',
  sesame: '🌱',
  sulfites: '🍷',
  mustard: '🟡',
  celery: '🥬',
  lupin: '🌸',
  molluscs: '🦪',
};

export const AllergenPreferencesCard = () => {
  const { allergenPreferences, isLoading, toggleAllergen } = useClientAllergens();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Food Allergens
        </CardTitle>
        <CardDescription>
          Select allergens you need to avoid. We'll warn you when foods contain these ingredients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allergenPreferences.map((allergen) => (
            <div
              key={allergen.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                allergen.enabled
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-muted/30 border-transparent'
              }`}
            >
              <Label
                htmlFor={`allergen-${allergen.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="text-lg">{ALLERGEN_EMOJIS[allergen.id] || '⚠️'}</span>
                <span className="font-medium">{allergen.name}</span>
              </Label>
              <Switch
                id={`allergen-${allergen.id}`}
                checked={allergen.enabled}
                onCheckedChange={() => toggleAllergen(allergen.id)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          These preferences are used to highlight potential allergens in food searches and grocery lists.
          Always check product labels as information may change.
        </p>
      </CardContent>
    </Card>
  );
};

export default AllergenPreferencesCard;
