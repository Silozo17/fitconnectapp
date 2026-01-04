import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeTimeInput } from "@/components/ui/native-time-input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Meal, MealFood, calculateMealMacros } from '@/hooks/useFoods';
import { MacroTracker } from './MacroTracker';
import { useTranslation } from '@/hooks/useTranslation';

interface MealCardProps {
  meal: Meal;
  onUpdateMeal: (meal: Meal) => void;
  onDeleteMeal: () => void;
}

export const MealCard = ({ meal, onUpdateMeal, onDeleteMeal }: MealCardProps) => {
  const { t } = useTranslation('coach');
  const [isOpen, setIsOpen] = useState(true);
  const macros = calculateMealMacros(meal.foods);

  const updateMealName = (name: string) => {
    onUpdateMeal({ ...meal, name });
  };

  const updateMealTime = (time: string) => {
    onUpdateMeal({ ...meal, time });
  };

  const updateFoodServings = (foodId: string, servings: number) => {
    const updatedFoods = meal.foods.map((f) =>
      f.id === foodId ? { ...f, servings: Math.max(0.25, servings) } : f
    );
    onUpdateMeal({ ...meal, foods: updatedFoods });
  };

  const removeFood = (foodId: string) => {
    const updatedFoods = meal.foods.filter((f) => f.id !== foodId);
    onUpdateMeal({ ...meal, foods: updatedFoods });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-background/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  value={meal.name}
                  onChange={(e) => updateMealName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-40 bg-background border-border font-medium"
                />
              </div>
              {meal.time && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {meal.time}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <MacroTracker
                calories={macros.calories}
                protein={macros.protein}
                carbs={macros.carbs}
                fat={macros.fat}
                compact
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMeal();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Time Input */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <NativeTimeInput
                value={meal.time || ''}
                onChange={(value) => updateMealTime(value)}
                className="h-8 w-32 bg-background border-border"
              />
            </div>

            {/* Foods List */}
            {meal.foods.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 border border-dashed border-border rounded-lg">
                {t('nutritionBuilder.foodLibrary.addFoodsFromLibrary')}
              </div>
            ) : (
              <div className="space-y-2">
                {meal.foods.map((mealFood) => {
                  const foodMacros = {
                    calories: (mealFood.food.calories_per_100g || 0) * ((mealFood.servings * (mealFood.food.serving_size_g || 100)) / 100),
                    protein: (mealFood.food.protein_g || 0) * ((mealFood.servings * (mealFood.food.serving_size_g || 100)) / 100),
                    carbs: (mealFood.food.carbs_g || 0) * ((mealFood.servings * (mealFood.food.serving_size_g || 100)) / 100),
                    fat: (mealFood.food.fat_g || 0) * ((mealFood.servings * (mealFood.food.serving_size_g || 100)) / 100),
                  };

                  return (
                    <div
                      key={mealFood.id}
                      className="bg-background border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {mealFood.food.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {mealFood.food.serving_description}
                          </div>
                        </div>
                        
                        {/* Serving Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateFoodServings(mealFood.id, mealFood.servings - 0.5)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium">
                            {mealFood.servings}x
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateFoodServings(mealFood.id, mealFood.servings + 0.5)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFood(mealFood.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Food Macros */}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-primary">{Math.round(foodMacros.calories)} cal</span>
                        <span className="text-red-400">P: {Math.round(foodMacros.protein)}g</span>
                        <span className="text-yellow-400">C: {Math.round(foodMacros.carbs)}g</span>
                        <span className="text-blue-400">F: {Math.round(foodMacros.fat)}g</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
