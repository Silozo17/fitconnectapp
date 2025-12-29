import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ScanBarcode, AlertTriangle, Leaf, Milk, Wheat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { BarcodeScannerModal } from "@/components/nutrition/BarcodeScannerModal";
import { cn } from "@/lib/utils";

interface FoodDetails {
  fatsecret_id: string;
  name: string;
  brand_name?: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  saturated_fat_g?: number;
  serving_size_g?: number;
  serving_description?: string;
  allergens?: string[];
  dietary_preferences?: string[];
  image_url?: string;
}

const ALLERGEN_ICONS: Record<string, React.ReactNode> = {
  'Milk': <Milk className="w-3 h-3" />,
  'Dairy': <Milk className="w-3 h-3" />,
  'Gluten': <Wheat className="w-3 h-3" />,
  'Wheat': <Wheat className="w-3 h-3" />,
};

const FoodLookupTool = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodDetails[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const searchFoods = async () => {
    if (query.length < 2) return;

    setIsSearching(true);
    setSelectedFood(null);

    try {
      const { data, error } = await supabase.functions.invoke('fatsecret-search', {
        body: { query, max_results: 15 }
      });

      if (error) throw error;
      setResults(data?.foods || []);
    } catch (error) {
      console.error('Food search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchFoods();
    }
  };

  const handleBarcodeFound = (food: any) => {
    setSelectedFood({
      fatsecret_id: food.fatsecret_id,
      name: food.name,
      calories_per_100g: food.calories_per_100g,
      protein_g: food.protein_g,
      carbs_g: food.carbs_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      serving_size_g: food.serving_size_g,
      serving_description: food.serving_description,
      image_url: food.image_url,
      allergens: food.allergens,
      dietary_preferences: food.dietary_preferences,
    });
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Food Nutrition Lookup</CardTitle>
          <CardDescription>
            Search for any food or scan a barcode to see detailed nutrition information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search foods (e.g., avocado, greek yogurt)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={searchFoods} disabled={query.length < 2 || isSearching}>
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
            <Button variant="outline" onClick={() => setShowScanner(true)}>
              <ScanBarcode className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Results */}
          {results.length > 0 && !selectedFood && (
            <ScrollArea className="h-64 rounded-xl border">
              <div className="p-2 space-y-1">
                {results.map((food) => (
                  <button
                    key={food.fatsecret_id}
                    onClick={() => setSelectedFood(food)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <p className="font-medium truncate">{food.name}</p>
                    {food.brand_name && (
                      <p className="text-xs text-muted-foreground">{food.brand_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round(food.calories_per_100g)} kcal/100g
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Selected Food Details */}
      {selectedFood && (
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedFood.name}</CardTitle>
                {selectedFood.brand_name && (
                  <CardDescription>{selectedFood.brand_name}</CardDescription>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Serving Info */}
            <div className="text-sm text-muted-foreground">
              Per {selectedFood.serving_description || `${selectedFood.serving_size_g || 100}g`}
            </div>

            {/* Main Macros */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-primary/10">
                <p className="text-2xl font-bold text-primary">
                  {Math.round(selectedFood.calories_per_100g)}
                </p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-500/10">
                <p className="text-2xl font-bold text-blue-500">{selectedFood.protein_g}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-500/10">
                <p className="text-2xl font-bold text-amber-500">{selectedFood.carbs_g}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-rose-500/10">
                <p className="text-2xl font-bold text-rose-500">{selectedFood.fat_g}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>

            {/* Detailed Nutrition */}
            <div className="grid grid-cols-2 gap-3">
              {selectedFood.fiber_g !== undefined && (
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Fiber</span>
                  <span className="font-medium">{selectedFood.fiber_g}g</span>
                </div>
              )}
              {selectedFood.sugar_g !== undefined && (
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Sugar</span>
                  <span className="font-medium">{selectedFood.sugar_g}g</span>
                </div>
              )}
              {selectedFood.saturated_fat_g !== undefined && (
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Saturated Fat</span>
                  <span className="font-medium">{selectedFood.saturated_fat_g}g</span>
                </div>
              )}
              {selectedFood.sodium_mg !== undefined && (
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Sodium</span>
                  <span className="font-medium">{selectedFood.sodium_mg}mg</span>
                </div>
              )}
            </div>

            {/* Allergens */}
            {selectedFood.allergens && selectedFood.allergens.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Allergens
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFood.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline" className="border-warning/50 text-warning">
                      {ALLERGEN_ICONS[allergen] || null}
                      <span className="ml-1">{allergen}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Preferences */}
            {selectedFood.dietary_preferences && selectedFood.dietary_preferences.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  Dietary Info
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFood.dietary_preferences.map((pref) => (
                    <Badge key={pref} variant="secondary" className="bg-green-500/10 text-green-500">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <BarcodeScannerModal
        open={showScanner}
        onOpenChange={setShowScanner}
        onFoodFound={handleBarcodeFound}
      />
    </div>
  );
};

export default FoodLookupTool;
