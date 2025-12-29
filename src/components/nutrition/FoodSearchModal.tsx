import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Plus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface FoodResult {
  fatsecret_id: string;
  name: string;
  brand_name?: string;
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
  const [results, setResults] = useState<FoodResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const searchFoods = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('fatsecret-search', {
        body: { query: searchQuery, max_results: 20 }
      });

      if (error) throw error;

      if (data?.foods) {
        setResults(data.foods);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Food search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    searchFoods(debouncedQuery);
  }, [debouncedQuery, searchFoods]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  const handleSelect = (food: FoodResult) => {
    onFoodSelected(food);
    onOpenChange(false);
  };

  const hasAllergenConflict = (food: FoodResult) => {
    if (!food.allergens || !clientAllergens.length) return false;
    return food.allergens.some(a => 
      clientAllergens.some(ca => 
        a.toLowerCase().includes(ca.toLowerCase()) || 
        ca.toLowerCase().includes(a.toLowerCase())
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to {MEAL_LABELS[mealType]}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search foods (e.g., chicken breast, rice)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2 py-2">
              {results.map((food) => {
                const hasConflict = hasAllergenConflict(food);
                return (
                  <button
                    key={food.fatsecret_id}
                    onClick={() => handleSelect(food)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-colors",
                      hasConflict 
                        ? "bg-warning/10 border border-warning/30 hover:bg-warning/20" 
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{food.name}</p>
                          {hasConflict && (
                            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                          )}
                        </div>
                        {food.brand_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {food.brand_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-muted-foreground">
                            {food.serving_description || `${food.serving_size_g || 100}g`}
                          </span>
                          <span className="font-medium">{Math.round(food.calories_per_100g)} kcal/100g</span>
                        </div>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <p><span className="text-blue-500">{food.protein_g}g</span> P</p>
                        <p><span className="text-amber-500">{food.carbs_g}g</span> C</p>
                        <p><span className="text-rose-500">{food.fat_g}g</span> F</p>
                      </div>
                    </div>
                    {hasConflict && food.allergens && (
                      <p className="text-xs text-warning mt-2">
                        Contains: {food.allergens.join(', ')}
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
      </DialogContent>
    </Dialog>
  );
};

export default FoodSearchModal;
