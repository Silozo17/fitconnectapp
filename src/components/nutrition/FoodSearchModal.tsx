import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { useOpenFoodFactsAutocomplete, AutocompleteSuggestion, suggestionToFood } from "@/hooks/useOpenFoodFacts";
import { useUserLocalePreference } from "@/hooks/useUserLocalePreference";
import { cn } from "@/lib/utils";

interface FoodResult {
  external_id: string;
  name: string;
  brand_name?: string | null;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  serving_size_g?: number;
  serving_description?: string;
  allergens?: string[];
}

interface FoodSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onFoodSelected: (food: FoodResult) => void;
  clientAllergens?: string[];
}

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const FoodSearchModal = ({
  open,
  onOpenChange,
  mealType,
  onFoodSelected,
  clientAllergens = [],
}: FoodSearchModalProps) => {
  const [query, setQuery] = useState("");
  const { countryPreference } = useUserLocalePreference();

  const { data: results = [], isLoading: isSearching } = useOpenFoodFactsAutocomplete(
    query,
    open && query.length >= 2,
    countryPreference,
    300
  );

  const hasSearched = query.length >= 2;

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    const food = suggestionToFood(suggestion);
    onFoodSelected({
      external_id: food.external_id,
      name: food.name,
      brand_name: food.brand_name,
      calories_per_100g: food.calories_per_100g,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      serving_size_g: food.serving_size_g,
      serving_description: food.serving_description,
      allergens: food.allergens,
    });
    onOpenChange(false);
  };

  const hasAllergenConflict = (suggestion: AutocompleteSuggestion) => {
    if (!suggestion.allergens || !clientAllergens.length) return false;
    return suggestion.allergens.some(a => 
      clientAllergens.some(ca => 
        a.toLowerCase().includes(ca.toLowerCase()) || 
        ca.toLowerCase().includes(a.toLowerCase())
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Add to {MEAL_LABELS[mealType]}</DialogTitle>
          <DialogDescription className="sr-only">
            Search for foods to add to your meal
          </DialogDescription>
        </DialogHeader>

        <div className="relative shrink-0 px-6">
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search foods (e.g., chicken breast, rice)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 min-h-0 mt-4 px-6 pb-6">
          <ScrollArea className="h-full max-h-[55dvh]">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2 pr-4">
                {results.map((suggestion) => {
                  const hasConflict = hasAllergenConflict(suggestion);
                  return (
                    <button
                      key={suggestion.external_id}
                      onClick={() => handleSelect(suggestion)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-colors",
                        hasConflict 
                          ? "bg-warning/10 border border-warning/30 hover:bg-warning/20" 
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{suggestion.product_name}</p>
                            {hasConflict && (
                              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                            )}
                          </div>
                          {suggestion.brand && (
                            <p className="text-xs text-muted-foreground truncate">
                              {suggestion.brand}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-muted-foreground">per 100g</span>
                            <span className="font-medium">{Math.round(suggestion.calories_per_100g || 0)} kcal</span>
                          </div>
                        </div>
                        <div className="text-right text-xs shrink-0 space-y-0.5">
                          <p><span className="text-blue-500 font-medium">{suggestion.protein_g || 0}g</span> P</p>
                          <p><span className="text-amber-500 font-medium">{suggestion.carbs_g || 0}g</span> C</p>
                          <p><span className="text-rose-500 font-medium">{suggestion.fat_g || 0}g</span> F</p>
                        </div>
                      </div>
                      {hasConflict && suggestion.allergens && (
                        <p className="text-xs text-warning mt-2">
                          Contains: {suggestion.allergens.join(', ')}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : hasSearched && !isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No foods found</p>
                <p className="text-sm text-muted-foreground/70">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Search for foods</p>
                <p className="text-sm text-muted-foreground/70">
                  Type at least 2 characters to search
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
