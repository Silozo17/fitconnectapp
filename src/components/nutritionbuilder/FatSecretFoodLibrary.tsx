import React, { useState } from 'react';
import { Search, Plus, Loader2, Apple, BookmarkCheck, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFatSecretSearch, FatSecretFood } from '@/hooks/useFatSecretSearch';
import { useSaveFood } from '@/hooks/useSaveFood';
import { useFoods, Food, useDeleteFood } from '@/hooks/useFoods';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/hooks/use-toast';

interface FatSecretFoodLibraryProps {
  coachId: string;
  onAddFood: (food: Food) => void;
}

export const FatSecretFoodLibrary: React.FC<FatSecretFoodLibraryProps> = ({
  coachId,
  onAddFood,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // FatSecret API search
  const { 
    data: searchResults, 
    isLoading: isSearching, 
    error: searchError,
    isFetching,
  } = useFatSecretSearch(debouncedQuery, activeTab === 'search');

  // Saved foods from local DB
  const { 
    data: savedFoods, 
    isLoading: isLoadingSaved,
  } = useFoods(undefined, activeTab === 'saved' ? debouncedQuery : undefined);

  const saveFood = useSaveFood();
  const deleteFood = useDeleteFood();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter saved foods to only show FatSecret-sourced foods
  const fatSecretSavedFoods = savedFoods?.filter(f => 
    (f as any).source === 'fatsecret' || (f as any).fatsecret_id
  ) || [];

  const handleRemoveSavedFood = async (food: Food) => {
    setDeletingId(food.id);
    try {
      await deleteFood.mutateAsync(food.id);
      toast({
        title: 'Food removed',
        description: `${food.name} has been removed from your saved foods`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove food. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddFromSearch = async (food: FatSecretFood) => {
    try {
      const savedFood = await saveFood.mutateAsync({ food, coachId });
      onAddFood(savedFood);
      toast({
        title: 'Food added',
        description: `${food.name} has been added to your meal`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add food. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddFromSaved = (food: Food) => {
    onAddFood(food);
    toast({
      title: 'Food added',
      description: `${food.name} has been added to your meal`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {(isSearching || isFetching) && activeTab === 'search' && searchQuery.length >= 2 && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'saved')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4" />
            Saved ({fatSecretSavedFoods.length})
          </TabsTrigger>
        </TabsList>

        {/* Search Results */}
        <TabsContent value="search" className="flex-1 m-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-2">
              {searchQuery.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Apple className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Search for foods to add to your meal plan</p>
                  <p className="text-sm mt-1">Type at least 2 characters</p>
                </div>
              ) : searchError ? (
                <div className="text-center py-8 text-destructive">
                  <p>Failed to search foods</p>
                  <p className="text-sm mt-1">Please try again</p>
                </div>
              ) : !searchResults?.length && !isSearching && !isFetching ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No foods found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                searchResults?.map((food) => (
                  <FoodSearchItem
                    key={food.fatsecret_id}
                    food={food}
                    onAdd={() => handleAddFromSearch(food)}
                    isLoading={saveFood.isPending}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Saved Foods */}
        <TabsContent value="saved" className="flex-1 m-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-2">
              {isLoadingSaved ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !fatSecretSavedFoods.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookmarkCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No saved foods yet</p>
                  <p className="text-sm mt-1">Foods you add will appear here for quick access</p>
                </div>
              ) : (
                fatSecretSavedFoods.map((food) => (
                  <SavedFoodItem
                    key={food.id}
                    food={food}
                    onAdd={() => handleAddFromSaved(food)}
                    onRemove={() => handleRemoveSavedFood(food)}
                    isRemoving={deletingId === food.id}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* FatSecret Attribution */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Powered by <a href="https://www.fatsecret.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">FatSecret</a>
        </p>
      </div>
    </div>
  );
};

// Search result item component
interface FoodSearchItemProps {
  food: FatSecretFood;
  onAdd: () => void;
  isLoading: boolean;
}

const FoodSearchItem: React.FC<FoodSearchItemProps> = ({ food, onAdd, isLoading }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {food.name}
          {food.brand_name && (
            <span className="text-muted-foreground ml-1">({food.brand_name})</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {food.serving_description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {Math.round(food.calories_per_100g)} kcal
          </Badge>
          <span className="text-xs text-muted-foreground">
            P: {food.protein_g}g • C: {food.carbs_g}g • F: {food.fat_g}g
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onAdd}
        disabled={isLoading}
        className="ml-2 shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

// Saved food item component
interface SavedFoodItemProps {
  food: Food;
  onAdd: () => void;
  onRemove: () => void;
  isRemoving: boolean;
}

const SavedFoodItem: React.FC<SavedFoodItemProps> = ({ food, onAdd, onRemove, isRemoving }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{food.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {food.serving_description || `${food.serving_size_g || 100}g serving`}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {Math.round(food.calories_per_100g || 0)} kcal
          </Badge>
          <span className="text-xs text-muted-foreground">
            P: {food.protein_g || 0}g • C: {food.carbs_g || 0}g • F: {food.fat_g || 0}g
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          disabled={isRemoving}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FatSecretFoodLibrary;
