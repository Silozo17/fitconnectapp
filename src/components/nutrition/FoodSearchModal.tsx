import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertTriangle, Plus, Minus } from "lucide-react";
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
  onFoodSelected: (food: FoodResult, quantity: number) => void;
  clientAllergens?: string[];
  initialFood?: {
    external_id: string;
    name: string;
    calories_per_100g: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    allergens?: string[];
  } | null;
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
  initialFood = null,
}: FoodSearchModalProps) => {
  const [query, setQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<AutocompleteSuggestion | null>(null);
  const [quantity, setQuantity] = useState(100);
  const { countryPreference } = useUserLocalePreference();

  const { data: results = [], isLoading: isSearching } = useOpenFoodFactsAutocomplete(
    query,
    open && query.length >= 2,
    countryPreference,
    300
  );

  const hasSearched = query.length >= 2;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedFood(null);
      setQuantity(100);
    }
  }, [open]);

  // Pre-populate with scanned food when provided
  useEffect(() => {
    if (open && initialFood) {
      setSelectedFood({
        external_id: initialFood.external_id,
        barcode: null,
        product_name: initialFood.name,
        brand: null,
        calories_per_100g: initialFood.calories_per_100g,
        protein_g: initialFood.protein_g,
        carbs_g: initialFood.carbs_g,
        fat_g: initialFood.fat_g,
        image_url: null,
        food_type: 'product',
        allergens: initialFood.allergens || [],
      });
      setQuantity(100);
    }
  }, [open, initialFood]);

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    setSelectedFood(suggestion);
    setQuantity(100);
  };

  const handleConfirmAdd = () => {
    if (!selectedFood) return;
    
    const food = suggestionToFood(selectedFood);
    const multiplier = quantity / 100;
    
    onFoodSelected({
      external_id: food.external_id,
      name: food.name,
      brand_name: food.brand_name,
      calories_per_100g: food.calories_per_100g,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      serving_size_g: quantity,
      serving_description: food.serving_description,
      allergens: food.allergens,
    }, quantity);
    onOpenChange(false);
  };

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setQuantity(num);
    } else if (value === "") {
      setQuantity(0);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(0, Math.round((prev + delta) * 10) / 10));
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

  // Calculate scaled macros for selected food
  const getScaledMacros = () => {
    if (!selectedFood) return null;
    const multiplier = quantity / 100;
    return {
      calories: Math.round((selectedFood.calories_per_100g || 0) * multiplier),
      protein: Math.round((selectedFood.protein_g || 0) * multiplier * 10) / 10,
      carbs: Math.round((selectedFood.carbs_g || 0) * multiplier * 10) / 10,
      fat: Math.round((selectedFood.fat_g || 0) * multiplier * 10) / 10,
    };
  };

  const scaledMacros = getScaledMacros();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] flex flex-col p-0 gap-0 overflow-hidden"
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Sticky Header */}
        <DialogHeader className="px-4 pt-4 pb-3 shrink-0 border-b border-border/50">
          <DialogTitle className="text-base">
            {selectedFood ? 'Set Quantity' : `Add to ${MEAL_LABELS[mealType]}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search for foods to add to your meal
          </DialogDescription>
        </DialogHeader>

        {selectedFood ? (
          /* Quantity Editor View */
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
            {/* Selected Food Info */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="font-medium text-sm">{selectedFood.product_name}</p>
              {selectedFood.brand && (
                <p className="text-xs text-muted-foreground mt-0.5">{selectedFood.brand}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Base: {Math.round(selectedFood.calories_per_100g || 0)} kcal per 100g
              </p>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity (grams)</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => adjustQuantity(-10)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="text-center text-lg font-medium h-10"
                  min={0}
                  step={0.1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => adjustQuantity(10)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {/* Quick quantity buttons */}
              <div className="flex gap-2 flex-wrap">
                {[50, 100, 150, 200].map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant={quantity === q ? "default" : "outline"}
                    size="sm"
                    className="flex-1 min-w-[60px]"
                    onClick={() => setQuantity(q)}
                  >
                    {q}g
                  </Button>
                ))}
              </div>
            </div>

            {/* Live Macro Preview */}
            {scaledMacros && (
              <div className="bg-primary/5 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-center">
                  Nutrition for {quantity}g
                </p>
                <div className="text-center">
                  <span className="text-2xl font-bold">{scaledMacros.calories}</span>
                  <span className="text-muted-foreground ml-1">kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-blue-500 font-semibold">{scaledMacros.protein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-amber-500 font-semibold">{scaledMacros.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="bg-background rounded-lg p-2">
                    <p className="text-rose-500 font-semibold">{scaledMacros.fat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedFood(null)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handleConfirmAdd}
                disabled={quantity <= 0}
              >
                Add to {MEAL_LABELS[mealType]}
              </Button>
            </div>
          </div>
        ) : (
          /* Search View */
          <>
            {/* Sticky Search Input */}
            <div className="relative shrink-0 px-4 py-3 border-b border-border/30">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods (e.g., chicken, rice)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-10"
                autoFocus
              />
            </div>

            {/* Scrollable Results */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-2">
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
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-medium text-sm flex-1 break-words" style={{ overflowWrap: 'anywhere' }}>
                                {suggestion.product_name}
                              </p>
                              {hasConflict && (
                                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                              )}
                            </div>
                            {suggestion.brand && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {suggestion.brand}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                              <span>per 100g:</span>
                              <span className="font-medium text-foreground">{Math.round(suggestion.calories_per_100g || 0)} kcal</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span><span className="text-blue-500 font-medium">{suggestion.protein_g || 0}g</span> P</span>
                              <span><span className="text-amber-500 font-medium">{suggestion.carbs_g || 0}g</span> C</span>
                              <span><span className="text-rose-500 font-medium">{suggestion.fat_g || 0}g</span> F</span>
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
                      <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground text-sm">No foods found</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground text-sm">Search for foods</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Type at least 2 characters to search
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
